import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/require-staff";
import { toAgentSlug } from "@/lib/utils";

const ALLOWED_ACCOUNT_TYPES = new Set(["agencija", "fizicna_oseba"]);

export async function POST(req: NextRequest) {
  try {
    const staff = await requireStaff();
    if ("error" in staff) return staff.error;

    const body = await req.json();
    const {
      account_type, full_name, email, phone, city, region, bio, website,
    } = body as {
      account_type?: string; full_name?: string; email?: string; phone?: string;
      city?: string; region?: string; bio?: string; website?: string;
    };

    if (!account_type || !ALLOWED_ACCOUNT_TYPES.has(account_type)) {
      return NextResponse.json({ error: "Invalid account_type" }, { status: 400 });
    }
    if (!full_name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: email.trim(),
      email_confirm: true,
      user_metadata: { full_name: full_name.trim(), account_type },
    });
    if (createErr || !created.user) {
      return NextResponse.json({ error: createErr?.message ?? "Could not create account" }, { status: 400 });
    }

    const base = toAgentSlug(full_name);
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
      id: created.user.id,
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city?.trim() || null,
      region: region?.trim() || null,
      bio: bio?.trim() || null,
      website: isAgency ? (website?.trim() || null) : null,
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
