import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  read_time: number;
  created_at: string;
};

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
  return new Date(iso).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export async function BlogPreview() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image_url, category, read_time, created_at")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  const posts = data ?? [];
  if (posts.length < 2) return null;

  const [p0, p1, p2, p3] = posts;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <BookOpen className="h-3.5 w-3.5" /> From the Blog
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
            Real estate insights & tips
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Market trends, investment advice, legal guides and more.
          </p>
        </div>
        <Link
          href="/blog"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all flex-shrink-0 mb-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">

        {/* ── Large card — top-left, col-span-2 × row-1 ── */}
        <Link
          href={`/blog/${p0.slug}`}
          className="lg:col-span-2 group overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
        >
          <div className="relative h-52 w-full overflow-hidden flex-shrink-0">
            <Image
              src={p0.cover_image_url ?? PLACEHOLDER}
              alt={p0.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className={`absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${categoryColor(p0.category)}`}>
              {p0.category}
            </span>
          </div>
          <div className="flex flex-col flex-1 p-6">
            <h3 className="font-extrabold text-foreground text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {p0.title}
            </h3>
            {p0.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{p0.excerpt}</p>
            )}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {p0.read_time} min read · {formatDate(p0.created_at)}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Read <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>

        {/* ── Tall card — right col, row-span-2 ── */}
        <Link
          href={`/blog/${p1.slug}`}
          className="lg:row-span-2 group overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
        >
          <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
            <Image
              src={p1.cover_image_url ?? PLACEHOLDER}
              alt={p1.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className={`absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${categoryColor(p1.category)}`}>
              {p1.category}
            </span>
          </div>
          <div className="flex flex-col flex-1 p-6">
            <h3 className="font-extrabold text-foreground text-base leading-snug group-hover:text-primary transition-colors mb-3">
              {p1.title}
            </h3>
            {p1.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-5 flex-1 leading-relaxed">{p1.excerpt}</p>
            )}
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {p1.read_time} min · {formatDate(p1.created_at)}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Read <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>

        {/* ── Small card — bottom-left ── */}
        {p2 && (
          <Link
            href={`/blog/${p2.slug}`}
            className="group overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <div className="relative h-36 w-full overflow-hidden flex-shrink-0">
              <Image
                src={p2.cover_image_url ?? PLACEHOLDER}
                alt={p2.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor(p2.category)}`}>
                {p2.category}
              </span>
            </div>
            <div className="flex flex-col flex-1 p-4">
              <p className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug flex-1">
                {p2.title}
              </p>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-3 pt-3 border-t border-border">
                <Clock className="h-3 w-3" /> {p2.read_time} min · {formatDate(p2.created_at)}
              </span>
            </div>
          </Link>
        )}

        {/* ── Small card — bottom-right (of 2-col area) ── */}
        {p3 && (
          <Link
            href={`/blog/${p3.slug}`}
            className="group overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <div className="relative h-36 w-full overflow-hidden flex-shrink-0">
              <Image
                src={p3.cover_image_url ?? PLACEHOLDER}
                alt={p3.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor(p3.category)}`}>
                {p3.category}
              </span>
            </div>
            <div className="flex flex-col flex-1 p-4">
              <p className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug flex-1">
                {p3.title}
              </p>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-3 pt-3 border-t border-border">
                <Clock className="h-3 w-3" /> {p3.read_time} min · {formatDate(p3.created_at)}
              </span>
            </div>
          </Link>
        )}

      </div>

      {/* Mobile — view all */}
      <div className="mt-6 sm:hidden text-center">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          View all posts <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </section>
  );
}
