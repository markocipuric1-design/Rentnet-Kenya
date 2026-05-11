import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage & Rental Yield Calculator Kenya | Rentnet",
  description: "Calculate monthly mortgage payments and rental yield for any property in Kenya. Free tool for buyers and investors.",
  alternates: { canonical: "https://rentnet.co.ke/tools/mortgage-calculator" },
  keywords: ["mortgage calculator Kenya", "rental yield calculator Kenya", "property investment Kenya", "home loan calculator Nairobi"],
  openGraph: {
    title: "Mortgage & Rental Yield Calculator | Rentnet Kenya",
    description: "Free mortgage and rental yield calculator for Kenya property buyers and investors.",
    url: "https://rentnet.co.ke/tools/mortgage-calculator",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
