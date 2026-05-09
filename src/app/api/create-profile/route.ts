import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, payload, ext } = await req.json();

  if (!userId || !payload) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify the user actually exists in auth
  const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: settingsRows } = await adminClient.from("site_settings").select("key, value");
  const settings = Object.fromEntries((settingsRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  const profileModerationOn = settings["profile_moderation_enabled"] === "true";

  const { error: profileError } = await adminClient.from("profiles").upsert({
    ...payload,
    id: userId,
    profile_status: profileModerationOn ? "pending" : "active",
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (ext && Object.keys(ext).length > 0) {
    await adminClient.from("profiles").upsert({ ...ext, id: userId }).then(() => {}, () => {});
  }

  return NextResponse.json({ success: true, profileModerationOn });
}
