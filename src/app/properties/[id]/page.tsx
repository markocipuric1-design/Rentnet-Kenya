import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format-price";
import { median, avgPricePerM2 } from "@/lib/market-stats";
import { Gallery } from "./gallery";
import { SaveShareButtons } from "./save-share";
import { ContactPanel } from "./contact-panel";
import { MapViewLazy } from "./map-view-lazy";
import { NearbyPOILazy } from "./nearby-poi-lazy";
import {
  MapPin, Bed, Bath, Ruler, Calendar, Check, Zap, Shield,
  Car, Layers, Thermometer, Droplets, FileImage, Video, Globe, ExternalLink,
  ArrowRight, Square,
} from "lucide-react";


const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";

type Listing = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  subcategory: string | null;
  price: number;
  price_per_m2: boolean | null;
  area: number | null;
  area_gross: number | null;
  area_land: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_number: string | null;
  total_floors: number | null;
  year_built: number | null;
  year_renovated: number | null;
  condition: string | null;
  energy_class: string | null;
  heating_type: string | null;
  utilities: string[] | null;
  ownership: string | null;
  amenities: string[] | null;
  parking: boolean;
  balcony: boolean;
  elevator: boolean;
  furnished: boolean;
  city: string;
  region: string | null;
  settlement: string | null;
  address: string | null;
  status: string;
  user_id: string;
  lat: number | null;
  lng: number | null;
  video_url: string | null;
  floor_plan_url: string | null;
  virtual_tour_url: string | null;
  created_at: string | null;
};

type Owner = {
  id: string;
  slug: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  account_type: string;
  verified: boolean;
};

type SimilarListing = {
  id: string;
  slug: string | null;
  title: string;
  city: string;
  price: number;
  rooms: number | null;
  area: number | null;
  type: string;
  image: string | null;
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  let { data: l } = await supabase
    .from("listings")
    .select("title, description, price, area, rooms, bedrooms, city, type, category, slug")
    .eq("slug", id)
    .maybeSingle();

  if (!l) {
    const { data } = await supabase
      .from("listings")
      .select("title, description, price, area, rooms, bedrooms, city, type, category, slug")
      .eq("id", id)
      .maybeSingle();
    l = data;
  }

  if (!l) return { title: "Listing not found" };

  const priceStr = `KES ${Number(l.price).toLocaleString("en-KE")}`;
  const details = [
    l.bedrooms ? `${l.bedrooms} bed` : l.rooms ? `${l.rooms} rooms` : null,
    l.area ? `${l.area} m²` : null,
    l.city,
  ].filter(Boolean).join(" · ");

  const title = `${l.title} – ${priceStr}`;
  const description = l.description
    ? `${l.type} in ${l.city}${l.category ? ` · ${l.category}` : ""}. ${priceStr}. ${l.description.slice(0, 100).trimEnd()}…`
    : `${l.type} in ${l.city}${l.category ? ` · ${l.category}` : ""}. ${priceStr}. ${details}. Find this and more listings on Rentnet Kenya.`;

  const canonical = `https://rentnet.co.ke/properties/${l.slug ?? id}`;

  const ogImage = `https://rentnet.co.ke/properties/${l.slug ?? id}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth + listing fetch in parallel
  const [{ data: { user } }, slugResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("listings").select("*").eq("slug", id).maybeSingle(),
  ]);

  let listing: Listing | null = slugResult.data as Listing | null;
  if (!listing) {
    const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
    listing = data as Listing | null;
  }
  if (!listing) notFound();

  // All secondary fetches in parallel
  const [photosResult, savedResult, ownerResult, similarResult, adsResult, marketResult] =
    await Promise.all([
      supabase.from("listing_photos").select("url, position").eq("listing_id", listing.id).order("position"),
      user?.id
        ? supabase.from("saved_listings").select("id").eq("user_id", user.id).eq("listing_id", listing.id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("profiles").select("id, slug, full_name, avatar_url, phone, account_type, verified").eq("id", listing.user_id).single(),
      supabase.from("listings").select("id, slug, title, city, price, rooms, area, type").eq("status", "active").eq("city", listing.city).neq("id", listing.id).limit(4),
      supabase.from("advertisements").select("id, title, image_url, link_url").eq("placement", "sidebar").eq("active", true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
      (() => {
        let q = supabase.from("listings").select("price, area, type, status, created_at").eq("city", listing!.city).eq("type", listing!.type).eq("status", "active").neq("id", listing!.id).limit(300);
        if (listing!.category) q = q.eq("category", listing!.category);
        return q;
      })(),
    ]);

  const images = photosResult.data?.map((p) => p.url) ?? [];
  const owner = ownerResult.data as Owner | null;
  const initialFaved = !!savedResult.data;
  const sidebarAds = (adsResult.data ?? []) as { id: string; title: string; image_url: string; link_url: string }[];

  // Compute market stats server-side
  const marketRows = (marketResult.data ?? []) as { price: number; area: number | null; type: string; status: string; created_at: string }[];
  const marketData = marketRows.length >= 3
    ? { medianPrice: median(marketRows.map((r) => r.price)), avgM2: avgPricePerM2(marketRows), count: marketRows.length }
    : null;

  // Build similar listings with photos
  let similar: SimilarListing[] = [];
  if (similarResult.data && similarResult.data.length > 0) {
    const simIds = similarResult.data.map((s) => s.id);
    const { data: simPhotos } = await supabase.from("listing_photos").select("listing_id, url").in("listing_id", simIds).order("position");
    const simPhotoMap: Record<string, string> = {};
    (simPhotos ?? []).forEach((p) => { if (!simPhotoMap[p.listing_id]) simPhotoMap[p.listing_id] = p.url; });
    similar = similarResult.data.map((s) => ({ ...s, slug: s.slug ?? null, image: simPhotoMap[s.id] ?? null }));
  }

  // Amenities: use array if present, else fall back to 4 booleans
  const amenities: string[] = listing.amenities?.length
    ? listing.amenities
    : [
        listing.parking && "Parking space",
        listing.balcony && "Balcony / Terrace",
        listing.elevator && "Elevator",
        listing.furnished && "Furnished",
      ].filter(Boolean) as string[];

  // Quick-facts strip (top 4)
  type DetailRow = { icon: React.ReactNode; label: string; value: string };
  const quickFacts: DetailRow[] = [
    listing.area && { icon: <Ruler className="h-4 w-4 text-primary" />, label: "Net area", value: `${listing.area} m²` },
    listing.rooms && { icon: <Bed className="h-4 w-4 text-primary" />, label: "Rooms", value: listing.rooms === 0.5 ? "Studio" : listing.rooms >= 5 ? "5+" : `${listing.rooms}` },
    listing.bedrooms && { icon: <Bed className="h-4 w-4 text-primary" />, label: "Bedrooms", value: `${listing.bedrooms}` },
    listing.bathrooms && { icon: <Bath className="h-4 w-4 text-primary" />, label: "Bathrooms", value: `${listing.bathrooms}` },
    listing.floor_number && { icon: <Layers className="h-4 w-4 text-primary" />, label: "Floor", value: listing.floor_number },
    listing.year_built && { icon: <Calendar className="h-4 w-4 text-primary" />, label: "Year built", value: `${listing.year_built}` },
  ].filter(Boolean) as DetailRow[];

  // Full property details rows
  type SimpleRow = { label: string; value: string };
  const detailRows: SimpleRow[] = [
    listing.area && { label: "Net area", value: `${listing.area} m²` },
    listing.area_gross && { label: "Gross area", value: `${listing.area_gross} m²` },
    listing.area_land && { label: "Land area", value: `${listing.area_land} m²` },
    listing.rooms && { label: "Rooms", value: listing.rooms === 0.5 ? "Studio" : listing.rooms >= 5 ? "5+" : `${listing.rooms}` },
    listing.bedrooms && { label: "Bedrooms", value: `${listing.bedrooms}` },
    listing.bathrooms && { label: "Bathrooms", value: `${listing.bathrooms}` },
    listing.floor_number && { label: "Floor", value: listing.floor_number },
    listing.total_floors && { label: "Total floors", value: `${listing.total_floors}` },
    listing.year_built && { label: "Year built", value: `${listing.year_built}` },
    listing.year_renovated && { label: "Year renovated", value: `${listing.year_renovated}` },
    listing.condition && { label: "Condition", value: listing.condition },
  ].filter(Boolean) as SimpleRow[];

  const hasFeatures = listing.energy_class || listing.heating_type || listing.ownership || (listing.utilities && listing.utilities.length > 0);
  const hasMedia = listing.video_url || listing.floor_plan_url || listing.virtual_tour_url;

  const listingUrl = `https://rentnet.co.ke/properties/${listing.slug ?? listing.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": listingUrl,
    "name": listing.title,
    "description": listing.description ?? `${listing.type} in ${listing.city}${listing.category ? `, ${listing.category}` : ""}.`,
    "url": listingUrl,
    "datePosted": listing.created_at ? new Date(listing.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    "price": listing.price,
    "priceCurrency": "KES",
    "image": images[0] ?? undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": listing.city,
      "addressRegion": listing.region ?? listing.city,
      "addressCountry": "KE",
      "streetAddress": listing.address ?? undefined,
    },
    ...(listing.area && {
      "floorSize": { "@type": "QuantitativeValue", "value": listing.area, "unitCode": "MTK" },
    }),
    ...(listing.rooms && { "numberOfRooms": listing.rooms }),
    ...(listing.bedrooms && { "numberOfBedrooms": listing.bedrooms }),
    ...(listing.bathrooms && { "numberOfBathroomsTotal": listing.bathrooms }),
    ...(listing.year_built && { "yearBuilt": listing.year_built }),
    "offeredBy": owner ? {
      "@type": "RealEstateAgent",
      "name": owner.full_name ?? "Rentnet Agent",
      "url": `https://rentnet.co.ke/agencies/${owner.slug ?? owner.id}`,
    } : { "@id": "https://rentnet.co.ke/#organization" },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Preload the first gallery image so the browser fetches it before JS runs */}
      {images[0] && (
        <link rel="preload" as="image" href={images[0]} fetchPriority="high" />
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">

        <Breadcrumb
          items={[{ label: "Listings", href: "/listings" }, { label: listing.title }]}
          className="mb-6"
        />

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white bg-primary">{listing.type}</span>
              {listing.category && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-primary">{listing.category}</span>}
              {listing.subcategory && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{listing.subcategory}</span>}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">{listing.title}</h1>
            <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span className="text-sm">{[listing.address, listing.settlement, listing.city, listing.region].filter(Boolean).join(", ")}</span>
            </div>
          </div>
          <SaveShareButtons
            listingId={listing.id}
            listingTitle={listing.title}
            listingCity={listing.city}
            listingPrice={listing.price}
            initialFaved={initialFaved}
            currentUserId={user?.id ?? null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            <Gallery images={images.length > 0 ? images : [PLACEHOLDER]} />

            {/* Quick facts strip */}
            {quickFacts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickFacts.slice(0, 4).map((d) => (
                  <div key={d.label} className="flex flex-col gap-2 bg-card border border-border rounded-2xl p-3 sm:p-4 hover:border-primary/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">{d.icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{d.label}</p>
                      <p className="font-bold text-foreground">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground text-lg mb-4">Property description</h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words">{listing.description}</div>
              </div>
            )}

            {/* Property details */}
            {detailRows.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground text-lg mb-4">Property details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailRows.map((d) => (
                    <div key={d.label} className="flex flex-col gap-1 bg-muted/50 border border-border rounded-xl p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{d.label}</p>
                      <p className="text-sm font-semibold text-foreground">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features & Legal */}
            {hasFeatures && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground text-lg mb-4">Features &amp; legal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.energy_class && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Energy rating</p>
                        <p className="text-sm font-semibold text-foreground">{listing.energy_class}</p>
                      </div>
                    </div>
                  )}
                  {listing.heating_type && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Thermometer className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Heating / Cooling</p>
                        <p className="text-sm font-semibold text-foreground">{listing.heating_type}</p>
                      </div>
                    </div>
                  )}
                  {listing.ownership && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Ownership</p>
                        <p className="text-sm font-semibold text-foreground">{listing.ownership}</p>
                      </div>
                    </div>
                  )}
                </div>
                {listing.utilities && listing.utilities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-primary" /> Utilities available
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {listing.utilities.map((u) => (
                        <span key={u} className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/8 border border-primary/15 text-primary px-2.5 py-1 rounded-full">
                          <Check className="h-3 w-3" /> {u}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground text-lg mb-4">Amenities &amp; extras</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media links */}
            {hasMedia && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground text-lg mb-4">Media</h2>
                <div className="flex flex-col gap-3">
                  {listing.video_url && (
                    <a href={listing.video_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-muted/50 border border-border hover:border-primary/40 rounded-xl p-3 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Video className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Video tour</p>
                        <p className="text-xs text-muted-foreground truncate">{listing.video_url}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
                  )}
                  {listing.floor_plan_url && (
                    <a href={listing.floor_plan_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-muted/50 border border-border hover:border-primary/40 rounded-xl p-3 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <FileImage className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Floor plan</p>
                        <p className="text-xs text-muted-foreground truncate">{listing.floor_plan_url}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
                  )}
                  {listing.virtual_tour_url && (
                    <a href={listing.virtual_tour_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-muted/50 border border-border hover:border-primary/40 rounded-xl p-3 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Virtual tour</p>
                        <p className="text-xs text-muted-foreground truncate">{listing.virtual_tour_url}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Location map */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-bold text-foreground">Location</h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  {[listing.address, listing.settlement, listing.city].filter(Boolean).join(", ")}
                </p>
              </div>
              <MapViewLazy
                lat={listing.lat}
                lng={listing.lng}
                address={listing.address ? `${listing.address}, ${listing.city}, Kenya` : undefined}
                city={listing.city ? `${listing.city}, Kenya` : undefined}
                zoom={13}
                className="h-64"
                markerLabel={listing.title}
              />
            </div>

            <NearbyPOILazy
              lat={listing.lat}
              lng={listing.lng}
              address={listing.address}
              city={listing.city}
            />
          </div>

          {/* ── Right column (sticky sidebar) ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 self-start">
            <ContactPanel
              listing={{
                id: listing.id,
                title: listing.title,
                city: listing.city,
                category: listing.category,
                type: listing.type,
                price: listing.price,
                area: listing.area,
              }}
              owner={owner}
              marketData={marketData}
              currentUserId={user?.id ?? null}
              sidebarAds={sidebarAds}
            />
          </div>
        </div>

        {/* ── Similar properties ── */}
        {similar.length > 0 && (
          <div className="mt-14">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-foreground">Similar properties</h2>
                <p className="text-muted-foreground text-sm mt-1">In the same city</p>
              </div>
              <Link href="/listings" className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1">
                All listings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((p) => (
                <Link key={p.id} href={`/properties/${p.slug ?? p.id}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={p.image ?? PLACEHOLDER}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">{p.type}</span>
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs truncate">{p.city}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {(p.rooms ?? 0) > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.rooms}</span>}
                        {p.area && <span className="flex items-center gap-1"><Square className="h-3 w-3" />{p.area} m²</span>}
                      </div>
                      <span className="font-bold text-sm text-foreground">{formatPrice(p.price, p.type)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
