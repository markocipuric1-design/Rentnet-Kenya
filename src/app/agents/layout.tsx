import type { Metadata } from "next";

const desc = "Find trusted real estate agents and agencies across Kenya. Compare ratings, specialisations and experience on Rentnet.";

export const metadata: Metadata = {
  title: "Verified Real Estate Agents in Kenya | Rentnet",
  description: desc,
  alternates: { canonical: "https://rentnet.co.ke/agents" },
  openGraph: {
    title: "Verified Real Estate Agents in Kenya | Rentnet",
    description: desc,
    url: "https://rentnet.co.ke/agents",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Verified Agents Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Real Estate Agents in Kenya | Rentnet",
    description: desc,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://rentnet.co.ke/agents",
  "name": "Verified Real Estate Agents in Kenya",
  "description": desc,
  "url": "https://rentnet.co.ke/agents",
  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
