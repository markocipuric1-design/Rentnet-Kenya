-- ── Allow 'editor' as a valid profiles.account_type ────────────────────────
-- profiles_account_type_check previously only allowed
-- fizicna_oseba / agencija / partner / administrator, so assigning the
-- Editor role from /admin/users was silently rejected by the database.
ALTER TABLE profiles DROP CONSTRAINT profiles_account_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_account_type_check
  CHECK (account_type IN ('fizicna_oseba', 'agencija', 'partner', 'administrator', 'editor'));
