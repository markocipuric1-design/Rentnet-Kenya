import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff, canManage } from "@/lib/require-staff";
import { generateListingSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;

    const body = await req.json() as Record<string, unknown> & { owner_id?: string; photos?: string[] };
    const { owner_id, photos, ...fields } = body;
    if (!owner_id) return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    if (!fields.title || !fields.type || !fields.category || fields.price == null) {
      return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: owner } = await admin.from("profiles").select("staff_managed").eq("id", owner_id).single();
    if (!owner) return NextResponse.json({ error: "Owner profile not found" }, { status: 404 });
    if (!canManage(staff.profile, owner)) {
      return NextResponse.json({ error: "Unauthorized — editors can only add listings for staff-created profiles" }, { status: 403 });
    }

    const { data: listing, error } = await admin.from("listings").insert({
      ...fields,
      user_id: owner_id,
      status: fields.status ?? "active",
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const base = generateListingSlug(String(fields.title));
    let slug = base;
    let attempt = 1;
    while (true) {
      const { data: existing } = await admin.from("listings").select("id").eq("slug", slug).neq("id", listing.id).maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${base}-${attempt}`;
    }
    await admin.from("listings").update({ slug }).eq("id", listing.id);

    if (Array.isArray(photos) && photos.length > 0) {
      await admin.from("listing_photos").insert(
        photos.map((url, i) => ({ listing_id: listing.id, url, position: i }))
      );
    }

    return NextResponse.json({ id: listing.id, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-listings POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
