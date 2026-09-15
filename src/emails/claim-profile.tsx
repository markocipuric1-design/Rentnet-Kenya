import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

interface ClaimProfileEmailProps {
  name?: string;
  claimUrl: string;
}

export function ClaimProfileEmail({ name, claimUrl }: ClaimProfileEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <EmailLayout preview="Your profile on Rentnet is ready to claim">
      <Text style={{ fontSize: "22px", fontWeight: "800", color: "#18181b", margin: "0 0 8px" }}>
        Hi {firstName}, your Rentnet profile is ready
      </Text>
      <Text style={{ fontSize: "14px", color: "#71717a", lineHeight: "1.6", margin: "0 0 24px" }}>
        Our team has set up a profile for you on Rentnet, Kenya&apos;s leading real estate platform, along with any listings already added. Set a password to log in and take it over — edit your details, add new listings, and manage everything yourself.
      </Text>

      <Button
        href={claimUrl}
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
        Set your password →
      </Button>

      <Hr style={{ borderColor: "#e4e4e7", margin: "24px 0" }} />

      <Text style={{ fontSize: "12px", color: "#a1a1aa" }}>
        If you weren&apos;t expecting this, you can ignore this email or contact us at{" "}
        <a href="mailto:info@rentnet.co.ke" style={{ color: "#7c3aed" }}>info@rentnet.co.ke</a>
      </Text>
    </EmailLayout>
  );
}
