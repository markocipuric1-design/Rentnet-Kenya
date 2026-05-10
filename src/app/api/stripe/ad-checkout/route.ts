import { NextRequest, NextResponse } from "next/server";
import { stripe, APP_URL } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logPayment } from "@/lib/payment-log";

export const AD_PRICES: Record<string, Record<number, number>> = {
  sidebar:            { 7: 1500, 14: 2500, 30: 4000 },
  infeed:             { 7: 2000, 14: 3500, 30: 5500 },
  "featured-partner": { 7: 1000, 14: 1800, 30: 3000 },
};

const PLACEMENT_LABEL: Record<string, string> = {
  sidebar:            "Sidebar Ad (Property Pages)",
  infeed:             "In-feed Ad (Listings Grid)",
  "featured-partner": "Featured Partner Ad",
};

export async function POST(req: NextRequest) {
  try {
  // Accept multipart/form-data so the image file is uploaded server-side
  const formData = await req.formData();

  const advertiser_name  = formData.get("advertiser_name") as string | null;
  const advertiser_email = formData.get("advertiser_email") as string | null;
  const title            = formData.get("title") as string | null;
  const link_url         = formData.get("link_url") as string | null;
  const category         = formData.get("category") as string | null;
  const placementsRaw    = formData.get("placements") as string | null;
  const imageFile        = formData.get("image") as File | null;

  if (!advertiser_name || !advertiser_email || !title || !link_url || !placementsRaw || !imageFile) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const placements: { placement: string; duration_days: number }[] = JSON.parse(placementsRaw);
  if (!placements.length) {
    return NextResponse.json({ error: "Select at least one placement." }, { status: 400 });
  }

  // Capture logged-in user (optional — guests can also advertise)
  let userId: string | null = null;
  try {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    userId = user?.id ?? null;
  } catch { /* not authenticated — that's fine */ }

  // Upload image using service role (bypasses RLS)
  const supabase = createAdminClient();
  const ext = imageFile.name.split(".").pop() ?? "jpg";
  const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("ad-images")
    .upload(path, imageBuffer, { contentType: imageFile.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
  const image_url = urlData.publicUrl;

  // Create one pending ad record per placement
  const adInserts = placements.map((p) => ({
    title,
    image_url,
    link_url,
    placement: p.placement,
    category: p.placement === "featured-partner" ? (category || null) : null,
    duration_days: p.duration_days,
    active: false,
    payment_status: "pending",
    advertiser_name,
    advertiser_email,
    ...(userId ? { user_id: userId } : {}),
  }));

  const { data: insertedAds, error: insertError } = await supabase
    .from("advertisements")
    .insert(adInserts)
    .select("id");

  if (insertError || !insertedAds) {
    return NextResponse.json({ error: `DB insert failed: ${insertError?.message} | code: ${insertError?.code}` }, { status: 500 });
  }

  const adIds = insertedAds.map((a: { id: string }) => a.id).join(",");

  // Store session ID placeholder — will be updated after checkout is created
  const line_items = placements.map((p) => {
    const unitAmount = (AD_PRICES[p.placement]?.[p.duration_days] ?? 0) * 100;
    return {
      price_data: {
        currency: "kes",
        unit_amount: unitAmount,
        product_data: {
          name: `${PLACEMENT_LABEL[p.placement] ?? p.placement} — ${p.duration_days} days`,
          description: `Ad: "${title}" | ${p.duration_days}-day placement`,
        },
      },
      quantity: 1,
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: advertiser_email,
    line_items,
    success_url: `${APP_URL}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/advertise?canceled=true`,
    payment_intent_data: {
      metadata: { type: "ad_purchase", ad_ids: adIds },
    },
    metadata: {
      type: "ad_purchase",
      ad_ids: adIds,
    },
  });

  await supabase
    .from("advertisements")
    .update({ stripe_session_id: session.id })
    .in("id", insertedAds.map((a: { id: string }) => a.id));

  const totalAmount = placements.reduce((sum, p) => sum + (AD_PRICES[p.placement]?.[p.duration_days] ?? 0), 0);
  await logPayment({
    provider: "stripe",
    provider_ref: session.id,
    status: "pending",
    amount: totalAmount,
    payment_type: "ad_purchase",
    user_id: userId,
    user_email: advertiser_email,
    user_name: advertiser_name,
    metadata: { stripe_session_id: session.id, placements },
  });

  return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("[ad-checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
