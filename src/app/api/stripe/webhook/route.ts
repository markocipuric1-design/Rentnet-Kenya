import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { updatePaymentStatus } from "@/lib/payment-log";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  const updateSubscription = async (sub: Stripe.Subscription) => {
    const userId = sub.metadata?.supabase_user_id;
    if (!userId) return;

    const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;
    await supabase.from("profiles").update({
      stripe_subscription_id: sub.id,
      subscription_status: status,
    }).eq("id", userId);
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // ── Ad purchase (one-time payment) ──────────────────────────────
      if (session.mode === "payment" && session.metadata?.type === "ad_purchase") {
        const adIds = session.metadata.ad_ids?.split(",").filter(Boolean) ?? [];
        if (adIds.length > 0) {
          for (const adId of adIds) {
            // Fetch the ad to get duration_days
            const { data: ad } = await supabase
              .from("advertisements")
              .select("duration_days")
              .eq("id", adId)
              .single();

            const durationDays = ad?.duration_days ?? 30;
            const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

            await supabase
              .from("advertisements")
              .update({
                active: true,
                payment_status: "paid",
                expires_at: expiresAt,
                stripe_session_id: session.id,
              })
              .eq("id", adId);
          }
        }
        break;
      }

      // ── Agency subscription ──────────────────────────────────────────
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          const profileUpdate: Record<string, string | boolean> = {
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: sub.id,
            subscription_status: "active",
          };
          if (sub.metadata?.activate_agency === "true") {
            profileUpdate.account_type = "agencija";
            profileUpdate.verified = true;
          }
          await supabase.from("profiles").update(profileUpdate).eq("id", userId);
        }
        await updatePaymentStatus(session.id, "complete");
      }

      // ── Ad purchase complete ─────────────────────────────────────────
      if (session.mode === "payment" && session.metadata?.type === "ad_purchase") {
        await updatePaymentStatus(session.id, "complete");
      }
      break;
    }
    case "customer.subscription.updated":
      await updateSubscription(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await supabase.from("profiles").update({
          stripe_subscription_id: null,
          subscription_status: "inactive",
        }).eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
