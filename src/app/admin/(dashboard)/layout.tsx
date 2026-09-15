import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["administrator", "editor"].includes(profile.account_type)) redirect("/");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar userName={profile.full_name ?? "Admin"} userEmail={user.email} role={profile.account_type as "administrator" | "editor"} />
      <div className="flex-1 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
