"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { getRecentMessages, getMessageWithProfile, postMessage } from "@/lib/db/messages";
import { subscribeToTable } from "@/lib/realtime";
import { initials, formatTimeAgo } from "@/lib/utils";
import type { ChatEntry, RoomMessage } from "@/types/database";

interface Props {
  roomId: string;
  currentUserId: string | null;
}

export function ChatPanel({ roomId, currentUserId }: Props) {
  const supabase = getSupabaseBrowser();
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Initial fetch + realtime subscription.
  useEffect(() => {
    let active = true;
    getRecentMessages(supabase, roomId).then((m) => {
      if (active) setMessages(m);
    });

    const channel = subscribeToTable<RoomMessage>(
      supabase,
      "room_messages",
      `room_id=eq.${roomId}`,
      async (payload) => {
        if (payload.eventType !== "INSERT") return;
        // Fetch with profile join (Postgres CDC payloads don't include the joined profile).
        const enriched = await getMessageWithProfile(supabase, payload.new.id);
        if (!enriched) return;
        setMessages((prev) => {
          if (prev.find((m) => m.id === enriched.id)) return prev;
          return [...prev, enriched];
        });
      },
    );

    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [roomId, supabase]);

  // Auto-scroll on new message.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId || !text.trim() || busy) return;
    setBusy(true);
    const content = text.trim().slice(0, 500);
    setText("");
    try {
      await postMessage(supabase, { roomId, userId: currentUserId, content });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bezel-shell h-full flex flex-col">
      <div className="bezel-core h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            CHAT
          </span>
          <span className="font-mono text-[10px] tabular-nums text-foreground/40">
            {messages.length}
          </span>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div ref={viewportRef} className="space-y-3 pb-2 max-h-full">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-foreground/40 py-8">
                아직 메시지가 없습니다.
                <br />첫 인사를 남겨보세요.
              </div>
            ) : (
              messages.map((m) => {
                const name = m.profile?.display_name ?? "guest";
                const mine = m.user_id === currentUserId;
                return (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarImage src={m.profile?.avatar_url ?? undefined} alt={name} />
                      <AvatarFallback>{initials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-medium truncate ${
                            mine ? "text-cyan-glow" : "text-foreground/85"
                          }`}
                        >
                          {name}
                        </span>
                        <span className="font-mono text-[9px] tabular-nums text-foreground/40">
                          {formatTimeAgo(m.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground/85 break-words leading-relaxed">
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="mt-3">
          <div className="relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={currentUserId ? "메시지를 입력하세요" : "로그인이 필요합니다"}
              disabled={!currentUserId || busy}
              maxLength={500}
              className="pr-12"
            />
            <button
              type="submit"
              disabled={!currentUserId || !text.trim() || busy}
              aria-label="send"
              className="absolute right-1 top-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-all duration-300 active:scale-[0.95] glow-cyan"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 12l14-7-7 14-2-5-5-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
