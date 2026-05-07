import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AgentClient } from "./agent-client";

async function getProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, account_type, specializations, service_areas, avatar_url, phone, slug")
    .or(`slug.eq.${id},id.eq.${id}`)
    .maybeSingle();
  return data;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile?.full_name) {
    return { title: "Agent Profile | Rentnet" };
  }

  const name = profile.full_name;
  const type = profile.account_type === "agencija" ? "Agency" : "Agent";
  const areas = (profile.service_areas ?? []).slice(0, 3).join(", ");
  const specs = (profile.specializations ?? []).slice(0, 2).join(", ");

  const title = `${name} – ${type} in Kenya | Rentnet`;
  const description = [
    `${name} is a ${type.toLowerCase()} on Rentnet Kenya.`,
    areas ? `Serving: ${areas}.` : "",
    specs ? `Specialises in: ${specs}.` : "",
    "View listings, reviews, and contact details.",
  ].filter(Boolean).join(" ");

  const canonical = `https://rentnet.co.ke/agents/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "profile",
      ...(profile.avatar_url && {
        images: [{ url: profile.avatar_url, width: 400, height: 400, alt: name }],
      }),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);

  const profileUrl = `https://rentnet.co.ke/agents/${id}`;
  const isAgency = profile?.account_type === "agencija";
  const jsonLd = profile?.full_name
    ? {
        "@context": "https://schema.org",
        "@type": isAgency ? "LocalBusiness" : "Person",
        "@id": profileUrl,
        "name": profile.full_name,
        "url": profileUrl,
        ...(profile.avatar_url && { "image": profile.avatar_url }),
        ...(profile.phone && { "telephone": profile.phone }),
        ...(profile.service_areas?.length && {
          "areaServed": profile.service_areas.map((a: string) => ({ "@type": "City", "name": a })),
        }),
        "worksFor": { "@id": "https://rentnet.co.ke/#organization" },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AgentClient />
    </>
  );
}
