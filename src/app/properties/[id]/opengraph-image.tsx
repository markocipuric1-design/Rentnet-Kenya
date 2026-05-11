import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const alt = "Property listing on Rentnet Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let listing = null;
  const fields = "title,price,city,type,area,rooms,bedrooms";

  const { data: bySlug } = await supabase
    .from("listings").select(fields).eq("slug", id).maybeSingle();
  listing = bySlug;

  if (!listing) {
    const { data: byId } = await supabase
      .from("listings").select(fields).eq("id", id).maybeSingle();
    listing = byId;
  }

  const title = listing?.title ?? "Property listing";
  const priceStr = listing?.price
    ? `KES ${Number(listing.price).toLocaleString("en-KE")}`
    : "";
  const city = listing?.city ?? "Kenya";
  const type = listing?.type ?? "";
  const beds = listing?.bedrooms ?? listing?.rooms ?? null;
  const area = listing?.area ?? null;

  const meta = [
    beds ? `${beds} bed` : null,
    area ? `${area} m²` : null,
    city,
  ].filter(Boolean).join("  ·  ");

  const typeColors: Record<string, string> = {
    "For Sale": "#7c3aed",
    "For Rent": "#0ea5e9",
    "Buying": "#10b981",
    "Renting": "#f59e0b",
  };
  const typeColor = typeColors[type] ?? "#7c3aed";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + type badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "22px", fontWeight: 800,
            }}>R</div>
            <span style={{ color: "white", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px" }}>Rentnet</span>
          </div>
          {type && (
            <div style={{
              background: typeColor,
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: "100px",
            }}>{type}</div>
          )}
        </div>

        {/* Middle: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          <div style={{
            color: "white",
            fontSize: title.length > 60 ? "42px" : "52px",
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: "900px",
            letterSpacing: "-1px",
          }}>{title}</div>
          {meta && (
            <div style={{ color: "#a3a3a3", fontSize: "22px", fontWeight: 500 }}>{meta}</div>
          )}
        </div>

        {/* Bottom: price + domain */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {priceStr ? (
            <div style={{
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.4)",
              borderRadius: "16px",
              padding: "16px 28px",
            }}>
              <div style={{ color: "#c4b5fd", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Price</div>
              <div style={{ color: "white", fontSize: "32px", fontWeight: 800, letterSpacing: "-0.5px" }}>{priceStr}</div>
            </div>
          ) : <div />}
          <div style={{ color: "#525252", fontSize: "18px", fontWeight: 500 }}>rentnet.co.ke</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
