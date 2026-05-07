import type { Metadata } from "next";

const desc = "Find verified real estate agencies across Kenya. Browse agency profiles, listings, and reviews on Rentnet.";

export const metadata: Metadata = {
  title: "Real Estate Agencies in Kenya | Rentnet",
  description: desc,
  alternates: { canonical: "https://rentnet.co.ke/agencies" },
  openGraph: {
    title: "Real Estate Agencies in Kenya | Rentnet",
    description: desc,
    url: "https://rentnet.co.ke/agencies",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Real Estate Agencies Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Agencies in Kenya | Rentnet",
    description: desc,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://rentnet.co.ke/agencies",
  "name": "Real Estate Agencies in Kenya",
  "description": desc,
  "url": "https://rentnet.co.ke/agencies",
  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
};

export default function AgenciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
