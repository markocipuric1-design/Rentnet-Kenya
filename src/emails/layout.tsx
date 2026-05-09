import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "Inter, -apple-system, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", padding: "0 16px" }}>

          {/* Header */}
          <Section style={{ backgroundColor: "#7c3aed", borderRadius: "12px 12px 0 0", padding: "24px 32px" }}>
            <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", margin: 0 }}>
              🏠 Rentnet
            </Text>
            <Text style={{ color: "#ddd6fe", fontSize: "12px", margin: "4px 0 0" }}>
              Kenya&apos;s real estate platform
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "0 0 12px 12px", border: "1px solid #e4e4e7", borderTop: "none" }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ padding: "20px 0", textAlign: "center" as const }}>
            <Text style={{ color: "#a1a1aa", fontSize: "11px", margin: 0 }}>
              © 2025 Rentnet · Nairobi, Kenya
            </Text>
            <Text style={{ color: "#a1a1aa", fontSize: "11px", margin: "4px 0 0" }}>
              <Link href="https://rentnet.co.ke/privacy-policy" style={{ color: "#a1a1aa" }}>Privacy</Link>
              {" · "}
              <Link href="https://rentnet.co.ke/terms" style={{ color: "#a1a1aa" }}>Terms</Link>
              {" · "}
              <Link href="https://rentnet.co.ke/data-deletion" style={{ color: "#a1a1aa" }}>Data Deletion</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
