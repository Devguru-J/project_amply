"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { joinDjQueue, leaveDjQueue, skipTrack } from "@/lib/db/queue";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import { AddTrackDialog } from "./AddTrackDialog";
import type { DjQueueEntry, Track } from "@/types/database";

interface Props {
  roomId: string;
  queue: DjQueueEntry[];
  currentUserId: string | null;
  currentTrack: Track | null;
}

export function DJQueue({ roomId, queue, currentUserId, currentTrack }: Props) {
  const supabase = getSupabaseBrowser();
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const myEntry = currentUserId ? queue.find((q) => q.user_id === currentUserId) : null;
  const head = queue[0] ?? null;
  const isMyTurn = !!head && head.user_id === currentUserId;
  const noTrackPlaying = !currentTrack;

  async function onJoin() {
    if (!currentUserId) return;
    setBusy(true);
    try {
      await joinDjQueue(supabase, roomId);
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    setBusy(true);
    try {
      await leaveDjQueue(supabase, roomId);
    } finally {
      setBusy(false);
    }
  }

  async function onSkip() {
    setBusy(true);
    try {
      await skipTrack(supabase, roomId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="bezel-shell">
        <div className="bezel-core p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:w-56 shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                DJ QUEUE
              </span>
              <span className="font-mono text-[10px] tabular-nums text-foreground/40">
                {queue.length} on deck
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {queue.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-foreground/50">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em]">EMPTY</span>
                  <span>· 첫 번째 DJ를 기다리는 중</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {queue.map((entry, i) => (
                    <Slot
                      key={entry.user_id}
                      entry={entry}
                      isCurrent={i === 0}
                      isMe={entry.user_id === currentUserId}
                      isPlaying={i === 0 && !!currentTrack}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:ml-auto">
              {isMyTurn && noTrackPlaying && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  disabled={busy}
                  className="animate-pulse-glow"
                >
                  곡 추가
                </Button>
              )}
              {isMyTurn && !noTrackPlaying && (
                <Button variant="outline" size="sm" onClick={onSkip} disabled={busy}>
                  스킵
                </Button>
              )}
              {myEntry ? (
                <Button variant="ghost" size="sm" onClick={onLeave} disabled={busy}>
                  큐에서 나가기
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onJoin}
                  disabled={busy || !currentUserId}
                >
                  DJ 참여
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddTrackDialog roomId={roomId} open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}

function Slot({
  entry,
  isCurrent,
  isMe,
  isPlaying,
}: {
  entry: DjQueueEntry;
  isCurrent: boolean;
  isMe: boolean;
  isPlaying: boolean;
}) {
  const name = entry.profile?.display_name ?? "guest";
  return (
    <div
      className={`relative shrink-0 flex items-center gap-3 pl-2 pr-4 h-12 rounded-full ring-1 transition-all duration-300 ${
        isCurrent
          ? isPlaying
            ? "bg-cyan-glow/10 ring-cyan-glow/40 glow-cyan"
            : "bg-cyan-glow/5 ring-cyan-glow/30 animate-pulse-glow"
          : "bg-white/5 ring-white/10"
      }`}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={entry.profile?.avatar_url ?? undefined} alt={name} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/50">
          {isCurrent ? (isPlaying ? "ON AIR" : "YOUR TURN") : `#${entry.position + 1}`}
          {isMe && " · YOU"}
        </span>
      </div>
    </div>
  );
}
