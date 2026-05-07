import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Rentnet – Buy, Rent & Sell Property in Kenya",
    template: "%s | Rentnet",
  },
  description:
    "Find houses, apartments, land and commercial properties for sale or rent across Kenya. Browse thousands of verified listings and connect with agents on Rentnet.",
  keywords: [
    "Kenya real estate", "houses for sale Kenya", "apartments for rent Nairobi",
    "property Kenya", "land for sale Kenya", "Nairobi real estate", "Mombasa property",
    "rent house Kenya", "buy property Kenya", "Rentnet",
  ],
  authors: [{ name: "Rentnet" }],
  metadataBase: new URL("https://rentnet.co.ke"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "Rentnet",
    title: "Rentnet – Buy, Rent & Sell Property in Kenya",
    description:
      "Find houses, apartments, land and commercial properties for sale or rent across Kenya. Thousands of verified listings.",
    url: "https://rentnet.co.ke",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet – Kenya Real Estate" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rentnet_ke",
    title: "Rentnet – Buy, Rent & Sell Property in Kenya",
    description: "Find houses, apartments, land and commercial properties for sale or rent across Kenya.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://rentnet.co.ke/#organization",
                  "name": "Rentnet",
                  "url": "https://rentnet.co.ke",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://rentnet.co.ke/logo.png",
                    "width": 200,
                    "height": 60,
                  },
                  "sameAs": ["https://twitter.com/rentnet_ke"],
                  "description": "Kenya's real estate platform for buying, selling and renting property across all 47 counties.",
                  "areaServed": { "@type": "Country", "name": "Kenya" },
                  "knowsAbout": ["Real Estate", "Property Management", "Kenya Property Market"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://rentnet.co.ke/#website",
                  "name": "Rentnet",
                  "url": "https://rentnet.co.ke",
                  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://rentnet.co.ke/listings?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <CookieBanner />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
