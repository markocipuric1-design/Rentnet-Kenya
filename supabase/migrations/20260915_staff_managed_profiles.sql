-- ── Editor tooling: profiles created on behalf of agencies/individuals ────────
-- staff_managed marks a profile that an admin/editor created for someone who
-- didn't sign up themselves — it bypasses the subscription and listing-limit
-- checks in post-listing.tsx and dashboard/page.tsx, and scopes what an
-- "editor" account is allowed to touch (only staff_managed profiles/listings).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS staff_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
