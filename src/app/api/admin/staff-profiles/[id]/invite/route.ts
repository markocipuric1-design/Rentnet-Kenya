import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff, canManage } from "@/lib/require-staff";
import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { ClaimProfileEmail } from "@/emails/claim-profile";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;
    const { id } = await params;

    const admin = createAdminClient();
    const { data: target } = await admin
      .from("profiles").select("staff_managed, full_name, email").eq("id", id).single();
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canManage(staff.profile, target)) {
      return NextResponse.json({ error: "Unauthorized — editors can only manage staff-created profiles" }, { status: 403 });
    }
    if (!target.email) return NextResponse.json({ error: "Profile has no email on file" }, { status: 400 });

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: target.email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` },
    });
    if (linkErr || !linkData) {
      return NextResponse.json({ error: linkErr?.message ?? "Could not generate claim link" }, { status: 500 });
    }

    const html = await render(ClaimProfileEmail({ name: target.full_name ?? undefined, claimUrl: linkData.properties.action_link }));
    const { error: sendErr } = await resend.emails.send({
      from: FROM_EMAIL,
      to: target.email,
      subject: "Your profile on Rentnet is ready to claim",
      html,
    });
    if (sendErr) return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-profiles invite]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
