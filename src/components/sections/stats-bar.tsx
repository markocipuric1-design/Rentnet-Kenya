"use client";

import { useEffect, useRef, useState } from "react";
import { Home, TrendingUp, Building2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  activeListings: number;
  soldListings: number;
  agents: number;
};

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setValue(Math.round(current));
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const formatted = value >= 1000
    ? (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + "k"
    : value.toString();

  return <span ref={ref} className="tabular-nums">{formatted}{suffix}</span>;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats>({ activeListings: 0, soldListings: 0, agents: 0 });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [
        { count: activeListings },
        { count: soldListings },
        { count: agents },
      ] = await Promise.all([
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("listings").select("*", { count: "exact", head: true }).in("status", ["sold", "rented"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_type", "agencija"),
      ]);
      setStats({
        activeListings: activeListings ?? 0,
        soldListings: soldListings ?? 0,
        agents: agents ?? 0,
      });
    })();
  }, []);

  const statCards = [
    {
      number: stats.activeListings,
      suffix: "",
      label: "Active listings",
      icon: Home,
      color: "text-primary",
      iconBg: "bg-primary/10",
      glow: "from-primary/20 to-primary/5",
      border: "border-primary/20",
      blob: "bg-primary/15",
    },
    {
      number: stats.soldListings,
      suffix: "",
      label: "Sold & rented",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
      glow: "from-emerald-500/15 to-emerald-500/5",
      border: "border-emerald-500/20",
      blob: "bg-emerald-400/20",
    },
    {
      number: stats.agents,
      suffix: "",
      label: "Registered agencies",
      icon: Building2,
      color: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-500/10",
      glow: "from-sky-500/15 to-sky-500/5",
      border: "border-sky-500/20",
      blob: "bg-sky-400/20",
    },
    {
      number: 98,
      suffix: "%",
      label: "Satisfied clients",
      icon: Star,
      color: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
      glow: "from-amber-500/15 to-amber-500/5",
      border: "border-amber-500/20",
      blob: "bg-amber-400/20",
    },
  ];

  return (
    <div className="relative py-12 px-4 overflow-hidden bg-gradient-to-b from-accent/40 to-background dark:from-muted/20 dark:to-background">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className={`relative rounded-2xl p-5 flex flex-col gap-4 border backdrop-blur-sm overflow-hidden animate-fade-in-up bg-white/60 dark:bg-white/5 ${s.border} shadow-sm`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} pointer-events-none`} />

            {/* Blob glow */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-60 ${s.blob}`} />

            {/* Icon */}
            <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>

            {/* Number + label */}
            <div className="relative">
              <div className={`text-4xl font-black leading-none ${s.color}`}>
                <CountUp target={s.number} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted-foreground dark:text-white/45 mt-2 font-medium leading-tight">{s.label}</div>
            </div>

            {/* Bottom shimmer */}
            <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${s.glow}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
