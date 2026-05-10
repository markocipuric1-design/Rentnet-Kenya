import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, AGENCY_PRICE_ID, APP_URL } from "@/lib/stripe";
import { logPayment } from "@/lib/payment-log";
import { AGENCY_ANNUAL_PRICE_KES } from "@/lib/intasend";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type, stripe_customer_id, full_name, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: `Profile not found: ${profileError?.message}` }, { status: 400 });
  }

  if (profile.account_type === "administrator") {
    return NextResponse.json({ error: "Administratorji ne morejo naročiti tega paketa." }, { status: 403 });
  }

  let customerId = (profile.stripe_customer_id ?? null) as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email ?? user.email,
      name: profile.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: AGENCY_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?subscription=success`,
    cancel_url: `${APP_URL}/pricing?canceled=true`,
    subscription_data: { metadata: { supabase_user_id: user.id, activate_agency: "true" } },
    allow_promotion_codes: true,
    billing_address_collection: "required",
  });

  await logPayment({
    provider: "stripe",
    provider_ref: session.id,
    status: "pending",
    amount: AGENCY_ANNUAL_PRICE_KES,
    payment_type: "agency_subscription",
    user_id: user.id,
    user_email: profile.email ?? user.email,
    user_name: profile.full_name,
    metadata: { stripe_session_id: session.id },
  });

  return NextResponse.json({ url: session.url });
}
