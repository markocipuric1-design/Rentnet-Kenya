"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params?.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    if (!convId) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user) { if (!user) router.push("/login"); return; }
      setUserId(user.id);

      const { data: conv } = await supabase
        .from("conversations")
        .select(`id, participant_1, participant_2,
          p1:profiles!participant_1(full_name),
          p2:profiles!participant_2(full_name)`)
        .eq("id", convId)
        .single();

      if (!conv) { router.push("/dashboard/messages"); return; }
      if (conv.participant_1 !== user.id && conv.participant_2 !== user.id) {
        router.push("/dashboard/messages"); return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const other = conv.participant_1 === user.id ? (conv as any).p2 : (conv as any).p1;
      setOtherName(other?.full_name ?? null);

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, body, read_at, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 50);

      // Mark incoming as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", convId)
        .neq("sender_id", user.id)
        .is("read_at", null);

      if (cancelled) return;

      // Real-time — unique name prevents Supabase from returning a cached subscribed channel
      channel = supabase
        .channel(`conv-${convId}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.sender_id !== user.id) {
              supabase.from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMsg.id)
                .then(() => {});
            }
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [convId, router, scrollToBottom]);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || !userId || sending) return;
    setSending(true);
    setInput("");
    const supabase = createClient();
    await supabase.from("messages").insert({ conversation_id: convId, sender_id: userId, body });
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", convId);
    fetch("/api/push/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: convId, body }),
    }).catch(() => {});
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group by day
  const grouped: { day: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const day = m.created_at.split("T")[0];
    const last = grouped[grouped.length - 1];
    if (last?.day === day) last.msgs.push(m);
    else grouped.push({ day, msgs: [m] });
  });

  const initials = otherName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

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

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-6" style={{ height: "calc(100vh - 64px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <Link href="/dashboard/messages"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all flex-shrink-0">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <p className="font-bold text-foreground text-sm">{otherName ?? "Unknown user"}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 mb-4 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Start a conversation…</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {grouped.map(({ day, msgs }) => (
                <div key={day}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground font-medium px-1">{formatDayLabel(day)}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {msgs.map((m, i) => {
                    const isMine = m.sender_id === userId;
                    const prevSame = i > 0 && msgs[i - 1].sender_id === m.sender_id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} ${prevSame ? "mt-0.5" : "mt-2"}`}>
                        <div className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                          <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}>
                            {m.body}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                            {formatMsgTime(m.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end flex-shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground resize-none"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 flex-shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-xl flex items-center justify-center transition-all shadow-md shadow-primary/20"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
