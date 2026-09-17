"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Redirects away from full-admin-only pages when the signed-in user is an
 * editor (or anything else). The only non-administrator role that can reach
 * a page using this hook at all is editor (the layout above already blocks
 * everyone else), so the fallback route is their real landing page — never
 * back to this same page, which would loop.
 */
export function useRequireAdmin() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single();
      if (profile?.account_type !== "administrator") router.replace("/admin/agencies");
    })();
  }, [router]);
}
