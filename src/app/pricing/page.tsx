"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { Home, Check, Zap, Building2, Phone, CheckCircle, AlertCircle, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type PaymentState = "idle" | "pending" | "complete" | "failed";

const FEATURES_FREE = [
  "1 active listing",
  "Public profile",
  "Messaging",
  "Basic analytics",
];

const FEATURES_AGENCY = [
  "999 active listings",
  "Verified agency profile",
  "Priority support",
  "Advanced analytics",
  "Logo & cover photo",
  "Social media & website",
  "Agency description & specialisations",
  "Eligible for client reviews",
];

export default function CenikPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (paymentState !== "pending" || !checkoutId) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpesa/status?id=${checkoutId}&type=agency`);
        const data = await res.json();
        if (data.state === "COMPLETE") {
          setPaymentState("complete");
          clearInterval(pollingRef.current!);
        } else if (data.state === "FAILED") {
          setErrorMsg(data.failed_reason ?? "Payment failed or was cancelled. Please try again.");
          setPaymentState("failed");
          clearInterval(pollingRef.current!);
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [paymentState, checkoutId]);

  const handleSubscribe = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/mpesa/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json();
      if (data.error === "Unauthorized") {
        router.push("/login?redirect=/pricing");
        return;
      }
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }
      if (data.checkout_id) {
        setCheckoutId(data.checkout_id);
        setPaymentState("pending");
      }
    } catch {
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        <Breadcrumb items={[{ label: "Pricing" }]} className="mb-10" />

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Zap className="h-3.5 w-3.5" /> Simple pricing
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Choose your plan
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Individuals list for free. Agencies unlock all features with an annual plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free plan */}
          <div className="relative flex flex-col rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 p-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-accent text-muted-foreground">
              <Home className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Free</h2>
            <p className="text-sm text-muted-foreground mb-5">For individuals looking to sell or rent out a property.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-foreground">KES 0</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-3 rounded-xl font-semibold text-sm bg-muted text-foreground cursor-default opacity-60">
              Current Plan
            </button>
          </div>

          {/* Agency plan */}
          <div className="relative flex flex-col rounded-3xl border border-primary bg-card shadow-2xl shadow-primary/15 scale-[1.02] p-8 transition-all duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
              Recommended for agencies
            </div>

            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-primary/15 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Agency</h2>
            <p className="text-sm text-muted-foreground mb-5">For real estate agencies with a larger portfolio of listings.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-foreground">KES 25,000</span>
              <span className="text-muted-foreground text-sm ml-1">/ year</span>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {FEATURES_AGENCY.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Payment flow */}
            {paymentState === "idle" && (
              <div className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full border border-border bg-muted/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errorMsg}
                  </p>
                )}
                <button
                  onClick={handleSubscribe}
                  disabled={loading || !phone.trim()}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Initiating…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#4CAF50] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">M</span>
                      Pay with M-Pesa
                    </span>
                  )}
                </button>
              </div>
            )}

            {paymentState === "pending" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-foreground">Check your phone</p>
                <p className="text-xs text-muted-foreground">
                  An M-Pesa STK push has been sent to <strong>{phone}</strong>. Enter your PIN to complete the payment.
                </p>
              </div>
            )}

            {paymentState === "complete" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-600">Payment complete!</p>
                <p className="text-xs text-muted-foreground">Your agency plan is now active. Go to your dashboard to get started.</p>
                <Link href="/dashboard" className="mt-1 text-xs font-semibold text-primary hover:underline">
                  Go to dashboard →
                </Link>
              </div>
            )}

            {paymentState === "failed" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                  <X className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{errorMsg}</p>
                </div>
                <button
                  onClick={() => { setPaymentState("idle"); setErrorMsg(null); }}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          One-time annual payment. Renews yearly. Secure M-Pesa payment via IntaSend.
        </p>
      </main>

      <Footer />
    </div>
  );
}
