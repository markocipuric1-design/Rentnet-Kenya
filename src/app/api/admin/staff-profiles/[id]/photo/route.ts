import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff, canManage } from "@/lib/require-staff";

const ALLOWED_KINDS = new Set(["avatar", "cover"]);

/**
 * Uploading a photo for someone else's profile can't go through the browser
 * client — storage RLS scopes uploads to the uploader's own auth.uid()
 * folder, and an editor uploading a logo for the agency they just created is
 * uploading into a folder that isn't theirs. This route does it server-side
 * with the service-role key instead.
 */
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

    const form = await req.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || typeof kind !== "string" || !ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "Missing or invalid file/kind" }, { status: 400 });
    }

    const path = `${id}/${kind}.webp`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadErr } = await admin.storage.from("avatars").upload(path, buffer, { upsert: true, contentType: "image/webp" });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

    const { data: urlData } = admin.storage.from("avatars").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;

    const column = kind === "avatar" ? "avatar_url" : "cover_url";
    const { error: updateErr } = await admin.from("profiles").update({ [column]: url }).eq("id", id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-profiles photo]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
