"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Home, Building2, LogOut, Shield, Menu, X, ArrowLeft, Wrench, Megaphone, BookOpen, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Home },
  { href: "/admin/agencies", label: "Agencies", icon: Building2 },
  { href: "/admin/partners", label: "Partners", icon: Wrench },
  { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function AdminSidebar({ userName, userEmail }: { userName: string; userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const Nav = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-none">Admin Panel</div>
            <div className="text-white/40 text-[10px] mt-0.5">Rentnet</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-bold">{(userName?.[0] ?? "A").toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{userName}</p>
            {userEmail && <p className="text-white/40 text-[10px] truncate">{userEmail}</p>}
          </div>
        </div>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/8 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/8 transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-56 flex-shrink-0 bg-foreground h-screen sticky top-0 flex-col">
        <Nav />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-foreground text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-foreground flex flex-col h-full relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <Nav />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
