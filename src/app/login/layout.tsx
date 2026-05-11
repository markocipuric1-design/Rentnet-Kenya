import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In | Rentnet",
  description: "Sign in to your Rentnet account to manage listings, messages and more.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) { return <Suspense>{children}</Suspense>; }
