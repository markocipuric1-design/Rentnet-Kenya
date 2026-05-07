"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";

const RentnetAgentForm = dynamic(
  () => import("@/components/ui/rentnet-agent-form").then((m) => ({ default: m.RentnetAgentForm }))
);

export function AgentFormButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        <Plus className="h-4 w-4" /> Become an Agent
      </button>
      {open && (
        <RentnetAgentForm
          onClose={() => setOpen(false)}
          onSuccess={() => { router.refresh(); setOpen(false); }}
        />
      )}
    </>
  );
}
