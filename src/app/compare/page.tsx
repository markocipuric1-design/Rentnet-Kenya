"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";
import { MapPin, Bed, Square, Check, X, ArrowLeft } from "lucide-react";

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

type Listing = {
  id: string;
  slug: string | null;
  title: string;
  type: string;
  category: string | null;
  city: string;
  price: number;
  rooms: number | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_number: string | null;
  year_built: number | null;
  condition: string | null;
  parking: boolean;
  balcony: boolean;
  elevator: boolean;
  furnished: boolean;
  image: string | null;
};

const TYPE_COLOR: Record<string, string> = {
  "For Sale": "bg-primary",
  "For Rent": "bg-sky-500",
  "Buying": "bg-emerald-500",
  "Renting": "bg-amber-500",
};

function Row({ label, values }: { label: string; values: (string | null | boolean)[] }) {
  const allSame = values.every(v => v === values[0]);
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4 text-xs font-semibold text-muted-foreground w-36 flex-shrink-0">{label}</td>
      {values.map((v, i) => {
        const display = typeof v === "boolean"
          ? (v ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />)
          : (v ?? <span className="text-muted-foreground">—</span>);
        return (
          <td key={i} className={`py-3 px-4 text-sm text-center ${!allSame && typeof v !== "boolean" ? "font-semibold text-primary" : "text-foreground"}`}>
            {display}
          </td>
        );
      })}
      {/* Fill empty columns */}
      {Array.from({ length: 3 - values.length }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3 px-4" />
      ))}
    </tr>
  );
}

function ComparePage() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("listings")
        .select("id, slug, title, type, category, city, price, rooms, area, bedrooms, bathrooms, floor_number, year_built, condition, parking, balcony, elevator, furnished")
        .in("id", ids);

      if (data?.length) {
        const photoRes = await supabase
          .from("listing_photos")
          .select("listing_id, url")
          .in("listing_id", data.map(l => l.id))
          .order("position", { ascending: true });

        const photoMap: Record<string, string> = {};
        (photoRes.data ?? []).forEach(p => { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = p.url; });

        setListings(data.map(l => ({ ...l, image: photoMap[l.id] ?? null })));
      }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <h1 className="text-2xl font-extrabold text-foreground mb-8">Property Comparison</h1>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="bg-card border border-border rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : listings.length < 2 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Select at least 2 listings to compare.</p>
            <Link href="/listings" className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm">
              Browse Listings
            </Link>
          </div>
        ) : (
          <>
            {/* Header cards */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `180px repeat(${listings.length}, 1fr)` }}>
              <div />
              {listings.map(l => (
                <div key={l.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="relative h-36 overflow-hidden">
                    <Image src={l.image ?? PLACEHOLDER} alt={l.title} fill className="object-cover" sizes="300px" />
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${TYPE_COLOR[l.type] ?? "bg-muted"}`}>{l.type}</span>
                  </div>
                  <div className="p-3">
                    <Link href={`/properties/${l.slug ?? l.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                      {l.title}
                    </Link>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="h-3 w-3" />{l.city}</p>
                    <p className="font-bold text-primary text-base mt-1">{formatPrice(l.price, l.type)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Feature</th>
                    {listings.map(l => (
                      <th key={l.id} className="py-3 px-4 text-center text-xs font-bold text-foreground truncate max-w-[120px]">
                        {l.title.length > 20 ? l.title.slice(0, 20) + "…" : l.title}
                      </th>
                    ))}
                    {Array.from({ length: 3 - listings.length }).map((_, i) => <th key={i} />)}
                  </tr>
                </thead>
                <tbody>
                  <Row label="Price" values={listings.map(l => formatPrice(l.price, l.type))} />
                  <Row label="Category" values={listings.map(l => l.category)} />
                  <Row label="City" values={listings.map(l => l.city)} />
                  <Row label="Area" values={listings.map(l => l.area ? `${l.area} m²` : null)} />
                  <Row label="Rooms" values={listings.map(l => l.rooms ? String(l.rooms) : null)} />
                  <Row label="Bedrooms" values={listings.map(l => l.bedrooms ? String(l.bedrooms) : null)} />
                  <Row label="Bathrooms" values={listings.map(l => l.bathrooms ? String(l.bathrooms) : null)} />
                  <Row label="Floor" values={listings.map(l => l.floor_number)} />
                  <Row label="Year built" values={listings.map(l => l.year_built ? String(l.year_built) : null)} />
                  <Row label="Condition" values={listings.map(l => l.condition)} />
                  <Row label="Parking" values={listings.map(l => l.parking)} />
                  <Row label="Balcony" values={listings.map(l => l.balcony)} />
                  <Row label="Elevator" values={listings.map(l => l.elevator)} />
                  <Row label="Furnished" values={listings.map(l => l.furnished)} />
                </tbody>
              </table>
            </div>

            {/* CTA row */}
            <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: `180px repeat(${listings.length}, 1fr)` }}>
              <div />
              {listings.map(l => (
                <Link key={l.id} href={`/properties/${l.slug ?? l.id}`}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl text-sm text-center transition-all hover:-translate-y-0.5 shadow-md shadow-primary/20">
                  View listing →
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ComparePageWrapper() {
  return <Suspense><ComparePage /></Suspense>;
}
