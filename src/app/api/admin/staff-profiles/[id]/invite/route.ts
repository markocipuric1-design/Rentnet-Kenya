import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff, canManage } from "@/lib/require-staff";
import { sendClaimInvite } from "@/lib/send-claim-invite";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;
    const { id } = await params;

    const admin = createAdminClient();
    const { data: target } = await admin.from("profiles").select("staff_managed").eq("id", id).single();
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canManage(staff.profile, target)) {
      return NextResponse.json({ error: "Unauthorized — editors can only manage staff-created profiles" }, { status: 403 });
    }

    const result = await sendClaimInvite(admin, id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-profiles invite]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
