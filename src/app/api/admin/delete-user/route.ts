import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteAllUserData } from "@/lib/delete-user-data";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: callerProfile } = await supabase
      .from("profiles").select("account_type").eq("id", user.id).single();
    if (callerProfile?.account_type !== "administrator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await req.json() as { userId?: string };
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own account from here." }, { status: 400 });
    }

    const admin = createAdminClient();
    await deleteAllUserData(admin, userId);
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[delete-user]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
