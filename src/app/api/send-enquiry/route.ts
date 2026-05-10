import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { EnquiryEmail } from "@/emails/enquiry";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  if (!rateLimit(`enquiry:${getIp(req)}`, 5, 60_000))
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });

  const { ownerUserId, agentName, senderName, senderEmail, senderPhone, listingTitle, listingUrl, message } =
    await req.json();

  if (!senderName || !senderEmail || !listingTitle || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Look up owner email from their profile
  let agentEmail = "";
  if (ownerUserId) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("email")
      .eq("id", ownerUserId)
      .single();
    agentEmail = profile?.email ?? "";
  }

  if (!agentEmail) {
    return NextResponse.json({ error: "Owner email not found" }, { status: 404 });
  }

  const html = await render(
    EnquiryEmail({ agentName: agentName ?? "the owner", senderName, senderEmail, senderPhone, listingTitle, listingUrl, message })
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
