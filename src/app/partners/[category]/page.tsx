import type { Metadata } from "next";
import { partnerCategoriesData } from "@/lib/content-data";
import { PartnerDirectoryClient } from "./partners-client";

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const cat = partnerCategoriesData.find((c) => c.slug === category);

  if (!cat) {
    return { title: "Partner Directory | Rentnet" };
  }

  const title = `${cat.title} in Kenya | Rentnet`;
  const description = cat.longDescription ?? cat.description;
  const canonical = `https://rentnet.co.ke/partners/${category}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${cat.title} – Rentnet Kenya` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PartnerCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = partnerCategoriesData.find((c) => c.slug === category);

  const jsonLd = cat
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `https://rentnet.co.ke/partners/${category}`,
        "name": `${cat.title} in Kenya`,
        "description": cat.longDescription ?? cat.description,
        "url": `https://rentnet.co.ke/partners/${category}`,
        "publisher": { "@id": "https://rentnet.co.ke/#organization" },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <PartnerDirectoryClient />
    </>
  );
}
