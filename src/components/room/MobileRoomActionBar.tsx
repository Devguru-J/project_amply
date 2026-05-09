"use client";

import { Button } from "@/components/ui/button";

interface Props {
  currentUserId: string | null;
  isCurrentDj: boolean;
  hasMyEntry: boolean;
  myQueuePosition: number;
  noTrackPlaying: boolean;
  busy: boolean;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onAddTrack: () => void;
  onSkipTrack: () => void;
}

export function MobileRoomActionBar({
  currentUserId,
  isCurrentDj,
  hasMyEntry,
  myQueuePosition,
  noTrackPlaying,
  busy,
  onJoinQueue,
  onLeaveQueue,
  onAddTrack,
  onSkipTrack,
}: Props) {
  const status = isCurrentDj
    ? noTrackPlaying
      ? "내 차례"
      : "ON AIR"
    : hasMyEntry
      ? `${myQueuePosition + 1}번째 대기`
      : "듣는 중";

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
      <div className="rounded-[1.75rem] bg-background/85 p-2 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 px-2">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">
              NEXT
            </div>
            <div className="truncate text-sm font-medium text-foreground">{status}</div>
          </div>
          <a
            href="#room-chat"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white/5 px-4 text-xs font-medium text-foreground/80 ring-1 ring-white/10"
          >
            채팅
          </a>
          {isCurrentDj && noTrackPlaying ? (
            <Button size="sm" onClick={onAddTrack} disabled={busy} className="h-10 px-4">
              곡 추가
            </Button>
          ) : isCurrentDj ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onSkipTrack}
              disabled={busy}
              className="h-10 px-4"
            >
              스킵
            </Button>
          ) : hasMyEntry ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={onLeaveQueue}
              disabled={busy}
              className="h-10 px-3"
            >
              나가기
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onJoinQueue}
              disabled={!currentUserId || busy}
              className="h-10 px-4"
            >
              DJ 참여
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
