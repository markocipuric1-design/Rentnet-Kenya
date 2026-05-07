import type { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";
import { BlogFilter } from "./blog-filter";

export const metadata: Metadata = {
  title: "Blog – Kenya Real Estate Insights | Rentnet",
  description: "Expert advice, market trends, investment tips and property news for Kenya real estate buyers, sellers and renters.",
  alternates: { canonical: "https://rentnet.co.ke/blog" },
  openGraph: {
    title: "Blog – Kenya Real Estate Insights | Rentnet",
    description: "Expert advice, market trends, investment tips and property news for Kenya real estate buyers, sellers and renters.",
    url: "https://rentnet.co.ke/blog",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Kenya Real Estate Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog – Kenya Real Estate Insights | Rentnet",
    description: "Expert advice, market trends, investment tips and property news for Kenya real estate buyers, sellers and renters.",
  },
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image_url, category, featured, read_time, author_name, created_at")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const posts = data ?? [];

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://rentnet.co.ke/blog",
    "name": "Rentnet Blog – Kenya Real Estate",
    "description": "Expert advice, market trends, investment tips and property news for Kenya real estate buyers, sellers and renters.",
    "url": "https://rentnet.co.ke/blog",
    "publisher": { "@id": "https://rentnet.co.ke/#organization" },
    ...(posts.length > 0 && {
      "blogPost": posts.map((p) => ({
        "@type": "BlogPosting",
        "headline": p.title,
        "url": `https://rentnet.co.ke/blog/${p.slug}`,
        "datePublished": p.created_at,
        "description": p.excerpt ?? undefined,
        "image": p.cover_image_url ?? undefined,
      })),
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <BookOpen className="h-3.5 w-3.5" /> Rentnet Blog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Real estate insights &amp; news
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Market trends, investment tips, legal guides and the latest property news from across Kenya.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">No posts yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for articles and insights.</p>
          </div>
        ) : (
          <BlogFilter initialPosts={posts} />
        )}

      </main>

      <Footer />
    </div>
  );
}
