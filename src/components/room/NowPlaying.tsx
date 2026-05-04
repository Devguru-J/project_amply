"use client";

import { useEffect, useState } from "react";
import type { Profile, Track } from "@/types/database";

interface Props {
  track: Track | null;
  djProfile: Profile | null;
}

export function NowPlaying({ track, djProfile }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!track) {
      setElapsed(0);
      return;
    }
    const start = new Date(track.started_at).getTime();
    const update = () => setElapsed(Math.max(0, (Date.now() - start) / 1000));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [track?.id, track?.started_at, track]);

  if (!track) {
    return (
      <div className="bezel-shell">
        <div className="bezel-core p-5 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Bar h={8} delay={0} dim />
            <Bar h={12} delay={120} dim />
            <Bar h={6} delay={240} dim />
            <Bar h={10} delay={60} dim />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
              IDLE · NO TRACK
            </div>
            <div className="text-foreground/45 text-sm mt-0.5">
              누군가 큐의 첫 번째에 오르길 기다리는 중
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bezel-shell glow-cyan">
      <div className="bezel-core p-5 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Bar h={14} delay={0} />
          <Bar h={20} delay={120} />
          <Bar h={10} delay={240} />
          <Bar h={18} delay={60} />
          <Bar h={12} delay={180} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-glow flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse-glow" />
            ON AIR · DJ {djProfile?.display_name ?? "—"}
          </div>
          <div className="mt-1 font-display text-lg md:text-xl font-semibold tracking-tight truncate">
            {track.title}
          </div>
          {track.channel && (
            <div className="text-sm text-foreground/55 truncate">{track.channel}</div>
          )}
        </div>
        <div className="text-right hidden md:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            ELAPSED
          </div>
          <div className="font-mono text-sm text-foreground/85 tabular-nums mt-1">
            {fmt(elapsed)}
            {track.duration_sec ? <span className="text-foreground/40"> / {fmt(track.duration_sec)}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function Bar({ h, delay, dim }: { h: number; delay: number; dim?: boolean }) {
  return (
    <span
      className={`block w-[3px] rounded-full ${
        dim
          ? "bg-white/20"
          : "bg-gradient-to-t from-cyan-glow to-magenta-glow animate-pulse-glow"
      }`}
      style={{ height: h, animationDelay: `${delay}ms` }}
    />
  );
}
