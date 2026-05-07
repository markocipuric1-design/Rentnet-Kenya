import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const desc = "Browse houses, apartments, land and commercial properties for sale or rent across Kenya. Filter by location, price, and size.";

export const metadata: Metadata = {
  title: "Property Listings in Kenya | Rentnet",
  description: desc,
  alternates: { canonical: "https://rentnet.co.ke/listings" },
  openGraph: {
    title: "Property Listings in Kenya | Rentnet",
    description: desc,
    url: "https://rentnet.co.ke/listings",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Kenya Property Listings" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Listings in Kenya | Rentnet",
    description: desc,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://rentnet.co.ke/listings",
  "name": "Property Listings in Kenya",
  "description": desc,
  "url": "https://rentnet.co.ke/listings",
  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense>{children}</Suspense>
    </>
  );
}
