import { createAdminClient } from "@/lib/supabase/admin";
import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { ClaimProfileEmail } from "@/emails/claim-profile";

/**
 * Emails the claim link to whatever email is already on file for a
 * staff-managed profile. Used by both the admin "Invite" button and the
 * public self-service "Claim this business" button — callers never pass an
 * email in; it's always looked up server-side so a claim can only ever reach
 * the real address on record, never one supplied by the requester.
 */
export async function sendClaimInvite(admin: ReturnType<typeof createAdminClient>, profileId: string) {
  const { data: target } = await admin
    .from("profiles").select("staff_managed, full_name, email").eq("id", profileId).single();

  if (!target) return { error: "Not found", status: 404 as const };
  if (!target.staff_managed) return { error: "This profile isn't staff-managed", status: 400 as const };
  if (!target.email) return { error: "Profile has no email on file", status: 400 as const };

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: target.email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` },
  });
  if (linkErr || !linkData) {
    return { error: linkErr?.message ?? "Could not generate claim link", status: 500 as const };
  }

  const html = await render(ClaimProfileEmail({ name: target.full_name ?? undefined, claimUrl: linkData.properties.action_link }));
  const { error: sendErr } = await resend.emails.send({
    from: FROM_EMAIL,
    to: target.email,
    subject: "Your profile on Rentnet is ready to claim",
    html,
  });
  if (sendErr) return { error: "Failed to send invite email", status: 500 as const };

  return { ok: true as const };
}
