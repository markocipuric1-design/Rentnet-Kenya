"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "rentnet_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl shadow-black/15 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cookie className="h-5 w-5 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm mb-0.5">We use cookies</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use cookies to improve your experience, analyse site traffic and personalise content. By clicking "Accept", you consent to our use of cookies in accordance with the{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline underline-offset-2 font-medium">Privacy Policy</Link>
            {" "}and{" "}
            <Link href="/cookie-policy" className="text-primary hover:underline underline-offset-2 font-medium">Cookie Policy</Link>.
            Kenya's Data Protection Act 2019 applies.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none border border-border hover:bg-accent text-muted-foreground hover:text-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-primary/20"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Accept
          </button>
          <button
            onClick={decline}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
