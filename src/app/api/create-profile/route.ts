import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  if (!rateLimit(`create-profile:${getIp(req)}`, 5, 60_000))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const { userId, payload, ext } = await req.json();

  if (!userId || !payload) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify the user actually exists in auth
  const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ALLOWED_PAYLOAD_FIELDS = new Set([
    "full_name", "phone", "avatar_url", "cover_url", "bio", "location", "youtube_url",
  ]);
  const ALLOWED_EXT_FIELDS = new Set([
    "account_type", "agency_name", "agency_license", "agency_address",
  ]);
  const SAFE_ACCOUNT_TYPES = new Set(["fisicna", "agencija"]);

  function pickFields(obj: Record<string, unknown>, allowed: Set<string>) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => allowed.has(k)));
  }

  const safePayload = pickFields(payload as Record<string, unknown>, ALLOWED_PAYLOAD_FIELDS);

  const { data: settingsRows } = await adminClient.from("site_settings").select("key, value");
  const settings = Object.fromEntries((settingsRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  const profileModerationOn = settings["profile_moderation_enabled"] === "true";

  const { error: profileError } = await adminClient.from("profiles").upsert({
    ...safePayload,
    id: userId,
    profile_status: profileModerationOn ? "pending" : "active",
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (ext && Object.keys(ext).length > 0) {
    const safeExt = pickFields(ext as Record<string, unknown>, ALLOWED_EXT_FIELDS);
    if (safeExt.account_type && !SAFE_ACCOUNT_TYPES.has(safeExt.account_type as string)) {
      delete safeExt.account_type;
    }
    if (Object.keys(safeExt).length > 0) {
      await adminClient.from("profiles").upsert({ ...safeExt, id: userId }).then(() => {}, () => {});
    }
  }

  return NextResponse.json({ success: true, profileModerationOn });
}
