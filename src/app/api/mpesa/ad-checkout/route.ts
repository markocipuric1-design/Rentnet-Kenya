import { NextRequest, NextResponse } from "next/server";
import { intasend, AD_PRICES, normalisePhone } from "@/lib/intasend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logPayment } from "@/lib/payment-log";
import sharp from "sharp";

const PLACEMENT_LABEL: Record<string, string> = {
  sidebar:            "Sidebar Ad (Property Pages)",
  infeed:             "In-feed Ad (Listings Grid)",
  "featured-partner": "Featured Partner Ad",
  homepage:           "Homepage Banner Ad",
};

const PLACEMENT_SHORT: Record<string, string> = {
  sidebar:            "Sidebar",
  infeed:             "In-feed",
  "featured-partner": "Partner",
  homepage:           "Homepage",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const advertiser_name  = formData.get("advertiser_name") as string | null;
    const advertiser_email = formData.get("advertiser_email") as string | null;
    const phone_raw        = formData.get("phone_number") as string | null;
    const title            = formData.get("title") as string | null;
    const link_url         = formData.get("link_url") as string | null;
    const category         = formData.get("category") as string | null;
    const placementsRaw    = formData.get("placements") as string | null;
    const imageFile        = formData.get("image") as File | null;

    if (!advertiser_name || !advertiser_email || !phone_raw || !title || !link_url || !placementsRaw || !imageFile) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const placements: { placement: string; duration_days: number }[] = JSON.parse(placementsRaw);
    if (!placements.length) {
      return NextResponse.json({ error: "Select at least one placement." }, { status: 400 });
    }

    const phone_number = normalisePhone(phone_raw);

    // Capture logged-in user (optional — guests can also advertise)
    let userId: string | null = null;
    try {
      const serverClient = await createClient();
      const { data: { user } } = await serverClient.auth.getUser();
      userId = user?.id ?? null;
    } catch { /* not authenticated */ }

    // Upload image via service role (bypasses RLS)
    const supabase = createAdminClient();
    const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const rawBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageBuffer = await sharp(rawBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(path, imageBuffer, { contentType: "image/webp", upsert: false });

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
      return NextResponse.json({ error: `DB insert failed: ${insertError?.message}` }, { status: 500 });
    }

    const adIds = insertedAds.map((a: { id: string }) => a.id).join(",");

    // Compute total amount
    const amount = placements.reduce((sum, p) => sum + (AD_PRICES[p.placement]?.[p.duration_days] ?? 0), 0);

    const narrative = placements
      .map((p) => `${PLACEMENT_SHORT[p.placement] ?? p.placement} ${p.duration_days}d`)
      .join(", ")
      .slice(0, 72);

    // Initiate STK Push
    const response = await intasend.collection().mpesaStkPush({
      phone_number,
      email: advertiser_email,
      amount,
      narrative,
      api_ref: adIds,
    });

    const invoiceId: string = response?.invoice?.invoice_id ?? response?.id;
    if (!invoiceId) {
      return NextResponse.json({ error: "Failed to initiate M-Pesa payment. Please try again." }, { status: 502 });
    }

    await supabase
      .from("advertisements")
      .update({ mpesa_checkout_id: invoiceId })
      .in("id", insertedAds.map((a: { id: string }) => a.id));

    await logPayment({
      provider: "mpesa",
      provider_ref: adIds,
      status: "pending",
      amount,
      payment_type: "ad_purchase",
      user_id: userId,
      user_email: advertiser_email,
      user_name: advertiser_name,
      metadata: { invoice_id: invoiceId, placements },
    });

    return NextResponse.json({ checkout_id: invoiceId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[mpesa/ad-checkout]", msg);
    return NextResponse.json({ error: `Payment initiation failed: ${msg}` }, { status: 500 });
  }
}
