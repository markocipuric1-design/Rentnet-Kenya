-- ── Claim trial for staff-created agencies ─────────────────────────────────
-- trial_ends_at is deliberately separate from subscription_expires_at (which
-- only mpesa sets, never Stripe) so this can't interfere with real paid
-- subscriptions. It's set once, when a staff_managed agency claims its
-- profile (sets its own password via /reset-password), and cleared again the
-- moment they take out a real subscription.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
