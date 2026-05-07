import Link from "next/link";
import { FileText, Zap, BookOpen, TrendingUp } from "lucide-react";
import type { CrossLink } from "@/lib/cross-links";

const TYPE_CONFIG = {
  document: { Icon: FileText, iconClass: "text-primary", bgClass: "bg-primary/10" },
  service:  { Icon: Zap,      iconClass: "text-emerald-600", bgClass: "bg-emerald-500/10" },
  advise:   { Icon: BookOpen, iconClass: "text-violet-600",  bgClass: "bg-violet-500/10" },
  page:     { Icon: TrendingUp, iconClass: "text-sky-600",   bgClass: "bg-sky-500/10" },
};

export function ResourceCallout({
  links,
  title = "Relevant Resources",
}: {
  links: CrossLink[];
  title?: string;
}) {
  return (
    <div className="my-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((link) => {
          const { Icon, iconClass, bgClass } = TYPE_CONFIG[link.type];
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center mt-0.5`}>
                <Icon className={`h-4 w-4 ${iconClass}`} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
