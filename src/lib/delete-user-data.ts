import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Deletes every row AND every storage file belonging to a user.
 * Must be called with the service-role admin client (bypasses RLS).
 *
 * Deletion order respects FK dependencies: children before parents.
 */
export async function deleteAllUserData(admin: SupabaseClient, userId: string): Promise<void> {
  // ── 1. Collect URLs that aren't indexed by userId before rows are gone ────
  const [{ data: partnerRows }, { data: adRows }] = await Promise.all([
    admin.from("partners").select("logo_url, promo_banner_url, metadata").eq("user_id", userId),
    admin.from("advertisements").select("image_url").eq("user_id", userId),
  ]);

  // ── 2. Get listing IDs so we can delete their children ────────────────────
  const { data: listingRows } = await admin.from("listings").select("id").eq("user_id", userId);
  const listingIds = listingRows?.map((l: { id: string }) => l.id) ?? [];

  if (listingIds.length > 0) {
    await Promise.all([
      admin.from("listing_photos").delete().in("listing_id", listingIds),
      admin.from("listing_views").delete().in("listing_id", listingIds),
    ]);
  }

  // ── 3. Delete messages before conversations (FK dependency) ───────────────
  await admin.from("messages").delete().eq("sender_id", userId);

  // ── 4. Delete all remaining DB rows in parallel ───────────────────────────
  await Promise.all([
    admin.from("conversations").delete().or(`participant_1.eq.${userId},participant_2.eq.${userId}`),
    admin.from("listings").delete().eq("user_id", userId),
    admin.from("partners").delete().eq("user_id", userId),
    admin.from("advertisements").delete().eq("user_id", userId),
    admin.from("saved_listings").delete().eq("user_id", userId),
    admin.from("reviews").delete().eq("reviewer_id", userId),
    admin.from("reviews").delete().eq("reviewed_id", userId),
    admin.from("profile_views").delete().eq("profile_id", userId),
  ]);

  await admin.from("profiles").delete().eq("id", userId);

  // ── 5. Delete storage files ───────────────────────────────────────────────

  // Buckets where all user files live under a {userId}/ folder
  const userFolderBuckets = [
    "avatars",          // avatar.webp, cover.webp, partner-profile-*.webp
    "listing-images",   // {timestamp}-{random}.webp, plan-*.pdf
    "agent-showcase",   // {timestamp}-{random}.webp
    "agent-documents",  // {timestamp}-{random}.pdf
    "review-images",    // {timestamp}-{random}.webp
  ];
  await Promise.all(userFolderBuckets.map(bucket => deleteFolder(admin, bucket, userId)));

  // partner-assets: paths are logos/*, banners/*, catalogs/* — no userId in path
  const partnerPaths: string[] = [];
  for (const row of (partnerRows ?? [])) {
    pushStoragePath(partnerPaths, row.logo_url, "partner-assets");
    pushStoragePath(partnerPaths, row.promo_banner_url, "partner-assets");
    const meta = row.metadata as Record<string, unknown> | null;
    if (meta?.catalog_url && typeof meta.catalog_url === "string") {
      pushStoragePath(partnerPaths, meta.catalog_url, "partner-assets");
    }
  }
  if (partnerPaths.length > 0) {
    await admin.storage.from("partner-assets").remove(partnerPaths);
  }

  // ad-images: paths are ads/{adId}-{timestamp}.webp — no userId in path
  const adPaths: string[] = [];
  for (const row of (adRows ?? [])) {
    pushStoragePath(adPaths, row.image_url, "ad-images");
  }
  if (adPaths.length > 0) {
    await admin.storage.from("ad-images").remove(adPaths);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function deleteFolder(admin: SupabaseClient, bucket: string, folder: string): Promise<void> {
  const { data: files } = await admin.storage.from(bucket).list(folder, { limit: 1000 });
  if (!files || files.length === 0) return;
  const paths = files.filter(f => f.name).map(f => `${folder}/${f.name}`);
  if (paths.length > 0) {
    await admin.storage.from(bucket).remove(paths);
  }
}

function pushStoragePath(out: string[], url: string | null | undefined, bucket: string): void {
  if (!url) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx >= 0) {
    out.push(decodeURIComponent(url.slice(idx + marker.length)));
  }
}
