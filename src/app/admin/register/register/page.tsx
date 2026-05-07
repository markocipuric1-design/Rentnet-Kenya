"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home, Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone,
  Check, Shield, KeyRound,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { verifyAdminSecret } from "./actions";
import { toAgentSlug } from "@/lib/utils";

type Stage = "code" | "register";

export default function AdminRegistracijaPage() {
  const [stage, setStage] = useState<Stage>("code");

  // Code stage
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  // Register stage
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-destructive", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"][passwordStrength];

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    if (!code.trim()) { setCodeError("Enter the access code."); return; }
    setCodeLoading(true);
    const valid = await verifyAdminSecret(code.trim());
    setCodeLoading(false);
    if (!valid) {
      setCodeError("Invalid access code.");
      return;
    }
    setStage("register");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Please fill in all required fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== passwordConfirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone, account_type: "administrator" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "This email address is already registered."
        : "Registration error. Please try again.");
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name,
        email,
        phone,
        account_type: "administrator",
        slug: toAgentSlug(name),
      });
    }
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {success ? (
            <div className="text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-12 w-12 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-foreground mb-2">Administrator created!</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Check your email for a confirmation message.
                </p>
              </div>
              <Link
                href="/login"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-primary/25"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          ) : stage === "code" ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground mb-2">Administrator Access</h1>
                <p className="text-sm text-muted-foreground">Enter the access code to continue.</p>
              </div>

              <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:20px_20px]" />
                </div>

                <form onSubmit={handleVerifyCode} className="relative flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Access Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                        autoFocus
                      />
                    </div>
                  </div>

                  {codeError && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
                      {codeError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={codeLoading}
                    className="w-full bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    {codeLoading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <> Continue <ArrowRight className="h-4 w-4" /> </>
                    }
                  </button>
                </form>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                <Link href="/" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Home className="h-3 w-3" /> Back to home
                </Link>
              </p>
            </>

          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  <Shield className="h-3.5 w-3.5" /> Administrator
                </div>
                <h1 className="text-2xl font-extrabold text-foreground mb-2">Create administrator account</h1>
                <p className="text-sm text-muted-foreground">Access confirmed. Fill in your account details.</p>
              </div>

              <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:20px_20px]" />
                </div>

                <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Full name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {/* Email + phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Email *</label>
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
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          placeholder="+254 712 345 678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Password * (at least 8 characters)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
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
                    {password && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor : "bg-border"}`} />
                          ))}
                        </div>
                        <span className={`text-[11px] font-semibold ${passwordStrength <= 1 ? "text-destructive" : passwordStrength === 2 ? "text-amber-500" : "text-emerald-500"}`}>
                          {strengthLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/60 bg-background ${
                          passwordConfirm && password !== passwordConfirm
                            ? "border-destructive focus:border-destructive focus:ring-destructive/10"
                            : passwordConfirm && password === passwordConfirm
                            ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-border focus:border-primary/50 focus:ring-primary/10"
                        }`}
                      />
                      {passwordConfirm && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {password === passwordConfirm
                            ? <Check className="h-4 w-4 text-emerald-500" />
                            : <span className="text-destructive text-xs font-bold">✗</span>
                          }
                        </div>
                      )}
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
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <> Create account <ArrowRight className="h-4 w-4" /> </>
                    }
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
