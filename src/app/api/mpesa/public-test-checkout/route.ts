import { NextRequest, NextResponse } from "next/server";
import { intasend, normalisePhone } from "@/lib/intasend";

export async function POST(req: NextRequest) {
  const password = process.env.TEST_PAYMENT_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Test payments not configured" }, { status: 503 });
  }

  const { phone_number: phone_raw, password: submitted } = await req.json();

  if (!submitted || submitted !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  if (!phone_raw) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  try {
    const response = await intasend.collection().mpesaStkPush({
      phone_number: normalisePhone(phone_raw),
      email: "test@rentnet.co.ke",
      amount: 5,
      narrative: "Rentnet live payment test — KES 5",
      api_ref: `test:public:${Date.now()}`,
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
