import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { EnquiryEmail } from "@/emails/enquiry";

export async function POST(req: NextRequest) {
  const { agentEmail, agentName, senderName, senderEmail, senderPhone, listingTitle, listingUrl, message } =
    await req.json();

  if (!agentEmail || !senderName || !senderEmail || !listingTitle || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const html = await render(
    EnquiryEmail({ agentName, senderName, senderEmail, senderPhone, listingTitle, listingUrl, message })
  );

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: agentEmail,
    replyTo: senderEmail,
    subject: `New enquiry on "${listingTitle}"`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
