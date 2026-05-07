"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  ctaHref?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
}

interface BentoGridProps {
  items: BentoItem[];
}

function BentoGrid({ items }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl mx-auto">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "group relative p-5 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer",
            "border border-border bg-card",
            "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40",
            "hover:-translate-y-0.5 will-change-transform",
            item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
            item.hasPersistentHover && "shadow-md shadow-primary/8 border-primary/30"
          )}
        >
          {/* Dot pattern on hover */}
          <div className={`absolute inset-0 pointer-events-none ${item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-300`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:16px_16px]" />
          </div>

          <div className="relative flex flex-col space-y-3">
            {/* Icon + status */}
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent transition-all duration-300 group-hover:bg-primary/15">
                {item.icon}
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {item.status || "Aktivno"}
              </span>
            </div>

            {/* Title + description */}
            <div className="space-y-1.5">
              <h3 className="font-semibold text-foreground text-[15px] tracking-tight">
                {item.title}
                {item.meta && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">{item.meta}</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            {/* Tags + CTA */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags?.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              {item.cta && (
                item.ctaHref ? (
                  <a
                    href={item.ctaHref}
                    onClick={e => e.stopPropagation()}
                    className="group/cta inline-flex items-center gap-1 text-xs font-semibold text-primary/60 hover:text-primary transition-colors duration-200"
                  >
                    {item.cta}
                    <ArrowRight className="h-3 w-3 translate-x-0 group-hover/cta:translate-x-0.5 transition-transform duration-200" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary/60">
                    {item.cta}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { BentoGrid };
