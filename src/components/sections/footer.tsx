"use client";

import Link from "next/link";
import { Home } from "lucide-react";

const socials = [
  { label: "FB", name: "Facebook", href: "#" },
  { label: "IG", name: "Instagram", href: "#" },
  { label: "IN", name: "LinkedIn", href: "#" },
  { label: "TW", name: "Twitter / X", href: "#" },
];

const links = {
  Properties: [
    { label: "Apartments", href: "/listings?type=Apartment" },
    { label: "Houses", href: "/listings?type=House" },
    { label: "Commercial", href: "/listings?type=Commercial" },
    { label: "New Developments", href: "/listings?type=New+build" },
    { label: "Land", href: "/listings?type=Land" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Agencies", href: "/agencies" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Mortgage Calculator", href: "#" },
    { label: "Legal Advice", href: "/services/legal" },
    { label: "FAQ", href: "/faq" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-zinc-950 text-white/55 pt-14 pb-6 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

        {/* Brand column */}
        <div>
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl mb-3">
            <Home className="h-5 w-5" /> Rentnet
          </Link>
          <p className="text-sm leading-relaxed max-w-[220px] font-light mb-6">
            Kenya&apos;s leading real estate platform — buy, sell and rent properties across the country.
          </p>
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="w-8 h-8 rounded-lg bg-white/8 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors text-[10px] font-bold"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">
              {heading}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-primary transition-colors font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto border-t border-white/10 pt-5 flex justify-between flex-wrap gap-3 text-xs font-light">
        <span>© 2025 Rentnet · All rights reserved</span>
        <span className="flex gap-4">
          {[
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Terms", href: "/terms" },
            { label: "Cookies", href: "/cookie-policy" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/admin/register" className="hover:text-primary/60 transition-colors text-white/20">
            Admin
          </Link>
        </span>
      </div>
    </footer>
  );
}
