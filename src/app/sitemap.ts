import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;
import { advisesData, servicesData, documentsData, youthData, partnerCategoriesData } from "@/lib/content-data";
import { toAgentSlug, generateListingSlug } from "@/lib/utils";

const base = "https://rentnet.co.ke";

const BLOG_CATEGORY_SLUGS = ["general", "market-trends", "tips", "news", "investment", "legal"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const now = new Date();

  const [blogResult, listingsResult, profilesResult, partnersResult] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("slug, created_at, updated_at")
      .eq("published", true),
    supabase
      .from("listings")
      .select("id, slug, updated_at")
      .eq("status", "active"),
    supabase
      .from("profiles")
      .select("id, slug, full_name, account_type, updated_at")
      .in("account_type", ["fizicna_oseba", "agencija"])
      .neq("profile_status", "pending")
      .neq("profile_status", "suspended"),
    supabase
      .from("partners")
      .select("id, slug, category, company_name, updated_at")
      .eq("verified", true),
  ]);

  const blogPosts = blogResult.data ?? [];
  const listings = listingsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const partners = partnersResult.data ?? [];

  const agents = profiles.filter((p) => p.account_type === "fizicna_oseba");
  const agencies = profiles.filter((p) => p.account_type === "agencija");

  return [
    // ── Core ──────────────────────────────────────────────────────────────────
    { url: base,                        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/listings`,          lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/blog`,              lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/agents`,            lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/agencies`,          lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/market`,            lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/services`,          lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/advises`,           lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/pricing`,           lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/advertise`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/post-listing`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`,               lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/documents`,         lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy-policy`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/cookie-policy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // ── Blog categories ───────────────────────────────────────────────────────
    ...BLOG_CATEGORY_SLUGS.map((slug) => ({
      url: `${base}/blog/category/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),

    // ── Blog posts (dynamic) ──────────────────────────────────────────────────
    ...blogPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // ── Active property listings (dynamic) ────────────────────────────────────
    ...listings.map((listing) => ({
      url: `${base}/properties/${listing.slug ?? listing.id}`,
      lastModified: new Date(listing.updated_at ?? now),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // ── Agent profiles (dynamic) ──────────────────────────────────────────────
    ...agents.map((agent) => ({
      url: `${base}/agents/${agent.slug ?? `${toAgentSlug(agent.full_name)}-${agent.id.replace(/-/g, "")}`}`,
      lastModified: new Date(agent.updated_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ── Agency profiles (dynamic) ─────────────────────────────────────────────
    ...agencies.map((agency) => ({
      url: `${base}/agents/${agency.slug ?? `${toAgentSlug(agency.full_name)}-${agency.id.replace(/-/g, "")}`}`,
      lastModified: new Date(agency.updated_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ── Services (static content) ─────────────────────────────────────────────
    ...servicesData.map((item) => ({
      url: `${base}/services/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ── Advises (static content) ──────────────────────────────────────────────
    ...advisesData.map((item) => ({
      url: `${base}/advises/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ── Documents (static content) ────────────────────────────────────────────
    ...documentsData.map((item) => ({
      url: `${base}/documents/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),

    // ── Youth pages (static content) ──────────────────────────────────────────
    ...youthData.map((item) => ({
      url: `${base}/youth/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),

    // ── Partner categories (static content) ───────────────────────────────────
    ...partnerCategoriesData.map((item) => ({
      url: `${base}/partners/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ── Individual partner profiles (dynamic) ─────────────────────────────────
    ...partners.map((partner) => ({
      url: `${base}/partners/${partner.category}/${partner.slug ?? `${generateListingSlug(partner.company_name)}-${partner.id.replace(/-/g, "")}`}`,
      lastModified: new Date(partner.updated_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
