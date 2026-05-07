"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, KeyRound, Landmark, ShieldCheck, Star,
  Sofa, Calculator, Megaphone, Wrench, ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  {
    slug: "agencies",
    label: "Real Estate Agencies",
    desc: "Licensed agencies for buyers, sellers, landlords and tenants.",
    href: "/partners/agencies",
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    glow: "from-primary/10 to-transparent",
  },
  {
    slug: "rentnet-agents",
    label: "Rentnet Agents",
    desc: "Verified agents on the Rentnet platform.",
    href: "/partners/rentnet-agents",
    icon: KeyRound,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "from-sky-500/10 to-transparent",
  },
  {
    slug: "bank",
    label: "Banks & Mortgages",
    desc: "Mortgage and property finance products in Kenya.",
    href: "/partners/bank",
    icon: Landmark,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "from-emerald-500/10 to-transparent",
  },
  {
    slug: "insurance",
    label: "Insurance",
    desc: "Home, landlord and tenant contents insurance.",
    href: "/partners/insurance",
    icon: ShieldCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "from-blue-500/10 to-transparent",
  },
  {
    slug: "ratings",
    label: "Ratings & Opinions",
    desc: "Independent property and agent review services.",
    href: "/partners/ratings",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "from-amber-500/10 to-transparent",
  },
  {
    slug: "furniture",
    label: "Furniture & Interior",
    desc: "Suppliers and designers for residential properties.",
    href: "/partners/furniture",
    icon: Sofa,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "from-rose-500/10 to-transparent",
  },
  {
    slug: "taxes",
    label: "Tax Advisors",
    desc: "Property tax, rental income and KRA compliance.",
    href: "/partners/taxes",
    icon: Calculator,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "from-violet-500/10 to-transparent",
  },
  {
    slug: "advertising",
    label: "Advertising",
    desc: "Marketing agencies for property professionals.",
    href: "/partners/advertising",
    icon: Megaphone,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "from-orange-500/10 to-transparent",
  },
  {
    slug: "craftsmen",
    label: "Craftsmen",
    desc: "Plumbers, electricians, painters and more.",
    href: "/partners/craftsmen",
    icon: Wrench,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "from-teal-500/10 to-transparent",
  },
];

export function CategorySlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollSnaps = emblaApi ? emblaApi.scrollSnapList() : [];

  return (
    <div className="relative py-12 px-4 bg-gradient-to-b from-accent/40 to-background dark:from-muted/20 dark:to-background overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-sky-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Explore</p>
            <h2 className="text-xl font-extrabold text-foreground">Our services &amp; partners</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="w-9 h-9 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent flex items-center justify-center transition-all disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="w-9 h-9 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent flex items-center justify-center transition-all disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className={`group relative flex-shrink-0 w-[calc(85%-1rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] rounded-2xl border bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cat.border} hover:border-opacity-60`}
                >
                  {/* Gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.glow} pointer-events-none`} />

                  {/* Icon */}
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>

                  {/* Text */}
                  <div className="relative flex-1">
                    <p className="text-sm font-bold text-foreground leading-tight mb-1">{cat.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                  </div>

                  {/* Arrow */}
                  <div className={`relative flex items-center gap-1 text-xs font-semibold ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                    Explore <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>

                  {/* Bottom shimmer */}
                  <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${cat.glow}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
