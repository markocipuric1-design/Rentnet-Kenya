import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check for existing subscription
    const { data: existing } = await admin
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ duplicate: true });
    }

    const { error } = await admin
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase() });

    if (error) {
      console.error("[subscribe] insert error:", error.message);
      return NextResponse.json({ error: "Could not save subscription." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[subscribe] caught error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
