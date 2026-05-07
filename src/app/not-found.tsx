"use client";

import Link from "next/link";
import { Home, Search, ArrowRight, MapPin } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";

const suggestions = [
  { label: "Apartments", href: "/listings?type=Stanovanje" },
  { label: "Houses", href: "/listings?type=Hi%C5%A1a" },
  { label: "Commercial", href: "/listings?type=Poslovni+prostor" },
  { label: "Agencies", href: "/agencies" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">

          {/* 404 illustration */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <span className="text-[120px] sm:text-[160px] font-extrabold text-border/60 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-xl shadow-primary/10 border border-primary/20">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
            This page does not exist
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The property you are looking for may have been sold, removed, or you entered an incorrect address.
          </p>

          {/* Search bar */}
          <div className="flex items-center border border-border bg-card rounded-xl overflow-hidden mb-8 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search className="h-4 w-4 text-muted-foreground ml-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search listings, location…"
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) window.location.href = `/listings?q=${encodeURIComponent(val)}`;
                }
              }}
            />
            <Link
              href="/listings"
              className="bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground text-sm font-semibold px-4 py-3 transition-all flex items-center gap-1.5"
            >
              Search <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick links */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Popular categories
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {suggestions.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent hover:text-primary text-sm font-medium transition-all"
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Home button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
