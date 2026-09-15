import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type StaffProfile = { id: string; account_type: string };

/**
 * Verifies the caller is signed in as an administrator or editor.
 * Editors are further restricted, per-route, to rows with staff_managed = true —
 * see canManageProfile / canManageListing below.
 */
export async function requireStaff(): Promise<
  { profile: StaffProfile } | { error: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles").select("id, account_type").eq("id", user.id).single();

  if (!profile || !["administrator", "editor"].includes(profile.account_type)) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { profile };
}

/** Administrators can manage any target; editors only ones flagged staff_managed. */
export function canManage(caller: StaffProfile, target: { staff_managed: boolean }): boolean {
  return caller.account_type === "administrator" || target.staff_managed === true;
}
