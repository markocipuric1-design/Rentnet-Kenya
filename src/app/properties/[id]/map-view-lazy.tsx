"use client";

import dynamic from "next/dynamic";

export const MapViewLazy = dynamic(
  () => import("@/components/ui/map-view").then((m) => ({ default: m.MapView })),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-muted animate-pulse" /> }
);
