import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Dashboard | Rentnet",
  description: "Manage your property listings, saved homes, messages, reviews and account settings on Rentnet Kenya.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
