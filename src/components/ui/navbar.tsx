"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home, Search, ArrowRight, Menu, ChevronDown, Sun, Moon, User, LogOut, Shield, Wrench,
  Megaphone, LayoutPanelLeft, Grid3x3, Star, Globe, MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Navigation data ──────────────────────────────────────────────────────────

const partnerLinks = [
  { label: "Agencies", href: "/agencies" },
  { label: "Rentnet Agents", href: "/partners/rentnet-agents" },
  { label: "Bank", href: "/partners/bank" },
  { label: "Insurance", href: "/partners/insurance" },
  { label: "Ratings / Opinions", href: "/partners/ratings" },
  { label: "Furniture / Interior", href: "/partners/furniture" },
  { label: "Taxes", href: "/partners/taxes" },
  { label: "Advertising", href: "/partners/advertising" },
];

const craftsmenGroups = [
  { group: "Plumbing & Gas", items: ["Plumber", "Gas Master"] },
  { group: "Electrical & Locks", items: ["Electrician", "Locksmith"] },
  { group: "Renovation", items: ["Painter", "Tiler repair", "Glazier"] },
  { group: "Installation", items: ["Cornices installation", "Furniture assembly"] },
  { group: "Construction", items: ["Roof repair", "Construction work"] },
  { group: "Logistics", items: ["Moving service", "Cleaning service"] },
];

const craftsmenHref = (item: string) =>
  `/partners/craftsmen?sub=${encodeURIComponent(item)}`;

const secondaryNavItems = [
  {
    label: "Rentnet Services",
    key: "services",
    items: [
      { label: "Legal consultation", href: "/services/legal" },
      { label: "Real-estate valuation", href: "/services/valuation" },
      { label: "We help you Buy / Sell / Rent / Lease", href: "/services/help" },
      { label: "Personal Real-estate Document", href: "/services/personal-documents" },
      { label: "Notaries in Kenya", href: "/services/notaries" },
      { label: "Real Estate Lawyers in Kenya", href: "/services/lawyers" },
    ],
  },
  {
    label: "Rentnet Advises",
    key: "advises",
    items: [
      { label: "Tips for safely renting out your property", href: "/advises/safe-renting" },
      { label: "Main areas of tenancy relationships", href: "/advises/tenancy-relationships" },
      { label: "Additional questions from tenants", href: "/advises/tenant-questions" },
      { label: "How to find a reliable tenant", href: "/advises/find-reliable-tenant" },
      { label: "Advantages and disadvantages of short-term rental", href: "/advises/short-term-rental" },
      { label: "Human nature", href: "/advises/human-nature" },
      { label: "Humidity in the apartment", href: "/advises/humidity" },
      { label: "Tips for successfully renting", href: "/advises/renting-tips" },
    ],
  },
  {
    label: "Real Estate & Youth",
    key: "youth",
    items: [
      { label: "Real Estate and Kenya Youth", href: "/youth/real-estate-youth" },
      { label: "Youth support organizations", href: "/youth/support-organizations" },
    ],
  },
  {
    label: "Document Library",
    key: "documents",
    items: [
      { label: "← View Document Library", href: "/documents" },
      { label: "Lease Agreement", href: "/documents/lease" },
      { label: "Tenancy Agreement Kenya", href: "/documents/tenancy-agreement" },
      { label: "Subletting Agreement", href: "/documents/subletting-agreement" },
      { label: "Commercial Lease Agreement", href: "/documents/commercial-lease" },
      { label: "House Rules", href: "/documents/house-rules" },
      { label: "Minutes of Takeover", href: "/documents/takeover" },
      { label: "Minutes of Return", href: "/documents/return" },
      { label: "Move-in Checklist", href: "/documents/move-in-checklist" },
      { label: "Move-out Checklist", href: "/documents/move-out-checklist" },
      { label: "Property Handover Form", href: "/documents/property-handover-form" },
      { label: "Inventory Checklist", href: "/documents/inventory-checklist" },
      { label: "Eviction Notice Template", href: "/documents/eviction-notice" },
      { label: "Rent Increase Notice", href: "/documents/rent-increase-notice" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        supabase.from("profiles").select("full_name, avatar_url, account_type").eq("id", user.id).single()
          .then(({ data }) => {
            setUserName(data?.full_name ?? user.email?.split("@")[0] ?? "Profile");
            setUserAvatar(data?.avatar_url ?? null);
            setIsAdmin(data?.account_type === "administrator");
          });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { setUserName(null); setUserAvatar(null); setIsAdmin(false); setUserId(null); setUnreadCount(0); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread count on load and on each navigation (picks up mark-as-read changes)
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let active = true;
    (async () => {
      const { data: convs } = await supabase.from("conversations").select("id")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);
      if (!active) return;
      if (!convs?.length) { setUnreadCount(0); return; }
      const { count } = await supabase.from("messages").select("id", { count: "exact", head: true })
        .in("conversation_id", convs.map(c => c.id))
        .neq("sender_id", userId).is("read_at", null);
      if (active) setUnreadCount(count ?? 0);
    })();
    return () => { active = false; };
  }, [userId, pathname]);

  // Real-time: increment count when a new message arrives
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel("navbar-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async () => {
        const { data: convs } = await supabase.from("conversations").select("id")
          .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);
        if (!convs?.length) return;
        const { count } = await supabase.from("messages").select("id", { count: "exact", head: true })
          .in("conversation_id", convs.map(c => c.id))
          .neq("sender_id", userId).is("read_at", null);
        setUnreadCount(count ?? 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserName(null);
    router.push("/");
  };

  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const navLinkClass = (href: string) =>
    `px-3 py-2 rounded-lg transition-colors block ${
      isActive(href)
        ? "text-primary font-semibold"
        : "hover:text-foreground text-muted-foreground"
    }`;

  const tabClass = (active: boolean) =>
    `px-3 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
      active
        ? "text-primary border-primary"
        : "text-foreground border-transparent hover:text-primary hover:border-primary/40"
    }`;


  const dropdownLinkClass =
    "block px-4 py-2 text-sm hover:text-foreground hover:bg-muted rounded-lg text-muted-foreground transition-colors";

  const toggleMobileSection = (key: string) =>
    setOpenMobileSection(openMobileSection === key ? null : key);

  return (
    <>
      {/* ── Layer 1: Partner bar ──────────────────────────────────────────── */}
      <div className="hidden lg:block bg-muted border-b border-border relative z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-0">
          {/* Scrollable partner links */}
          <div className="flex items-center overflow-x-auto scrollbar-hide py-1.5">
            {partnerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex-shrink-0 text-xs text-muted-foreground hover:text-foreground px-3 py-1 transition-colors whitespace-nowrap border-r border-border"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Craftsmen dropdown — outside overflow container so panel isn't clipped */}
          <div className="relative flex-shrink-0 border-l border-border" data-dropdown>
            <button
              onClick={() => setOpenDropdown(openDropdown === "craftsmen" ? null : "craftsmen")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              <Wrench className="h-3 w-3" />
              Craftsmen
              <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === "craftsmen" ? "rotate-180" : ""}`} />
            </button>
            {openDropdown === "craftsmen" && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-border shadow-xl rounded-xl z-[70] p-4 w-[480px]">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Craftsmen Directory</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {craftsmenGroups.map((group) => (
                    <div key={group.group}>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wide mt-2 mb-1">{group.group}</p>
                      {group.items.map((item) => (
                        <Link key={item} href={craftsmenHref(item)} className={dropdownLinkClass + " py-1 text-xs"} onClick={() => setOpenDropdown(null)}>
                          {item}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Layer 2: Main nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-primary flex items-center gap-2 flex-shrink-0">
          <Home className="h-5 w-5" /> Rentnet
        </Link>

        {/* Search box */}
        <div className="hidden md:flex flex-1 max-w-sm items-stretch border border-border rounded-xl overflow-hidden bg-background">
          <input
            type="text"
            placeholder="Search listings, address…"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Link href="/listings" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 flex items-center justify-center transition-colors">
            <Search className="h-4 w-4" />
          </Link>
        </div>

        {/* Auth buttons — desktop */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          {userName ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-xl transition-colors border border-primary/20"
                >
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
              {unreadCount > 0 && (
                <Link href="/dashboard/messages" aria-label="Messages" className="relative p-2 rounded-xl hover:bg-accent transition-colors">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </Link>
              )}
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "user" ? null : "user")}
                  className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent px-3 py-1.5 rounded-xl transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/15 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {userAvatar
                      ? <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[10px] font-bold text-primary">{userName[0].toUpperCase()}</span>}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{userName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${openDropdown === "user" ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === "user" && (
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border shadow-lg rounded-xl w-44 overflow-hidden z-50">
                    <Link href="/dashboard" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" /> My Profile
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-primary font-semibold border-t border-border">
                        <Shield className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-foreground border-t border-border">
                      <LogOut className="h-4 w-4 text-muted-foreground" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${isActive("/login") ? "text-primary font-semibold" : "text-foreground hover:text-muted-foreground"}`}>
              Sign In
            </Link>
          )}
          <Link href="/post-listing" className="bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5">
            Post Listing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Theme toggle — desktop */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden lg:flex bg-muted hover:bg-border p-2 rounded-full transition-colors flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4 text-foreground" /> : <Sun className="h-4 w-4 text-foreground" />}
          </button>
        )}
        {!mounted && <div className="hidden lg:block w-9 h-9 flex-shrink-0" />}

        {/* Mobile: theme + hamburger */}
        <div className="lg:hidden ml-auto flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-muted hover:bg-border p-2 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4 text-foreground" /> : <Sun className="h-4 w-4 text-foreground" />}
            </button>
          )}
          {!mounted && <div className="w-9 h-9 flex-shrink-0" />}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ── Layer 3: Secondary nav ────────────────────────────────────────── */}
      <div className="sticky top-[62px] z-40 bg-background border-b border-border hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1">
          {/* Submit an Ad CTA */}
          <Link
            href="/post-listing"
            className="flex items-center gap-1.5 text-sm font-bold text-primary px-4 py-2.5 border-r border-border mr-1 hover:bg-accent transition-colors whitespace-nowrap"
          >
            <ArrowRight className="h-4 w-4" /> Submit an Ad
          </Link>

          {/* Secondary dropdowns */}
          {secondaryNavItems.map((nav) => (
            <div key={nav.key} className="relative" data-dropdown>
              <button
                onClick={() => setOpenDropdown(openDropdown === nav.key ? null : nav.key)}
                className={`flex items-center gap-1 text-sm px-3 py-2.5 transition-colors whitespace-nowrap ${
                  openDropdown === nav.key
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {nav.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === nav.key ? "rotate-180" : ""}`} />
              </button>
              {openDropdown === nav.key && (
                <div className={`absolute top-full left-0 mt-1 bg-card border border-border shadow-xl rounded-xl z-50 p-2 ${nav.key === "advises" ? "w-[480px]" : "w-72"}`}>
                  {nav.key === "advises" ? (
                    <div className="grid grid-cols-2 gap-x-2">
                      {nav.items.map((item) => (
                        <Link key={item.label} href={item.href} onClick={() => setOpenDropdown(null)} className={dropdownLinkClass}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    nav.items.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setOpenDropdown(null)} className={dropdownLinkClass}>
                        {item.label}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Primary nav links */}
          <div className="flex items-center ml-auto">
            <Link href="/listings" className={tabClass(isActive("/listings"))}>Listings</Link>
            <Link href="/agencies" className={tabClass(isActive("/agencies"))}>Agencies</Link>
            <Link href="/blog" className={tabClass(isActive("/blog"))}>Blog</Link>
            <Link href="/pricing" className={tabClass(isActive("/pricing"))}>Pricing</Link>

            {/* Advertise dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setOpenDropdown(openDropdown === "advertise" ? null : "advertise")}
                className={`flex items-center gap-1 ${tabClass(openDropdown === "advertise" || pathname.startsWith("/advertise"))}`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                Advertise
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "advertise" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "advertise" && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border shadow-2xl rounded-2xl z-50 p-5 w-[560px]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Advertise on Rentnet</p>
                      <p className="text-sm font-bold text-foreground">Reach Kenyan property seekers</p>
                    </div>
                    <Link
                      href="/advertise"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/20"
                    >
                      Book now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Placement cards — 3 standard */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: "sidebar",
                        icon: <LayoutPanelLeft className="h-4 w-4 text-primary" />,
                        bg: "bg-primary/10",
                        label: "Sidebar",
                        desc: "Sticky banner on property detail pages",
                        prices: { 7: "1,500", 14: "2,500", 30: "4,000" },
                      },
                      {
                        key: "infeed",
                        icon: <Grid3x3 className="h-4 w-4 text-sky-500" />,
                        bg: "bg-sky-500/10",
                        label: "In-feed",
                        desc: "Sponsored card inside the listings grid",
                        prices: { 7: "2,000", 14: "3,500", 30: "5,500" },
                      },
                      {
                        key: "featured",
                        icon: <Star className="h-4 w-4 text-amber-500" />,
                        bg: "bg-amber-500/10",
                        label: "Featured Partner",
                        desc: "Top spotlight on partner directory pages",
                        prices: { 7: "1,000", 14: "1,800", 30: "3,000" },
                      },
                    ].map((p) => (
                      <div key={p.key} className="bg-background border border-border rounded-xl p-3 flex flex-col gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.bg}`}>
                          {p.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{p.label}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{p.desc}</p>
                        </div>
                        <div className="border-t border-border pt-2 flex flex-col gap-1 mt-auto">
                          {Object.entries(p.prices).map(([days, price]) => (
                            <div key={days} className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{days} days</span>
                              <span className="text-[10px] font-bold text-foreground">KES {price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Homepage banner — premium full-width card */}
                  <div className="mt-3 bg-gradient-to-r from-emerald-500/8 via-emerald-500/5 to-transparent border border-emerald-500/25 rounded-xl p-3 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 flex-shrink-0">
                      <Globe className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-foreground">Homepage Banner</p>
                        <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">Premium</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">Full-width banner between homepage sections — maximum reach</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-right">
                      <div className="flex flex-col gap-0.5">
                        {[["7d", "3,000"], ["14d", "5,000"], ["30d", "8,000"]].map(([d, p]) => (
                          <div key={d} className="flex items-center gap-2">
                            <span className="text-muted-foreground">{d}</span>
                            <span className="font-bold text-foreground">KES {p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-3 text-center">
                    All placements include a clickable image, external link, and campaign duration tracking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[62px] z-40 bg-black/40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 w-80 max-w-full h-full bg-card border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 space-y-1">

              {/* Core links */}
              <Link href="/listings" className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Listings</Link>
              <Link href="/agencies" className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Agencies</Link>
              <Link href="/blog" className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
              <Link href="/pricing" className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>

              {/* Advertise accordion */}
              <button
                onClick={() => toggleMobileSection("advertise")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg text-muted-foreground"
              >
                <span className="flex items-center gap-2"><Megaphone className="h-3.5 w-3.5 text-primary" /> Advertise</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMobileSection === "advertise" ? "rotate-180" : ""}`} />
              </button>
              {openMobileSection === "advertise" && (
                <div className="ml-3 mt-1 mb-2 border-l-2 border-primary/20 pl-3 flex flex-col gap-3">
                  {[
                    { icon: <LayoutPanelLeft className="h-3.5 w-3.5 text-primary" />, label: "Sidebar", from: "1,500" },
                    { icon: <Grid3x3 className="h-3.5 w-3.5 text-sky-500" />, label: "In-feed", from: "2,000" },
                    { icon: <Star className="h-3.5 w-3.5 text-amber-500" />, label: "Featured Partner", from: "1,000" },
                    { icon: <Globe className="h-3.5 w-3.5 text-emerald-500" />, label: "Homepage Banner", from: "3,000" },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex items-center gap-2 text-xs text-foreground font-medium">{p.icon}{p.label}</span>
                      <span className="text-[11px] text-muted-foreground ml-auto">from KES {p.from}/wk</span>
                    </div>
                  ))}
                  <Link
                    href="/advertise"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl mt-1"
                  >
                    Book an ad <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Partners section */}
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Partners</p>
                {partnerLinks.map((link) => (
                  <a key={link.label} href={link.href} className="block px-3 py-1.5 text-sm hover:bg-muted rounded-lg text-muted-foreground">{link.label}</a>
                ))}
                {/* Craftsmen accordion */}
                <button
                  onClick={() => toggleMobileSection("craftsmen")}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted rounded-lg text-muted-foreground"
                >
                  <span className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5" /> Craftsmen</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMobileSection === "craftsmen" ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === "craftsmen" && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
                    {craftsmenGroups.map((group) => (
                      <div key={group.group}>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wide mt-2">{group.group}</p>
                        {group.items.map((item) => (
                          <Link key={item} href={craftsmenHref(item)} onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-xs text-muted-foreground hover:text-foreground">{item}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Services section */}
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Services & Info</p>
                {secondaryNavItems.map((nav) => (
                  <div key={nav.key}>
                    <button
                      onClick={() => toggleMobileSection(nav.key)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg text-muted-foreground"
                    >
                      {nav.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMobileSection === nav.key ? "rotate-180" : ""}`} />
                    </button>
                    {openMobileSection === nav.key && (
                      <div className="ml-3 mt-1 mb-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                        {nav.items.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-xs text-muted-foreground hover:text-foreground">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Auth section */}
              <div className="border-t border-border pt-3 mt-3 space-y-1">
                {userName ? (
                  <>
                    <Link href="/dashboard" className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                      My Profile <User className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    {unreadCount > 0 && (
                      <Link href="/dashboard/messages" className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="flex items-center gap-2">
                          Messages
                          <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        </span>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg text-primary font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                        Admin panel <Shield className="h-4 w-4" />
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg text-foreground">
                      Sign Out <LogOut className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="block w-full text-center px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                )}
                <Link href="/post-listing" className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-2 text-sm rounded-lg font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                  Post Listing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
