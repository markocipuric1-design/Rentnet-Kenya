"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Redirects away from full-admin-only pages when the signed-in user is an editor (or anything else). */
export function useRequireAdmin() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin"); return; }
      const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single();
      if (profile?.account_type !== "administrator") router.replace("/admin");
    })();
  }, [router]);
}
