import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

interface EnquiryEmailProps {
  agentName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  listingTitle: string;
  listingUrl: string;
  message: string;
}

export function EnquiryEmail({
  agentName,
  senderName,
  senderEmail,
  senderPhone,
  listingTitle,
  listingUrl,
  message,
}: EnquiryEmailProps) {
  return (
    <EmailLayout preview={`New enquiry on "${listingTitle}" from ${senderName}`}>
      <Text style={{ fontSize: "22px", fontWeight: "800", color: "#18181b", margin: "0 0 4px" }}>
        New enquiry 📩
      </Text>
      <Text style={{ fontSize: "14px", color: "#71717a", margin: "0 0 24px" }}>
        Someone is interested in your listing.
      </Text>

      {/* Listing */}
      <div style={{ backgroundColor: "#fafafa", borderRadius: "8px", padding: "14px 16px", border: "1px solid #e4e4e7", marginBottom: "20px" }}>
        <Text style={{ fontSize: "11px", fontWeight: "700", color: "#a1a1aa", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Listing
        </Text>
        <Text style={{ fontSize: "14px", fontWeight: "700", color: "#18181b", margin: 0 }}>
          {listingTitle}
        </Text>
      </div>

      {/* Sender info */}
      <Text style={{ fontSize: "13px", fontWeight: "700", color: "#18181b", margin: "0 0 10px" }}>
        From
      </Text>
      {[
        ["Name", senderName],
        ["Email", senderEmail],
        ...(senderPhone ? [["Phone", senderPhone]] : []),
      ].map(([label, value]) => (
        <Text key={label} style={{ fontSize: "13px", color: "#52525b", margin: "0 0 4px" }}>
          <span style={{ fontWeight: "600", color: "#18181b" }}>{label}:</span> {value}
        </Text>
      ))}

      <Hr style={{ borderColor: "#e4e4e7", margin: "20px 0" }} />

      {/* Message */}
      <Text style={{ fontSize: "13px", fontWeight: "700", color: "#18181b", margin: "0 0 8px" }}>
        Message
      </Text>
      <div style={{ backgroundColor: "#f4f4f5", borderRadius: "8px", padding: "14px 16px", border: "1px solid #e4e4e7" }}>
        <Text style={{ fontSize: "13px", color: "#52525b", lineHeight: "1.6", margin: 0 }}>
          {message}
        </Text>
      </div>

      <Hr style={{ borderColor: "#e4e4e7", margin: "24px 0" }} />

      <Button
        href={listingUrl}
        style={{
          backgroundColor: "#7c3aed",
          color: "#ffffff",
          borderRadius: "10px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "700",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        View Listing →
      </Button>

      <Text style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "20px" }}>
        Reply directly to this email to respond to {senderName}.
      </Text>
    </EmailLayout>
  );
}
