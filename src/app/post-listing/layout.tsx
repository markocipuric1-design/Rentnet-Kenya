import type { Metadata } from "next";

const desc = "List your property for sale or rent on Rentnet — Kenya's real estate platform. Reach thousands of buyers and tenants across Nairobi, Mombasa, Kisumu and all 47 counties.";

export const metadata: Metadata = {
  title: "Post a Property Listing in Kenya | Rentnet",
  description: desc,
  alternates: { canonical: "https://rentnet.co.ke/post-listing" },
  keywords: ["post property Kenya", "list house for sale Nairobi", "rent out apartment Kenya", "property listing Kenya", "sell house Nairobi", "Rentnet"],
  openGraph: {
    title: "Post a Property Listing in Kenya | Rentnet",
    description: desc,
    url: "https://rentnet.co.ke/post-listing",
    siteName: "Rentnet",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Post a Property Listing – Rentnet Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Post a Property Listing in Kenya | Rentnet",
    description: desc,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": "https://rentnet.co.ke/post-listing",
  "name": "How to Post a Property Listing in Kenya",
  "description": desc,
  "url": "https://rentnet.co.ke/post-listing",
  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Create your account", "text": "Sign up for a free Rentnet account using your email or phone number." },
    { "@type": "HowToStep", "position": 2, "name": "Choose property type", "text": "Select whether your property is for sale or rent, and choose the property type — house, apartment, land or commercial." },
    { "@type": "HowToStep", "position": 3, "name": "Add property details", "text": "Enter the location, price, size, number of rooms and a detailed description." },
    { "@type": "HowToStep", "position": 4, "name": "Upload photos", "text": "Add clear photos of the property to attract more serious enquiries." },
    { "@type": "HowToStep", "position": 5, "name": "Publish your listing", "text": "Review your listing and publish it to reach thousands of buyers and tenants across Kenya." },
  ],
};

export default function PostListingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
