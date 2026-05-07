import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Details | Rentnet",
  description: "Property details — gallery, description, location map and agent contact.",
};

export default function PropertyLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
