import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff, canManage } from "@/lib/require-staff";

async function loadOwner(admin: ReturnType<typeof createAdminClient>, listingId: string) {
  const { data: listing } = await admin.from("listings").select("user_id").eq("id", listingId).single();
  if (!listing) return null;
  const { data: owner } = await admin.from("profiles").select("staff_managed").eq("id", listing.user_id).single();
  return owner;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;
    const { id } = await params;

    const admin = createAdminClient();
    const owner = await loadOwner(admin, id);
    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canManage(staff.profile, owner)) {
      return NextResponse.json({ error: "Unauthorized — editors can only manage listings of staff-created profiles" }, { status: 403 });
    }

    const { photos, ...fields } = await req.json() as Record<string, unknown> & { photos?: string[] };
    delete fields.user_id; // ownership isn't editable through this endpoint

    if (Object.keys(fields).length > 0) {
      const { error } = await admin.from("listings").update(fields).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (Array.isArray(photos)) {
      await admin.from("listing_photos").delete().eq("listing_id", id);
      if (photos.length > 0) {
        await admin.from("listing_photos").insert(photos.map((url, i) => ({ listing_id: id, url, position: i })));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-listings PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;
    const { id } = await params;

    const admin = createAdminClient();
    const owner = await loadOwner(admin, id);
    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canManage(staff.profile, owner)) {
      return NextResponse.json({ error: "Unauthorized — editors can only manage listings of staff-created profiles" }, { status: 403 });
    }

    await admin.from("listing_photos").delete().eq("listing_id", id);
    await admin.from("listing_views").delete().eq("listing_id", id);
    const { error } = await admin.from("listings").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-listings DELETE]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
