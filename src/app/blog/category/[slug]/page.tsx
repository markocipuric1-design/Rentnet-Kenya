import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Tag } from "lucide-react";
import { PostCard } from "../../post-card";

const CATEGORY_MAP: Record<string, string> = {
  "general": "General",
  "market-trends": "Market Trends",
  "tips": "Tips",
  "news": "News",
  "investment": "Investment",
  "legal": "Legal",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "General": "General real estate articles and guides for Kenya property seekers.",
  "Market Trends": "Kenya property market analysis, price trends and insights for buyers and investors.",
  "Tips": "Practical tips for buying, selling and renting property in Kenya.",
  "News": "Latest real estate news and property market updates from Kenya.",
  "Investment": "Property investment strategies, rental yields and market opportunities in Kenya.",
  "Legal": "Legal guides, tenancy agreements and compliance advice for Kenya real estate.",
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug];
  if (!category) return { title: "Not found" };
  const description = CATEGORY_DESCRIPTIONS[category];
  const canonical = `https://rentnet.co.ke/blog/category/${slug}`;
  return {
    title: `${category} – Real Estate Blog | Rentnet`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${category} – Real Estate Blog | Rentnet`,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category} – Real Estate Blog | Rentnet`,
      description,
    },
  };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORY_MAP[slug];
  if (!category) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image_url, category, featured, read_time, author_name, created_at")
    .eq("published", true)
    .eq("category", category)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const posts = data ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category}</span>
        </nav>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Tag className="h-3.5 w-3.5" /> {category}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            {category}
          </h1>
          <p className="text-muted-foreground max-w-xl">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">No posts yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for {category.toLowerCase()} articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
