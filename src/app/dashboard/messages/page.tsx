"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";

type ConvRow = {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  otherName: string | null;
  lastMessage: string | null;
  unreadCount: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en-KE", { weekday: "short" });
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/dashboard/messages"); return; }

      const { data: convs } = await supabase
        .from("conversations")
        .select(`id, participant_1, participant_2, last_message_at,
          p1:profiles!participant_1(full_name),
          p2:profiles!participant_2(full_name)`)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (!convs?.length) { setLoading(false); return; }

      const convIds = convs.map((c) => c.id);

      const [{ data: allMsgs }, { data: unreadMsgs }] = await Promise.all([
        supabase
          .from("messages")
          .select("conversation_id, body, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("conversation_id")
          .in("conversation_id", convIds)
          .neq("sender_id", user.id)
          .is("read_at", null),
      ]);

      const lastMsgMap: Record<string, string> = {};
      (allMsgs ?? []).forEach((m) => {
        if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m.body;
      });
      const unreadMap: Record<string, number> = {};
      (unreadMsgs ?? []).forEach((m) => {
        unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1;
      });

      setConversations(
        convs.map((c) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const other = c.participant_1 === user.id ? (c as any).p2 : (c as any).p1;
          return {
            id: c.id,
            participant_1: c.participant_1,
            participant_2: c.participant_2,
            last_message_at: c.last_message_at,
            otherName: other?.full_name ?? null,
            lastMessage: lastMsgMap[c.id] ?? null,
            unreadCount: unreadMap[c.id] ?? 0,
          };
        })
      );
      setLoading(false);
    })();
  }, [router]);

  const filtered = conversations.filter(
    (c) => !search || c.otherName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Messages</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your conversations with agents and owners</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No messages</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              When you start a conversation with an agent or owner, it will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/messages/${c.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors ${c.unreadCount > 0 ? "bg-primary/5" : ""}`}
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {c.otherName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${c.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {c.otherName ?? "Unknown user"}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatTime(c.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${c.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {c.lastMessage ?? "Start a conversation…"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
