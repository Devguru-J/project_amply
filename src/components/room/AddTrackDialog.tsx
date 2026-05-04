"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractYouTubeId, fetchYouTubeOEmbed, youtubeThumbnail } from "@/lib/youtube";
import { startTrack } from "@/lib/db/queue";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface Props {
  roomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTrackDialog({ roomId, open, onOpenChange }: Props) {
  const supabase = getSupabaseBrowser();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setError("올바른 YouTube URL이 아닙니다.");
      return;
    }
    setBusy(true);
    try {
      // Best-effort metadata. If oEmbed fails (rate-limited/private), use the videoId as title.
      const meta = await fetchYouTubeOEmbed(videoId);
      await startTrack(supabase, {
        roomId,
        videoId,
        title: meta?.title ?? `YouTube — ${videoId}`,
        channel: meta?.author,
        thumbnailUrl: meta?.thumbnail_url ?? youtubeThumbnail(videoId, "hq"),
      });
      setUrl("");
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "곡을 추가할 수 없습니다.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 mb-2">
            YOUR TURN
          </div>
          <DialogTitle>곡 추가하기</DialogTitle>
          <DialogDescription>
            YouTube URL을 붙여넣으면 바로 재생됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <Input
            placeholder="https://youtu.be/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          {error && (
            <div className="rounded-2xl bg-destructive/10 ring-1 ring-destructive/30 p-3 text-xs text-destructive-foreground/90">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "재생 중..." : "재생"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
