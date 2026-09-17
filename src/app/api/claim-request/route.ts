import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendClaimInvite } from "@/lib/send-claim-invite";
import { rateLimit, getIp } from "@/lib/rate-limit";

/**
 * Public, unauthenticated "Claim this business" button on agency/listing
 * pages. Never accepts an email — it only ever sends to whatever's already
 * on file for the profile, so it can't be used to redirect a claim to an
 * attacker-controlled address. Rate-limited per IP and per profile to stop
 * it being used to spam a real business's inbox.
 */
export async function POST(req: NextRequest) {
  try {
    const { profileId } = await req.json() as { profileId?: string };
    if (!profileId) return NextResponse.json({ error: "Missing profileId" }, { status: 400 });

    if (!rateLimit(`claim-request:ip:${getIp(req)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    if (!rateLimit(`claim-request:profile:${profileId}`, 3, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const admin = createAdminClient();
    const result = await sendClaimInvite(admin, profileId);
    if ("error" in result) {
      // Don't leak whether the profile exists / is staff-managed to the client.
      if (result.status === 404 || result.status === 400) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[claim-request]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
