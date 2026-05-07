import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Profile | Rentnet",
  description: "Real estate agent profile — active listings, client reviews and contact details.",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
