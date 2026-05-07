import type { Metadata } from "next";

const desc = "Promote your business to thousands of active property seekers on Rentnet Kenya. Sidebar banners, in-feed cards, featured partner spots and homepage banners available.";

export const metadata: Metadata = {
  title: "Advertise on Rentnet – Reach Kenya Property Seekers",
  description: desc,
  alternates: { canonical: "https://rentnet.co.ke/advertise" },
  openGraph: {
    title: "Advertise on Rentnet – Reach Kenya Property Seekers",
    description: desc,
    url: "https://rentnet.co.ke/advertise",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Advertise on Rentnet Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertise on Rentnet – Reach Kenya Property Seekers",
    description: desc,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://rentnet.co.ke/advertise",
  "name": "Advertising on Rentnet Kenya",
  "description": desc,
  "url": "https://rentnet.co.ke/advertise",
  "provider": { "@id": "https://rentnet.co.ke/#organization" },
  "areaServed": { "@type": "Country", "name": "Kenya" },
  "serviceType": "Digital Advertising",
};

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
