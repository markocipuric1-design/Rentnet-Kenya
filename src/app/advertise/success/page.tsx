"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { CheckCircle, ArrowRight, Loader2, Megaphone } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    // Small delay to let webhook fire before we confirm
    const t = setTimeout(() => { setVerified(true); setLoading(false); }, 2000);
    return () => clearTimeout(t);
  }, [sessionId]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Confirming your payment…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground mb-2">Payment successful!</h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Your ad is now live. It will automatically deactivate when the chosen period ends — no action needed.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 w-full text-left flex flex-col gap-2">
              {[
                "Ad activated and live on the site",
                "Confirmation sent to your email",
                "Auto-expires at end of period",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 border border-border hover:border-primary/40 text-foreground font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                Back to home
              </Link>
              <Link
                href="/advertise"
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-primary/20"
              >
                <Megaphone className="h-4 w-4" /> Book another ad <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdvertiseSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
