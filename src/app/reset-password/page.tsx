"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Lock, Eye, EyeOff, Check } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the URL hash when this page loads
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Could not update password. The link may have expired.");
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {done ? (
            <div className="text-center flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-foreground mb-2">Password updated!</h2>
                <p className="text-muted-foreground text-sm">Redirecting you to your dashboard…</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-6">
                  <Home className="h-5 w-5" /> Rentnet
                </Link>
                <h1 className="text-2xl font-extrabold text-foreground mb-2">Set a new password</h1>
                <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5">
                {!ready ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Verifying your reset link…</p>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">New password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
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
                      ) : "Update password"}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
