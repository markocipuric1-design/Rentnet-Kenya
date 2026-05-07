"use client";

import { Download, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export function DownloadButton({
  isLoggedIn,
  label,
  className,
}: {
  isLoggedIn: boolean;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <button
        onClick={() => window.print()}
        className={className ?? "flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 whitespace-nowrap"}
      >
        <Download className="h-4 w-4" /> {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push("/login")}
      className={className ?? "flex items-center gap-2 border border-border bg-card hover:bg-accent text-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap"}
    >
      <LogIn className="h-4 w-4" /> Sign in to download
    </button>
  );
}
