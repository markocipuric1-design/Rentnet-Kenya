import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

interface ProfileFixApologyEmailProps {
  name?: string;
}

export function ProfileFixApologyEmail({ name }: ProfileFixApologyEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <EmailLayout preview="A quick update on your Rentnet account">
      <Text style={{ fontSize: "20px", fontWeight: "800", color: "#18181b", margin: "0 0 8px" }}>
        Hi {firstName}, quick update on your account
      </Text>
      <Text style={{ fontSize: "14px", color: "#71717a", lineHeight: "1.6", margin: "0 0 20px" }}>
        We found and fixed a bug that affected your profile when you signed up — some of your account details weren&apos;t saved correctly on our end. That&apos;s now fully corrected, and your account is ready to use. Sorry for the inconvenience.
      </Text>

      <Hr style={{ borderColor: "#e4e4e7", margin: "0 0 20px" }} />

      <Text style={{ fontSize: "13px", fontWeight: "700", color: "#18181b", margin: "0 0 12px" }}>
        While you&apos;re here, Rentnet has:
      </Text>
      {[
        ["🔍", "Thousands of listings across Kenya — houses, apartments, land and commercial"],
        ["❤️", "Saved searches with alerts when new matches appear"],
        ["📋", "A free way to post your own listing in minutes"],
      ].map(([icon, text]) => (
        <Text key={text} style={{ fontSize: "13px", color: "#52525b", margin: "0 0 8px" }}>
          {icon} {text}
        </Text>
      ))}

      <Hr style={{ borderColor: "#e4e4e7", margin: "24px 0" }} />

      <Button
        href="https://rentnet.co.ke/listings"
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
        Browse Listings →
      </Button>

      <Text style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "24px" }}>
        Questions? Reply to this email or reach us at{" "}
        <a href="mailto:info@rentnet.co.ke" style={{ color: "#7c3aed" }}>info@rentnet.co.ke</a>
      </Text>
    </EmailLayout>
  );
}
