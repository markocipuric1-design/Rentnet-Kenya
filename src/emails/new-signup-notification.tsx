import { Text, Hr } from "@react-email/components";
import { EmailLayout } from "./layout";

interface NewSignupNotificationProps {
  fullName: string;
  email: string;
  accountType: string;
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  fizicna_oseba: "Individual",
  agencija: "Agency",
  partner: "Business Partner",
};

export function NewSignupNotification({ fullName, email, accountType }: NewSignupNotificationProps) {
  return (
    <EmailLayout preview={`New signup: ${fullName}`}>
      <Text style={{ fontSize: "18px", fontWeight: "800", color: "#18181b", margin: "0 0 16px" }}>
        New account created
      </Text>

      {[
        ["Name", fullName],
        ["Email", email],
        ["Account type", ACCOUNT_TYPE_LABEL[accountType] ?? accountType],
      ].map(([label, value]) => (
        <Text key={label} style={{ fontSize: "13px", color: "#52525b", margin: "0 0 6px" }}>
          <strong style={{ color: "#18181b" }}>{label}:</strong> {value}
        </Text>
      ))}

      <Hr style={{ borderColor: "#e4e4e7", margin: "20px 0" }} />

      <Text style={{ fontSize: "12px", color: "#a1a1aa", margin: 0 }}>
        Automated notification — sent whenever a new user completes registration on Rentnet.
      </Text>
    </EmailLayout>
  );
}
