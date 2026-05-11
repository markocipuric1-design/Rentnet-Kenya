"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "rentnet_cookie_consent";

type Consent = {
  necessary: true;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const DEFAULT_CONSENT: Consent = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

function saveConsent(prefs: Consent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event("rentnet:consent"));
}

const CATEGORIES = [
  {
    key: "necessary" as const,
    label: "Necessary",
    always: true,
    description: "Required for the site to work — authentication, security tokens, and session management. Cannot be disabled.",
  },
  {
    key: "analytics" as const,
    label: "Analytics",
    always: false,
    description: "Helps us understand how visitors use Rentnet (page views, traffic sources) via Google Analytics. No personal data is sold.",
  },
  {
    key: "functional" as const,
    label: "Functional",
    always: false,
    description: "Enables enhanced features like interactive maps (Mapbox), saved preferences, and personalised content.",
  },
  {
    key: "marketing" as const,
    label: "Marketing",
    always: false,
    description: "Used for targeted advertising and remarketing campaigns. Currently not active — reserved for future use.",
  },
];

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState<Consent>(DEFAULT_CONSENT);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    } else {
      try {
        setPrefs(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const acceptAll = () => {
    const all: Consent = { necessary: true, analytics: true, functional: true, marketing: true };
    saveConsent(all);
    setPrefs(all);
    setVisible(false);
    setModalOpen(false);
  };

  const rejectAll = () => {
    saveConsent(DEFAULT_CONSENT);
    setPrefs(DEFAULT_CONSENT);
    setVisible(false);
    setModalOpen(false);
  };

  const saveCustom = () => {
    saveConsent(prefs);
    setVisible(false);
    setModalOpen(false);
  };

  const toggle = (key: keyof Omit<Consent, "necessary">) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible && !modalOpen) return null;

  return (
    <>
      {/* ── Bottom banner ── */}
      {visible && !modalOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl shadow-black/15 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm mb-0.5">We use cookies</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies to improve your experience, analyse traffic and personalise content. You can choose which categories to allow.{" "}
                  <Link href="/cookie-policy" className="text-primary hover:underline font-medium">Cookie Policy</Link>
                  {" "}· Kenya Data Protection Act 2019.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={rejectAll}
                  className="flex-1 sm:flex-none border border-border hover:bg-accent text-muted-foreground hover:text-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 sm:flex-none border border-primary/40 text-primary hover:bg-primary/5 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                >
                  Manage
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-primary/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Accept All
                </button>
                <button
                  onClick={rejectAll}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preferences modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cookie className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-bold text-foreground text-base">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => { setModalOpen(false); setVisible(true); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Categories */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-xs text-muted-foreground mb-4">
                Choose which cookies you allow. Necessary cookies cannot be disabled as they are required for the site to function.{" "}
                <Link href="/cookie-policy" className="text-primary hover:underline">Learn more</Link>.
              </p>

              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="border border-border rounded-xl overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setExpanded(expanded === cat.key ? null : cat.key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {cat.always ? (
                          <div className="w-10 h-5 bg-primary rounded-full flex items-center justify-end px-0.5">
                            <div className="w-4 h-4 bg-white rounded-full shadow" />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggle(cat.key as keyof Omit<Consent, "necessary">); }}
                            className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                              prefs[cat.key] ? "bg-primary justify-end" : "bg-muted justify-start"
                            }`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow" />
                          </button>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                        {cat.always && (
                          <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Always on</span>
                        )}
                      </div>
                    </div>
                    {expanded === cat.key
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    }
                  </div>
                  {expanded === cat.key && (
                    <div className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3 bg-muted/30">
                      {cat.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-2">
              <button
                onClick={rejectAll}
                className="flex-1 border border-border hover:bg-accent text-muted-foreground font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                Reject All
              </button>
              <button
                onClick={saveCustom}
                className="flex-1 border border-primary/40 text-primary hover:bg-primary/5 font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                Save My Choices
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
