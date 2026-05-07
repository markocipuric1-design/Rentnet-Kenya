"use client";

import dynamic from "next/dynamic";

export const NearbyPOILazy = dynamic(
  () => import("@/components/ui/nearby-poi").then((m) => ({ default: m.NearbyPOI })),
  { ssr: false }
);
