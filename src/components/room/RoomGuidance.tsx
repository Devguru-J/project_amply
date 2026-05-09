"use client";

import { Button } from "@/components/ui/button";

interface Props {
  currentUserId: string | null;
  queueLength: number;
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

export function RoomGuidance({
  currentUserId,
  queueLength,
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
  const title = getGuidanceTitle({
    currentUserId,
    queueLength,
    isCurrentDj,
    hasMyEntry,
    noTrackPlaying,
  });
  const description = getGuidanceDescription({
    currentUserId,
    myQueuePosition,
    isCurrentDj,
    hasMyEntry,
    noTrackPlaying,
  });

  return (
    <div className="bezel-shell">
      <div className="bezel-core p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-glow">
              NEXT MOVE
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground md:text-xl">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/55">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {isCurrentDj && noTrackPlaying && (
              <Button
                size="sm"
                onClick={onAddTrack}
                disabled={busy}
                className="animate-pulse-glow"
              >
                지금 한 곡 틀기
              </Button>
            )}
            {isCurrentDj && !noTrackPlaying && (
              <Button size="sm" variant="outline" onClick={onSkipTrack} disabled={busy}>
                스킵
              </Button>
            )}
            {!hasMyEntry && (
              <Button
                size="sm"
                variant={queueLength === 0 ? "default" : "outline"}
                onClick={onJoinQueue}
                disabled={!currentUserId || busy}
              >
                첫 DJ로 부스에 서기
              </Button>
            )}
            {hasMyEntry && !isCurrentDj && (
              <Button size="sm" variant="ghost" onClick={onLeaveQueue} disabled={busy}>
                줄에서 빠지기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGuidanceTitle({
  currentUserId,
  queueLength,
  isCurrentDj,
  hasMyEntry,
  noTrackPlaying,
}: Pick<
  Props,
  "currentUserId" | "queueLength" | "isCurrentDj" | "hasMyEntry" | "noTrackPlaying"
>) {
  if (!currentUserId) return "입장 정보를 확인하는 중";
  if (queueLength === 0) return "첫 DJ를 기다리는 중";
  if (isCurrentDj && noTrackPlaying) return "당신 차례입니다";
  if (isCurrentDj) return "지금 당신이 DJ입니다";
  if (hasMyEntry) return "차례가 다가오고 있습니다";
  return "같이 듣거나, 부스에 서세요";
}

function getGuidanceDescription({
  currentUserId,
  myQueuePosition,
  isCurrentDj,
  hasMyEntry,
  noTrackPlaying,
}: Pick<
  Props,
  "currentUserId" | "myQueuePosition" | "isCurrentDj" | "hasMyEntry" | "noTrackPlaying"
>) {
  if (!currentUserId) return "로그인 세션을 확인한 뒤 방에 입장합니다.";
  if (isCurrentDj && noTrackPlaying) {
    return "YouTube 링크를 붙여넣으면 방 안의 모두에게 바로 재생됩니다.";
  }
  if (isCurrentDj) {
    return "곡이 끝나면 자동으로 다음 DJ에게 넘어갑니다. 필요하면 직접 스킵할 수 있습니다.";
  }
  if (hasMyEntry) {
    return `${myQueuePosition + 1}번째로 대기 중입니다. 앞 차례가 끝나면 한 곡을 틀 수 있습니다.`;
  }
  return "DJ 큐에 서면 내 차례에 한 곡을 틀 수 있습니다. 듣기만 해도 괜찮습니다.";
}
