"use client";

import { useEffect, useRef, useState } from "react";
import type { Track } from "@/types/database";

let iframeApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (iframeApiPromise) return iframeApiPromise;

  iframeApiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src*="iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });

  return iframeApiPromise;
}

interface Props {
  track: Track | null;
  isMaster: boolean; // true if this client should report track-end
  muted: boolean;
  onEnded: () => void;
}

export function YouTubePlayer({ track, isMaster, muted, onEnded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const onEndedRef = useRef(onEnded);
  const isMasterRef = useRef(isMaster);
  const [ready, setReady] = useState(false);
  const [showPlayHint, setShowPlayHint] = useState(false);

  // Keep refs current so callbacks don't capture stale values.
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    isMasterRef.current = isMaster;
  }, [isMaster]);

  // Initialize player exactly once.
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 1,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              if (isMasterRef.current) onEndedRef.current();
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new track when track changes.
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (!track) {
      setShowPlayHint(false);
      try {
        playerRef.current.stopVideo();
      } catch {
        /* noop */
      }
      return;
    }
    try {
      playerRef.current.loadVideoById(track.video_id);
      const id = window.setTimeout(() => setShowPlayHint(true), 1200);
      return () => window.clearTimeout(id);
    } catch {
      /* noop */
    }
  }, [ready, track?.id, track?.video_id, track]);

  // Mute control.
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try {
      if (muted) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {
      /* noop */
    }
  }, [ready, muted]);

  function onPlayHint() {
    try {
      if (!muted) playerRef.current?.unMute();
      playerRef.current?.playVideo();
      setShowPlayHint(false);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="bezel-shell">
      <div className="bezel-core overflow-hidden">
        <div className="relative aspect-video w-full bg-black">
          {!track && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-cyan-glow/10 via-black to-magenta-glow/10">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                AWAITING NEXT DJ
              </div>
              <div className="text-foreground/40 text-sm">대기 중인 DJ가 곡을 추가하면 시작됩니다</div>
            </div>
          )}
          <div ref={containerRef} className="absolute inset-0" />
          {track && showPlayHint && (
            <button
              type="button"
              onClick={onPlayHint}
              className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] rounded-full bg-black/70 px-4 py-2 text-left text-xs font-medium text-foreground/85 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/80"
            >
              소리가 안 나면 탭해서 재생
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
