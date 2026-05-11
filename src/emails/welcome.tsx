import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

interface WelcomeEmailProps {
  name?: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <EmailLayout preview={`Welcome to Rentnet, ${firstName}!`}>
      <Text style={{ fontSize: "22px", fontWeight: "800", color: "#18181b", margin: "0 0 8px" }}>
        Welcome to Rentnet, {firstName}! 👋
      </Text>
      <Text style={{ fontSize: "14px", color: "#71717a", lineHeight: "1.6", margin: "0 0 24px" }}>
        You&apos;re now part of Kenya&apos;s leading real estate platform. Whether you&apos;re buying, renting, or listing a property — we&apos;ve got you covered.
      </Text>

      <Hr style={{ borderColor: "#e4e4e7", margin: "0 0 24px" }} />

      <Text style={{ fontSize: "13px", fontWeight: "700", color: "#18181b", margin: "0 0 12px" }}>
        Here&apos;s what you can do:
      </Text>

      {[
        ["🔍", "Browse thousands of listings across Kenya"],
        ["❤️", "Save favourites and get alerts on new matches"],
        ["📋", "Post your own property listing in minutes"],
        ["💬", "Message agents and landlords directly"],
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
        Questions? Reply to this email or contact us at{" "}
        <a href="mailto:info@rentnet.co.ke" style={{ color: "#7c3aed" }}>info@rentnet.co.ke</a>
      </Text>
    </EmailLayout>
  );
}
