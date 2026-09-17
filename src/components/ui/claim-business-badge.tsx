"use client";

import { useState } from "react";
import { UserCheck, Check } from "lucide-react";

export function ClaimBusinessBadge({ profileId, fullWidth = false }: { profileId: string; fullWidth?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleClaim = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/claim-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className={`flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl ${fullWidth ? "w-full justify-center text-center" : ""}`}>
        <Check className="h-3.5 w-3.5 flex-shrink-0" />
        Check the email on file for a link to claim this profile.
      </div>
    );
  }

  return (
    <button
      onClick={handleClaim}
      disabled={state === "sending"}
      title="If you're the real owner, we'll email the address already on file — never one you type here."
      className={`flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 border border-primary/20 px-3 py-2.5 rounded-xl transition-all disabled:opacity-60 ${fullWidth ? "w-full justify-center" : ""}`}
    >
      {state === "sending"
        ? <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        : <UserCheck className="h-3.5 w-3.5" />}
      {state === "sending" ? "Sending…" : state === "error" ? "Couldn't send — try again" : "Is this your business? Claim it"}
    </button>
  );
}
