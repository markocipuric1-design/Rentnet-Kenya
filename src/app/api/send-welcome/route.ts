import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { WelcomeEmail } from "@/emails/welcome";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const html = await render(WelcomeEmail({ name }));

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to Rentnet 🏠",
    html,
  });

  if (error) {
    console.error("Resend welcome error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
