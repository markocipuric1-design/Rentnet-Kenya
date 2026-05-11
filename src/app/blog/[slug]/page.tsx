import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Clock, Calendar, Tag, BookOpen } from "lucide-react";
import { blogCategoryLinks } from "@/lib/cross-links";
import { ResourceCallout } from "@/components/ui/resource-callout";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  featured: boolean;
  read_time: number;
  author_name: string | null;
  created_at: string;
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CATEGORY_COLORS: Record<string, string> = {
  "Market Trends": "bg-primary/10 text-primary",
  "Tips": "bg-emerald-500/10 text-emerald-600",
  "News": "bg-sky-500/10 text-sky-600",
  "Investment": "bg-amber-500/10 text-amber-600",
  "Legal": "bg-violet-500/10 text-violet-600",
  "General": "bg-muted text-muted-foreground",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image_url, category, author_name, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Post not found" };

  const title = post.title;
  const description = post.excerpt
    ?? `${post.category} article on the Rentnet Kenya real estate blog.`;
  const canonical = `https://rentnet.co.ke/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      ...(post.cover_image_url && {
        images: [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, cover_image_url, cover_image_alt, category, featured, read_time, author_name, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, slug, title, cover_image_url, category, read_time, created_at, excerpt, featured, author_name")
    .eq("published", true)
    .eq("category", post.category)
    .neq("id", post.id)
    .limit(3);

  const relatedPosts = (related ?? []) as Post[];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt ?? undefined,
    "url": `https://rentnet.co.ke/blog/${slug}`,
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    ...(post.cover_image_url && {
      "image": {
        "@type": "ImageObject",
        "url": post.cover_image_url,
        "width": 1200,
        "height": 630,
      },
    }),
    "author": {
      "@type": post.author_name ? "Person" : "Organization",
      "name": post.author_name ?? "Rentnet Editorial",
      ...(post.author_name ? {} : { "url": "https://rentnet.co.ke" }),
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://rentnet.co.ke/#organization",
      "name": "Rentnet",
      "logo": { "@type": "ImageObject", "url": "https://rentnet.co.ke/logo.png" },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://rentnet.co.ke/blog/${slug}` },
    "articleSection": post.category,
    "keywords": ["Kenya real estate", "property Kenya", post.category],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <Link href={`/blog/category/${slugify(post.category)}`} className="hover:text-primary transition-colors">{post.category}</Link>
        </nav>

        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Link href={`/blog/category/${slugify(post.category)}`} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity ${categoryColor(post.category)}`}>
            <Tag className="h-3 w-3" /> {post.category}
          </Link>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {post.read_time} min read
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> {formatDate(post.created_at)}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary/30 pl-4">
            {post.excerpt}
          </p>
        )}

        {post.author_name && (
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
              {post.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author_name}</p>
              <p className="text-xs text-muted-foreground">Rentnet Editorial</p>
            </div>
          </div>
        )}

        {post.cover_image_url && (
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-10">
            <Image
              src={post.cover_image_url}
              alt={post.cover_image_alt ?? post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {post.content ? (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-extrabold prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-li:text-muted-foreground
              prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
              prose-code:text-primary prose-code:bg-primary/8 prose-code:px-1 prose-code:rounded
              prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-muted-foreground italic">No content yet.</p>
        )}

        {blogCategoryLinks[post.category] && (
          <ResourceCallout
            links={blogCategoryLinks[post.category]}
            title="Explore Related Resources"
          />
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="font-extrabold text-foreground text-xl mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> More in {post.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="relative h-32 overflow-hidden flex-shrink-0">
                    <Image
                      src={r.cover_image_url ?? PLACEHOLDER}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 256px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-xs text-foreground line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {r.read_time} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
