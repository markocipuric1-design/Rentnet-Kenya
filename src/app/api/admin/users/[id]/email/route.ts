import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Administrator-only: change any user's login email. Unlike the
 * staff-profiles route, this isn't scoped to staff_managed profiles —
 * full admins can fix email for any account. Updates both the real
 * credential in auth.users and the display copy in profiles.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: caller } = await supabase.from("profiles").select("account_type").eq("id", user.id).single();
    if (caller?.account_type !== "administrator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { email } = await req.json() as { email?: string };
    if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error: authErr } = await admin.auth.admin.updateUserById(id, {
      email: email.trim(),
      email_confirm: true,
    });
    if (authErr) return NextResponse.json({ error: `Could not update login email: ${authErr.message}` }, { status: 500 });

    const { error: profileErr } = await admin.from("profiles").update({ email: email.trim() }).eq("id", id);
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/users email PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
