import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const desc = "Simple, transparent pricing for property listings and advertising on Rentnet Kenya. Free listings available. Agency subscriptions from KES 5,000/month.";

export const metadata: Metadata = {
  title: "Pricing – List & Advertise Your Property | Rentnet",
  description: desc,
  alternates: { canonical: "https://rentnet.co.ke/pricing" },
  openGraph: {
    title: "Pricing – List & Advertise Your Property | Rentnet",
    description: desc,
    url: "https://rentnet.co.ke/pricing",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Pricing Plans Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing – List & Advertise Your Property | Rentnet",
    description: desc,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Offer",
  "@id": "https://rentnet.co.ke/pricing",
  "name": "Rentnet Property Listing & Advertising Packages",
  "description": desc,
  "url": "https://rentnet.co.ke/pricing",
  "seller": { "@id": "https://rentnet.co.ke/#organization" },
  "priceCurrency": "KES",
  "areaServed": { "@type": "Country", "name": "Kenya" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense>{children}</Suspense>
    </>
  );
}
