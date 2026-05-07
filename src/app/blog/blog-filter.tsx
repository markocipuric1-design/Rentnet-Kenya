"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, Tag } from "lucide-react";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  featured: boolean;
  read_time: number;
  author_name: string | null;
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
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export function BlogFilter({ initialPosts }: { initialPosts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(initialPosts.map((p) => p.category)))];
  const filtered = activeCategory === "All" ? initialPosts : initialPosts.filter((p) => p.category === activeCategory);
  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured || p !== featured);

  if (filtered.length === 0) return null;

  return (
    <>
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat !== "All" && <Tag className="h-3 w-3" />} {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">

        {/* Bento top row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col min-h-[360px]"
            >
              <div className="relative h-56 overflow-hidden flex-shrink-0">
                <Image
                  src={featured.cover_image_url ?? PLACEHOLDER}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className={`absolute top-4 left-4 text-[11px] font-bold px-2.5 py-1 rounded-full ${categoryColor(featured.category)}`}>
                  {featured.category}
                </span>
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                  Featured
                </span>
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h2 className="font-extrabold text-foreground text-xl leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{featured.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.read_time} min read</span>
                    <span>{formatDate(featured.created_at)}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          <div className="flex flex-col gap-4">
            {rest.slice(0, featured ? 2 : 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex-1"
              >
                <div className="relative h-32 overflow-hidden flex-shrink-0">
                  <Image
                    src={post.cover_image_url ?? PLACEHOLDER}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-3">
                    <Clock className="h-3 w-3" /> {post.read_time} min · {formatDate(post.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Remaining posts */}
        {rest.slice(featured ? 2 : 3).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {rest.slice(featured ? 2 : 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={post.cover_image_url ?? PLACEHOLDER}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {post.read_time} min · {formatDate(post.created_at)}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
