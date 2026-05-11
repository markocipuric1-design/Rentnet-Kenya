"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { Calculator, Home, TrendingUp, Info } from "lucide-react";

function fmt(n: number) {
  return `KES ${Math.round(n).toLocaleString("en-KE")}`;
}

type Tab = "mortgage" | "rental";

export default function MortgageCalculatorPage() {
  const [tab, setTab] = useState<Tab>("mortgage");

  // ── Mortgage inputs ──────────────────────────────────────────────────
  const [propPrice, setPropPrice]   = useState("5000000");
  const [downPct, setDownPct]       = useState("20");
  const [annualRate, setAnnualRate] = useState("13");
  const [termYears, setTermYears]   = useState("20");

  // ── Rental yield inputs ───────────────────────────────────────────────
  const [rentPrice, setRentPrice]   = useState("5000000");
  const [monthlyRent, setMonthlyRent] = useState("40000");
  const [annualExpPct, setAnnualExpPct] = useState("10");

  // ── Mortgage calc ─────────────────────────────────────────────────────
  const mortgage = useMemo(() => {
    const price  = parseFloat(propPrice)  || 0;
    const down   = price * (parseFloat(downPct) / 100);
    const P      = price - down;
    const r      = parseFloat(annualRate) / 100 / 12;
    const n      = parseInt(termYears) * 12;
    if (!P || !r || !n) return null;
    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return {
      loanAmount: P,
      downPayment: down,
      monthly,
      totalPayment: monthly * n,
      totalInterest: monthly * n - P,
    };
  }, [propPrice, downPct, annualRate, termYears]);

  // ── Rental yield calc ─────────────────────────────────────────────────
  const rental = useMemo(() => {
    const price   = parseFloat(rentPrice) || 0;
    const rent    = parseFloat(monthlyRent) || 0;
    const expPct  = parseFloat(annualExpPct) / 100;
    if (!price || !rent) return null;
    const grossAnnual = rent * 12;
    const netAnnual   = grossAnnual * (1 - expPct);
    return {
      grossYield: (grossAnnual / price) * 100,
      netYield:   (netAnnual  / price) * 100,
      annualIncome: grossAnnual,
      netIncome:    netAnnual,
      paybackYears: price / netAnnual,
    };
  }, [rentPrice, monthlyRent, annualExpPct]);

  const inputCls = "w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all";
  const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span>Tools</span>
            <span>/</span>
            <span className="text-foreground">Calculator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            Property Calculator
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Estimate monthly mortgage payments or calculate rental yield on any property in Kenya.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {([
            { id: "mortgage", label: "Mortgage", icon: Home },
            { id: "rental",   label: "Rental Yield", icon: TrendingUp },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? "bg-card shadow text-primary border border-border" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Inputs ── */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
            {tab === "mortgage" ? (
              <>
                <h2 className="font-bold text-foreground text-base">Loan Details</h2>
                <div>
                  <label className={labelCls}>Property Price (KES)</label>
                  <input type="number" value={propPrice} onChange={e => setPropPrice(e.target.value)} className={inputCls} min={0} />
                </div>
                <div>
                  <label className={labelCls}>Down Payment ({downPct}% = {fmt(parseFloat(propPrice || "0") * parseFloat(downPct || "0") / 100)})</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={80} step={5} value={downPct}
                      onChange={e => setDownPct(e.target.value)}
                      className="flex-1 accent-primary" />
                    <span className="text-sm font-bold text-primary w-12 text-right">{downPct}%</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Annual Interest Rate (%)</label>
                  <input type="number" value={annualRate} onChange={e => setAnnualRate(e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
                  <p className="text-[11px] text-muted-foreground mt-1">Kenya average: 12–14%</p>
                </div>
                <div>
                  <label className={labelCls}>Loan Term</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 20, 25, 30].map(y => (
                      <button key={y} onClick={() => setTermYears(String(y))}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all border ${termYears === String(y) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                        {y}yr
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-bold text-foreground text-base">Rental Details</h2>
                <div>
                  <label className={labelCls}>Property Value (KES)</label>
                  <input type="number" value={rentPrice} onChange={e => setRentPrice(e.target.value)} className={inputCls} min={0} />
                </div>
                <div>
                  <label className={labelCls}>Monthly Rent (KES)</label>
                  <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className={inputCls} min={0} />
                </div>
                <div>
                  <label className={labelCls}>Annual Expenses ({annualExpPct}% of value)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={30} step={1} value={annualExpPct}
                      onChange={e => setAnnualExpPct(e.target.value)}
                      className="flex-1 accent-primary" />
                    <span className="text-sm font-bold text-primary w-12 text-right">{annualExpPct}%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Includes maintenance, insurance, vacancies</p>
                </div>
              </>
            )}
          </div>

          {/* ── Results ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {tab === "mortgage" && mortgage ? (
              <>
                {/* Hero result */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-4xl font-extrabold text-primary">{fmt(mortgage.monthly)}</p>
                  <p className="text-xs text-muted-foreground mt-1">per month for {termYears} years</p>
                </div>
                {/* Breakdown cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Loan Amount", value: fmt(mortgage.loanAmount), sub: `${100 - parseInt(downPct)}% of price` },
                    { label: "Down Payment", value: fmt(mortgage.downPayment), sub: `${downPct}% upfront` },
                    { label: "Total Repayment", value: fmt(mortgage.totalPayment), sub: `over ${termYears} years` },
                    { label: "Total Interest", value: fmt(mortgage.totalInterest), sub: `${((mortgage.totalInterest / mortgage.loanAmount) * 100).toFixed(0)}% of loan` },
                  ].map(c => (
                    <div key={c.label} className="bg-card border border-border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="font-bold text-foreground text-base mt-0.5">{c.value}</p>
                      <p className="text-[11px] text-muted-foreground">{c.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Visual breakdown bar */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment breakdown</p>
                  <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
                    <div className="bg-emerald-500 rounded-full" style={{ width: `${(mortgage.downPayment / (parseFloat(propPrice) || 1)) * 100}%` }} />
                    <div className="bg-primary rounded-full" style={{ width: `${(mortgage.loanAmount / (parseFloat(propPrice) || 1)) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />Down ({downPct}%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />Loan ({100 - parseInt(downPct)}%)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  Estimates only. Actual rates vary by bank. Contact a financial advisor for personalised advice.
                </div>
              </>
            ) : tab === "rental" && rental ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Gross Yield</p>
                    <p className="text-4xl font-extrabold text-primary">{rental.grossYield.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">before expenses</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Net Yield</p>
                    <p className="text-4xl font-extrabold text-emerald-600">{rental.netYield.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">after expenses</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Annual Gross Income", value: fmt(rental.annualIncome) },
                    { label: "Annual Net Income", value: fmt(rental.netIncome) },
                    { label: "Payback Period", value: `${rental.paybackYears.toFixed(1)} yrs` },
                    { label: "Monthly Net", value: fmt(rental.netIncome / 12) },
                  ].map(c => (
                    <div key={c.label} className="bg-card border border-border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="font-bold text-foreground text-base mt-0.5">{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Yield rating</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(rental.netYield / 15 * 100, 100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${rental.netYield >= 7 ? "text-emerald-600" : rental.netYield >= 4 ? "text-amber-600" : "text-rose-600"}`}>
                      {rental.netYield >= 7 ? "Excellent" : rental.netYield >= 4 ? "Average" : "Below average"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">Kenya average net yield: 4–8%</p>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  Estimates only. Does not account for capital gains, taxes, or financing costs.
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Enter values to see results.</div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">Ready to find your property?</p>
            <p className="text-sm text-muted-foreground mt-0.5">Browse thousands of listings across Kenya.</p>
          </div>
          <Link href="/listings" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-md shadow-primary/20 whitespace-nowrap">
            Browse Listings
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
