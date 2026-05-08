import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rentnet – Buy, Rent & Sell Property in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#7C3AED" />
            <path d="M12 40 L32 16 L52 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="20" y="40" width="24" height="16" rx="3" fill="white" opacity="0.9" />
            <rect x="27" y="46" width="10" height="10" rx="2" fill="#7C3AED" />
          </svg>
          <span style={{ fontSize: "64px", fontWeight: 800, color: "#7C3AED", letterSpacing: "-2px" }}>
            Rentnet
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: "28px", color: "#4B5563", fontWeight: 500, margin: "0 0 16px 0", textAlign: "center" }}>
          Buy, Rent &amp; Sell Property in Kenya
        </p>

        {/* Sub-tagline */}
        <p style={{ fontSize: "20px", color: "#6B7280", fontWeight: 400, margin: 0, textAlign: "center" }}>
          Thousands of verified listings across all 47 counties
        </p>

        {/* URL badge */}
        <div
          style={{
            marginTop: "40px",
            background: "#7C3AED",
            color: "white",
            padding: "10px 28px",
            borderRadius: "999px",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          rentnet.co.ke
        </div>
      </div>
    ),
    { ...size }
  );
}
