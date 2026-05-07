"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Square, Heart, ChevronLeft, ChevronRight, ArrowRight, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";

type Listing = {
  id: string;
  slug: string | null;
  type: string;
  title: string;
  city: string;
  price: number;
  rooms: number | null;
  area: number | null;
  image: string | null;
  created_at: string;
};

const TYPE_COLOR: Record<string, string> = {
  "For Sale": "bg-primary",
  "For Rent": "bg-sky-500",
  "Buying": "bg-emerald-500",
  "Renting": "bg-amber-500",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

const tabs = [
  { id: "vse",     label: "Vse",       filter: (_: Listing) => true },
  { id: "For Sale", label: "For Sale",  filter: (l: Listing) => l.type === "For Sale" },
  { id: "For Rent", label: "For Rent",  filter: (l: Listing) => l.type === "For Rent" },
  { id: "Buying",   label: "Buying",    filter: (l: Listing) => l.type === "Buying" },
  { id: "Renting",  label: "Renting",   filter: (l: Listing) => l.type === "Renting" },
];

function ListingCard({ listing }: { listing: Listing }) {
  const [faved, setFaved] = useState(false);

  return (
    <Link href={`/properties/${listing.slug ?? listing.id}`}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full flex flex-col">
      <div className="relative overflow-hidden h-40 flex-shrink-0">
        <Image
          src={listing.image ?? PLACEHOLDER}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${TYPE_COLOR[listing.type] ?? "bg-muted"}`}>
            {listing.type}
          </span>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFaved(!faved); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${faved ? "fill-rose-500 text-rose-500" : "text-gray-400"}`} />
        </button>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-sm mt-1 leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs truncate">{listing.city}</span>
        </div>

        <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            {(listing.rooms ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs"><Bed className="h-3 w-3" />{listing.rooms}</span>
            )}
            {listing.area && (
              <span className="flex items-center gap-1 text-xs"><Square className="h-3 w-3" />{listing.area} m²</span>
            )}
          </div>
          <span className="font-bold text-sm text-foreground">
            {formatPrice(listing.price, listing.type)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse h-full flex flex-col">
      <div className="h-40 bg-muted flex-shrink-0" />
      <div className="p-3.5 flex flex-col gap-3 flex-1">
        <div className="h-4 bg-muted rounded-full w-4/5" />
        <div className="h-3 bg-muted rounded-full w-1/2" />
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex gap-2">
            <div className="h-3 bg-muted rounded-full w-10" />
            <div className="h-3 bg-muted rounded-full w-12" />
          </div>
          <div className="h-4 bg-muted rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export function Listings() {
  const [activeTab, setActiveTab] = useState("vse");
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", slidesToScroll: 1 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("id, slug, title, type, city, price, rooms, area, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(30);

      if (listingsError) console.error("Listings fetch error:", listingsError.message);

      if (!listings || listings.length === 0) {
        setLoading(false);
        return;
      }

      const ids = listings.map((l) => l.id);
      const { data: photos } = await supabase
        .from("listing_photos")
        .select("listing_id, url, position")
        .in("listing_id", ids)
        .order("position", { ascending: true });

      const photoMap: Record<string, string> = {};
      (photos ?? []).forEach((p) => {
        if (!photoMap[p.listing_id]) photoMap[p.listing_id] = p.url;
      });

      setAllListings(listings.map((l) => ({ ...l, image: photoMap[l.id] ?? null })));
      setLoading(false);
    })();
  }, []);

  const filtered = allListings.filter(tabs.find(t => t.id === activeTab)?.filter ?? (() => true));

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    emblaApi?.scrollTo(0, true);
  }, [activeTab, emblaApi]);

  const displayItems = loading ? Array.from({ length: 6 }) : filtered;

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Rentnet</h2>
            <p className="text-muted-foreground text-sm mt-1">Latest listings across Kenya</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/listings" className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1">
              All listings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-1.5 bg-muted rounded-xl p-1 w-full sm:w-fit mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Home className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">No active listings</p>
            <p className="text-sm text-muted-foreground">There are no published listings in this category yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {displayItems.map((l, i) => (
                  <div key={loading ? i : (l as Listing).id} className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-12px)]">
                    {loading ? <SkeletonCard /> : <ListingCard listing={l as Listing} />}
                  </div>
                ))}
              </div>
            </div>

            {!loading && filtered.length > 1 && (
              <div className="flex gap-2 justify-center mt-5">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === selectedIndex ? "bg-primary w-6" : "bg-border w-1.5"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
