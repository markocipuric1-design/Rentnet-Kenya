import { HeroVariantC } from "@/components/ui/hero-variant-c";
import { CategorySlider } from "@/components/sections/category-slider";
import { Listings } from "@/components/sections/listings";
import { Categories } from "@/components/sections/categories";
import { HowItWorks } from "@/components/sections/how-it-works";
import { BentoFeatures } from "@/components/sections/bento-features";
import { AgentCta } from "@/components/sections/agent-cta";
import { AdvertiseCta } from "@/components/sections/advertise-cta";
import { Regions } from "@/components/sections/regions";
import { Testimonials } from "@/components/sections/testimonials";
import { NewsletterSubscribe } from "@/components/sections/newsletter-subscribe";
import { BlogPreview } from "@/components/sections/blog-preview";
import { Footer } from "@/components/sections/footer";
import { AdBanner } from "@/components/ui/ad-banner";
import { createClient } from "@/lib/supabase/server";
import { PiggyBank, Truck } from "lucide-react";

function pickRandom<T>(arr: T[]): T | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

export default async function Home() {
  const supabase = await createClient();
  const { data: homepageAds } = await supabase
    .from("advertisements")
    .select("id, title, image_url, link_url")
    .eq("placement", "homepage")
    .eq("active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  const ads = homepageAds ?? [];
  const ad1 = pickRandom(ads);
  const ad2 = pickRandom(ads.filter((a) => a.id !== ad1?.id).length ? ads.filter((a) => a.id !== ad1?.id) : ads);

  return (
    <>
      <HeroVariantC />
      <CategorySlider />
      <Listings />

      {ad1 ? (
        <AdBanner
          eyebrow="Sponsored"
          title={ad1.title}
          cta="Learn more"
          href={ad1.link_url}
          logoImage={ad1.image_url}
        />
      ) : (
        <AdBanner
          eyebrow="Partner offer"
          title="Find the best home loans — no hidden fees"
          description="Get a fixed mortgage rate from leading Kenyan banks. Loan simulation in 2 minutes, no commitment required."
          cta="Calculate instalment"
          badge="Up to 25-year repayment"
          logo={<PiggyBank className="h-7 w-7 text-primary" />}
        />
      )}

      <Categories />
      <AdvertiseCta />
      <HowItWorks />
      <BentoFeatures />
      <AgentCta />
      <Regions />

      {ad2 ? (
        <AdBanner
          eyebrow="Sponsored"
          title={ad2.title}
          cta="Learn more"
          href={ad2.link_url}
          logoImage={ad2.image_url}
        />
      ) : (
        <AdBanner
          eyebrow="Partner service"
          title="Stress-free moving — professional movers across Kenya"
          description="We take care of packing, transport and furniture placement. Free cost estimate within 24 hours."
          cta="Get a quote"
          badge="Free estimate"
          logo={<Truck className="h-7 w-7 text-primary" />}
        />
      )}

      <Testimonials />
      <NewsletterSubscribe />
      <BlogPreview />
      <Footer />
    </>
  );
}
