import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff, canManage } from "@/lib/require-staff";
import { deleteAllUserData } from "@/lib/delete-user-data";

const EDITABLE_FIELDS = new Set([
  "full_name", "email", "phone", "city", "region", "bio", "avatar_url", "verified", "profile_status",
  "website", "instagram", "facebook", "linkedin", "youtube_url", "cover_url",
  "founded_year", "employee_count", "specializations", "service_areas",
]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json() as Record<string, unknown>;
    const update = Object.fromEntries(Object.entries(body).filter(([k]) => EDITABLE_FIELDS.has(k)));
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const { error } = await admin.from("profiles").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-profiles PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await deleteAllUserData(admin, id);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-profiles DELETE]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
