"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2, FlaskConical } from "lucide-react";

export default function TestPaymentPage() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setInvoiceId("");

    try {
      const res = await fetch("/api/mpesa/test-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
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
    <div className="p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Payment Test</h1>
          <p className="text-sm text-muted-foreground">Send a real KES 5 STK push to verify IntaSend live keys</p>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-700 dark:text-amber-400">
        This will charge <strong>KES 5</strong> to the phone number you enter. Use your own number to confirm the full live payment flow works.
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
  );
}
