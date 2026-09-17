import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/require-staff";
import { toAgentSlug } from "@/lib/utils";

const ALLOWED_ACCOUNT_TYPES = new Set(["agencija", "fizicna_oseba"]);

type Body = {
  account_type?: string; full_name?: string; email?: string; phone?: string;
  city?: string; region?: string; bio?: string; avatar_url?: string;
  website?: string; instagram?: string; facebook?: string; linkedin?: string;
  youtube_url?: string; cover_url?: string;
  founded_year?: number | string; employee_count?: number | string;
  specializations?: string[]; service_areas?: string[];
};

function buildProfileFields(body: Body, isAgency: boolean) {
  const fields: Record<string, unknown> = {
    full_name: body.full_name?.trim(),
    email: body.email?.trim(),
    phone: body.phone?.trim(),
    city: body.city?.trim() || null,
    region: body.region?.trim() || null,
    bio: body.bio?.trim() || null,
    avatar_url: body.avatar_url || null,
  };
  if (isAgency) {
    Object.assign(fields, {
      website: body.website?.trim() || null,
      instagram: body.instagram?.trim() || null,
      facebook: body.facebook?.trim() || null,
      linkedin: body.linkedin?.trim() || null,
      youtube_url: body.youtube_url?.trim() || null,
      cover_url: body.cover_url || null,
      founded_year: body.founded_year ? parseInt(String(body.founded_year)) : null,
      employee_count: body.employee_count ? parseInt(String(body.employee_count)) : null,
      specializations: body.specializations?.length ? body.specializations : null,
      service_areas: body.service_areas?.length ? body.service_areas : null,
    });
  }
  return fields;
}

export async function POST(req: NextRequest) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;

    const body = await req.json() as Body;
    const { account_type } = body;

    if (!account_type || !ALLOWED_ACCOUNT_TYPES.has(account_type)) {
      return NextResponse.json({ error: "Invalid account_type" }, { status: 400 });
    }
    if (!body.full_name?.trim() || !body.email?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: body.email.trim(),
      email_confirm: true,
      user_metadata: { full_name: body.full_name.trim(), account_type },
    });
    if (createErr || !created.user) {
      return NextResponse.json({ error: createErr?.message ?? "Could not create account" }, { status: 400 });
    }

    const base = toAgentSlug(body.full_name);
    let slug = base;
    let attempt = 1;
    while (true) {
      const { data: existing } = await admin.from("profiles").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${base}-${attempt}`;
    }

    const isAgency = account_type === "agencija";

    const { error: profileErr } = await admin.from("profiles").insert({
      ...buildProfileFields(body, isAgency),
      id: created.user.id,
      account_type,
      slug,
      profile_status: "active",
      verified: isAgency,
      subscription_status: isAgency ? "active" : null,
      staff_managed: true,
      created_by: staff.profile.id,
    });

    if (profileErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    return NextResponse.json({ id: created.user.id, slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[staff-profiles POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
