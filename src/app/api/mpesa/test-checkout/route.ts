import { NextRequest, NextResponse } from "next/server";
import { intasend, normalisePhone } from "@/lib/intasend";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, email")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "administrator") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { phone_number: phone_raw } = await req.json();
  if (!phone_raw) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

  try {
    const response = await intasend.collection().mpesaStkPush({
      phone_number: normalisePhone(phone_raw),
      email: profile.email ?? user.email,
      amount: 5,
      narrative: "Rentnet live payment test — KES 5",
      api_ref: `test:${user.id}:${Date.now()}`,
    });

    const invoiceId: string = response?.invoice?.invoice_id ?? response?.id;
    if (!invoiceId) {
      return NextResponse.json({ error: "No invoice ID returned from IntaSend" }, { status: 502 });
    }

    return NextResponse.json({ checkout_id: invoiceId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
