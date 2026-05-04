// Minimal types for the YouTube IFrame Player API.

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    interface PlayerVars {
      autoplay?: 0 | 1;
      controls?: 0 | 1;
      disablekb?: 0 | 1;
      enablejsapi?: 0 | 1;
      fs?: 0 | 1;
      modestbranding?: 0 | 1;
      playsinline?: 0 | 1;
      rel?: 0 | 1;
      origin?: string;
    }
    interface PlayerEvent {
      target: Player;
    }
    interface OnStateChangeEvent extends PlayerEvent {
      data: number;
    }
    interface PlayerOptions {
      videoId?: string;
      width?: number | string;
      height?: number | string;
      playerVars?: PlayerVars;
      events?: {
        onReady?: (e: PlayerEvent) => void;
        onStateChange?: (e: OnStateChangeEvent) => void;
        onError?: (e: PlayerEvent & { data: number }) => void;
      };
    }
    class Player {
      constructor(idOrEl: string | HTMLElement, opts: PlayerOptions);
      loadVideoById(id: string): void;
      cueVideoById(id: string): void;
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      destroy(): void;
      getCurrentTime(): number;
      getDuration(): number;
      mute(): void;
      unMute(): void;
      isMuted(): boolean;
      setVolume(v: number): void;
      getPlayerState(): number;
    }
    const PlayerState: {
      UNSTARTED: -1;
      ENDED: 0;
      PLAYING: 1;
      PAUSED: 2;
      BUFFERING: 3;
      CUED: 5;
    };
  }
}

export {};
