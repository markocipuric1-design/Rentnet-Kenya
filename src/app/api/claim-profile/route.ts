import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TRIAL_DAYS = 14;

/**
 * Called right after a user sets a password on /reset-password. If they're
 * claiming a staff-created (staff_managed) profile for the first time, this
 * hands it over to them: staff_managed turns off, and — for agencies — a
 * 14-day trial clock starts via trial_ends_at (kept separate from
 * subscription_expires_at, which is only ever set by the real mpesa/Stripe
 * payment flows). A normal user resetting their own password is a no-op.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles").select("account_type, staff_managed").eq("id", user.id).single();

  if (!profile?.staff_managed) return NextResponse.json({ claimed: false });

  const trialEndsAt = profile.account_type === "agencija"
    ? new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : null;

  await admin.from("profiles").update({
    staff_managed: false,
    ...(trialEndsAt ? { trial_ends_at: trialEndsAt, subscription_status: "active" } : {}),
  }).eq("id", user.id);

  return NextResponse.json({ claimed: true, trialEndsAt });
}
