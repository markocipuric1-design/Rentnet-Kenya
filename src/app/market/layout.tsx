import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kenya Property Market Data & Trends | Rentnet",
  description: "Live market statistics for the Kenya real estate market — median prices, price per m², rental yields and trends by city and property type.",
  alternates: { canonical: "https://rentnet.co.ke/market" },
  openGraph: {
    title: "Kenya Property Market Data & Trends | Rentnet",
    description: "Live market statistics for the Kenya real estate market — median prices, price per m², rental yields and trends by city and property type.",
    url: "https://rentnet.co.ke/market",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Kenya Market Data" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenya Property Market Data & Trends | Rentnet",
    description: "Live market statistics for the Kenya real estate market — median prices, price per m², rental yields and trends by city and property type.",
  },
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
