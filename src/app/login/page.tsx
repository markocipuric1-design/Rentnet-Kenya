"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Eye, EyeOff, ArrowRight, Mail, Lock, Check } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(redirect), 1000);
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-6">
                  <Home className="h-5 w-5" /> Rentnet
                </Link>
                <h1 className="text-2xl font-extrabold text-foreground mb-2">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary font-semibold hover:underline underline-offset-4">
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Card */}
              <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:20px_20px]" />
                </div>

                <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                  {/* Social login */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogle}
                      className="flex items-center justify-center gap-2 border border-border hover:border-primary/40 hover:bg-accent rounded-xl py-2.5 text-sm font-medium transition-all"
                    >
                      <span className="text-base">G</span>
                      Google
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 border border-border hover:border-primary/40 hover:bg-accent rounded-xl py-2.5 text-sm font-medium transition-all opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <span className="text-base">f</span>
                      Facebook
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or with email</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Email */}
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

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-foreground">Password</label>
                      <a href="/faq#passwords" className="text-xs text-primary hover:underline underline-offset-4">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setRemember(!remember)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${remember ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}
                    >
                      {remember && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>

                  {/* Error */}
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <> Sign In <ArrowRight className="h-4 w-4" /> </>
                    )}
                  </button>
                </form>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                By signing in you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">terms of use</a> and{" "}
                <a href="/privacy-policy" className="text-primary hover:underline">privacy policy</a>.
              </p>
            </>
          ) : (
            /* Success */
            <div className="text-center flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-foreground mb-2">Signed in successfully!</h2>
                <p className="text-muted-foreground text-sm">Redirecting you now…</p>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-primary/25"
              >
                <Home className="h-4 w-4" /> Home
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
