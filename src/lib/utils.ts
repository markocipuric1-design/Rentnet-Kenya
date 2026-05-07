import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toAgentSlug(name: string | null | undefined, _id?: string): string {
  return (name ?? "agent")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function generateListingSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function slugToAgentId(slug: string): string | null {
  const flat = slug.replace(/-/g, "");
  if (flat.length < 32) return null;
  const uuidFlat = flat.slice(-32);
  if (!/^[0-9a-f]{32}$/i.test(uuidFlat)) return null;
  return [
    uuidFlat.slice(0, 8),
    uuidFlat.slice(8, 12),
    uuidFlat.slice(12, 16),
    uuidFlat.slice(16, 20),
    uuidFlat.slice(20),
  ].join("-");
}
