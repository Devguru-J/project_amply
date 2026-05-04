"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { reactToTrack, getReactionsForTrack } from "@/lib/db/reactions";
import { subscribeToTable } from "@/lib/realtime";
import type { ReactionKind, Track, TrackReaction } from "@/types/database";

interface Props {
  track: Track | null;
  currentUserId: string | null;
}

export function ReactionBar({ track, currentUserId }: Props) {
  const supabase = getSupabaseBrowser();
  const [reactions, setReactions] = useState<TrackReaction[]>([]);

  useEffect(() => {
    if (!track) {
      setReactions([]);
      return;
    }
    let active = true;
    getReactionsForTrack(supabase, track.id).then((r) => {
      if (active) setReactions(r);
    });

    const channel = subscribeToTable<TrackReaction>(
      supabase,
      "track_reactions",
      `track_id=eq.${track.id}`,
      (payload) => {
        setReactions((prev) => {
          if (payload.eventType === "INSERT") {
            if (prev.find((r) => r.user_id === payload.new.user_id)) return prev;
            return [...prev, payload.new];
          }
          if (payload.eventType === "UPDATE") {
            return prev.map((r) =>
              r.user_id === payload.new.user_id ? payload.new : r,
            );
          }
          if (payload.eventType === "DELETE") {
            return prev.filter((r) => r.user_id !== payload.old.user_id);
          }
          return prev;
        });
      },
    );

    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [track?.id, supabase, track]);

  const ups = reactions.filter((r) => r.kind === "up").length;
  const downs = reactions.filter((r) => r.kind === "down").length;
  const mine = currentUserId ? reactions.find((r) => r.user_id === currentUserId)?.kind : null;

  async function react(kind: ReactionKind) {
    if (!track || !currentUserId) return;
    try {
      await reactToTrack(supabase, track.id, kind);
    } catch {
      /* ignore */
    }
  }

  const disabled = !track || !currentUserId;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => react("up")}
        className={`group inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full ring-1 transition-all duration-300 active:scale-[0.97] ${
          mine === "up"
            ? "bg-cyan-glow/15 ring-cyan-glow/40 text-cyan-glow glow-cyan"
            : "bg-white/5 ring-white/10 text-foreground/80 hover:bg-white/[0.08]"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <ThumbUp />
        <span className="font-mono text-xs tabular-nums">{ups}</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => react("down")}
        className={`group inline-flex items-center gap-2 h-10 pl-3 pr-4 rounded-full ring-1 transition-all duration-300 active:scale-[0.97] ${
          mine === "down"
            ? "bg-magenta-glow/15 ring-magenta-glow/40 text-magenta-glow glow-magenta"
            : "bg-white/5 ring-white/10 text-foreground/80 hover:bg-white/[0.08]"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <ThumbDown />
        <span className="font-mono text-xs tabular-nums">{downs}</span>
      </button>
    </div>
  );
}

function ThumbUp() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 11v8H4v-8h3zm0 0l4-7c1.5 0 2 1 2 2v3h5a2 2 0 012 2l-1.5 7a2 2 0 01-2 1.5H7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ThumbDown() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 13V5H4v8h3zm0 0l4 7c1.5 0 2-1 2-2v-3h5a2 2 0 002-2l-1.5-7A2 2 0 0016.5 4H7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
