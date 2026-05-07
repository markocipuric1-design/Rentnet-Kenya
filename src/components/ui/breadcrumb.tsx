"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rentnet.co.ke";

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={className}>
        <ol
          className="flex items-center flex-wrap gap-1 text-xs text-muted-foreground"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1;
            return (
              <li
                key={i}
                className="flex items-center gap-1"
                itemScope
                itemProp="itemListElement"
                itemType="https://schema.org/ListItem"
              >
                {i === 0 && <Home className="h-3 w-3 flex-shrink-0" aria-hidden="true" />}
                {isLast ? (
                  <span
                    className="text-foreground font-medium line-clamp-1"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href!}
                    className="hover:text-primary transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}
                <meta itemProp="position" content={String(i + 1)} />
                {!isLast && (
                  <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/50" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
