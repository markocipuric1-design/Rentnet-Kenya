"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Mail, ArrowRight, Check } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError("Could not send reset email. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-6">
                  <Home className="h-5 w-5" /> Rentnet
                </Link>
                <h1 className="text-2xl font-extrabold text-foreground mb-2">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <> Send reset link <ArrowRight className="h-4 w-4" /> </>
                    )}
                  </button>
                </form>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remembered it?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-4">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-foreground mb-2">Check your inbox</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  We sent a password reset link to <strong className="text-foreground">{email}</strong>. It expires in 1 hour.
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm text-primary font-semibold hover:underline underline-offset-4"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
