"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function adminUpdatePartner(
  id: string,
  payload: Record<string, unknown>
): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "administrator") return "Unauthorized";

  const admin = createAdminClient();
  const { error } = await admin.from("partners").update(payload).eq("id", id);
  return error?.message ?? null;
}
