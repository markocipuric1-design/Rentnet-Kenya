import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { NewSignupNotification } from "@/emails/new-signup-notification";

const ADMIN_NOTIFICATION_EMAIL = "grem.hitro@gmail.com";

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

  // Must match exactly what src/app/signup/page.tsx sends in corePayload / ext.
  const ALLOWED_PAYLOAD_FIELDS = new Set([
    "full_name", "email", "phone", "account_type", "avatar_url", "cover_url",
    "location", "youtube_url", "website", "instagram", "facebook", "linkedin",
    "specializations", "employee_count", "founded_year",
  ]);
  const ALLOWED_EXT_FIELDS = new Set(["city", "region", "bio"]);
  const SAFE_ACCOUNT_TYPES = new Set(["fizicna_oseba", "agencija", "partner"]);

  function pickFields(obj: Record<string, unknown>, allowed: Set<string>) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => allowed.has(k)));
  }

  const safePayload = pickFields(payload as Record<string, unknown>, ALLOWED_PAYLOAD_FIELDS);
  if (safePayload.account_type && !SAFE_ACCOUNT_TYPES.has(safePayload.account_type as string)) {
    delete safePayload.account_type;
  }

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
    if (Object.keys(safeExt).length > 0) {
      const { error: extError } = await adminClient.from("profiles").upsert({ ...safeExt, id: userId });
      if (extError) console.error("[create-profile] ext upsert failed:", extError.message);
    }
  }

  // Notify the admin — never let this block or fail the signup itself.
  try {
    const html = await render(NewSignupNotification({
      fullName: (safePayload.full_name as string | undefined) ?? "—",
      email: (safePayload.email as string | undefined) ?? authUser.user.email ?? "—",
      accountType: (safePayload.account_type as string | undefined) ?? "—",
    }));
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `New signup: ${(safePayload.full_name as string | undefined) ?? "New user"}`,
      html,
    });
  } catch (e) {
    console.error("[create-profile] admin notification failed:", e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ success: true, profileModerationOn });
}
