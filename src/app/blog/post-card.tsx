import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";

export type PostCardData = {
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

export function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground";
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link
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
  );
}
