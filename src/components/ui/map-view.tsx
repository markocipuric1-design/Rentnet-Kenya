"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

type Props = {
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  zoom?: number;
  className?: string;
  markerLabel?: string;
};

async function geocode(query: string): Promise<[number, number] | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ke&language=en&limit=1&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const coords = data.features?.[0]?.center;
  return coords ? [coords[0], coords[1]] : null;
}

export function MapView({ city, address, lat, lng, zoom = 14, className = "", markerLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_public_token_here") {
      setError(true);
      return;
    }

    mapboxgl.accessToken = token;

    (async () => {
      let center: [number, number] | null = null;

      if (lat && lng) {
        center = [lng, lat];
      } else {
        const query = address || city;
        if (query) center = await geocode(query);
      }

      if (!center || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.flyTo({ center, zoom });
        markerRef.current?.setLngLat(center);
        return;
      }

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      // Custom marker element
      const el = document.createElement("div");
      el.className = "mapbox-custom-marker";
      el.innerHTML = `
        <div style="
          background: oklch(0.52 0.27 293);
          width: 40px; height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg style="transform:rotate(45deg); color:white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(center)
        .addTo(map);

      if (markerLabel) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 20, closeButton: false, className: "mapbox-popup" })
            .setHTML(`<span style="font-size:12px;font-weight:600;color:#1a1a2e">${markerLabel}</span>`)
        );
      }

      mapRef.current = map;
      markerRef.current = marker;
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, address, lat, lng]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 border border-border rounded-2xl text-sm text-muted-foreground ${className}`}>
        Map unavailable — Mapbox token not configured.
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Approximate location overlay */}
      {!lat && !lng && (
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground shadow">
          📍 Approximate location shown
        </div>
      )}
    </div>
  );
}
