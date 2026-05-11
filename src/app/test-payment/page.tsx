"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { CheckCircle, AlertTriangle, Loader2, FlaskConical, Lock } from "lucide-react";

const SESSION_KEY = "tp_unlocked";
const PW_KEY = "tp_pw";

export default function TestPaymentPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate password against the API (server holds the secret)
    const res = await fetch("/api/mpesa/public-test-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: "0700000000", password: passwordInput }),
    });

    if (res.status === 401) {
      setPasswordError("Incorrect password.");
      return;
    }
    if (res.status === 503) {
      setPasswordError("Test payments are not configured on this environment.");
      return;
    }

    // Any other response (even success/error) means password was accepted
    sessionStorage.setItem(SESSION_KEY, "1");
    sessionStorage.setItem(PW_KEY, passwordInput);
    setUnlocked(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setInvoiceId("");

    const password = passwordInput || sessionStorage.getItem(PW_KEY) || "";

    try {
      const res = await fetch("/api/mpesa/public-test-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Unknown error");
        return;
      }

      setStatus("success");
      setInvoiceId(data.checkout_id);
      setMessage("STK push sent! Check your phone for the M-Pesa prompt.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Network error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {!unlocked ? (
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Restricted Page</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">Enter the password to access the payment test</p>
            </div>

            <form onSubmit={handleUnlock} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoFocus
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {passwordError && (
                  <p className="text-xs text-destructive mt-1.5">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!passwordInput.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                Unlock
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              <Link href="/" className="hover:text-primary transition-colors">← Back to Rentnet</Link>
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Live Payment Test</h1>
                <p className="text-sm text-muted-foreground">Send a real KES 5 STK push to verify M-Pesa</p>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-700 dark:text-amber-400">
              This will charge <strong>KES 5</strong> to the phone number you enter. Use your own number only.
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">M-Pesa phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">Accepts 07XX, 01XX, or 254 format</p>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !phone.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending STK push…</>
                ) : (
                  "Send KES 5 test payment"
                )}
              </button>
            </form>

            {status === "success" && (
              <div className="mt-5 bg-green-500/5 border border-green-500/20 rounded-2xl px-5 py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">{message}</p>
                    {invoiceId && (
                      <p className="text-xs text-muted-foreground mt-1">Invoice ID: <code className="font-mono">{invoiceId}</code></p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="mt-5 bg-destructive/5 border border-destructive/20 rounded-2xl px-5 py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Payment failed</p>
                    <p className="text-xs text-muted-foreground mt-1">{message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
