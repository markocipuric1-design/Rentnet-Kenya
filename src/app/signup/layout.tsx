import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Rentnet",
  description: "Create a free Rentnet account and start listing or searching for properties across Kenya.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
