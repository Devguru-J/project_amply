"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { createRoom } from "@/lib/db/rooms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";

export default function NewRoomPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        router.replace(`/login?next=${encodeURIComponent("/rooms/new")}`);
      } else {
        setAuthReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [supabase, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("로그인이 필요합니다.");
      if (name.trim().length < 2) throw new Error("방 이름은 2자 이상이어야 합니다.");

      const room = await createRoom(supabase, {
        name,
        description,
        is_public: isPublic,
        host_id: userData.user.id,
      });
      router.replace(`/rooms/${room.slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "방을 만들 수 없습니다.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (!authReady) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center">
        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-foreground/50 animate-pulse">
          AUTHENTICATING...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh]">
      <Navbar />

      <div className="orb h-[420px] w-[420px] left-[-160px] top-[20%] bg-cyan-glow/25 animate-orb-drift" aria-hidden />
      <div
        className="orb h-[380px] w-[380px] right-[-140px] bottom-[10%] bg-magenta-glow/20 animate-orb-drift"
        style={{ animationDelay: "-9s" }}
        aria-hidden
      />

      <section className="container relative pt-32 md:pt-40 pb-24">
        <div className="max-w-2xl">
          <Link
            href="/rooms"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-foreground/50 hover:text-foreground transition"
          >
            ← 방 목록
          </Link>

          <div className="eyebrow mt-6">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse-glow" />
            <span>NEW ROOM</span>
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95]">
            방을 만들고
            <br />
            <span className="text-foreground/50">첫 곡을 트세요.</span>
          </h1>

          <form onSubmit={onSubmit} className="mt-12 space-y-5">
            <div className="bezel-shell">
              <div className="bezel-core p-6 md:p-8 space-y-6">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 mb-3 block">
                    NAME
                  </label>
                  <Input
                    placeholder="예: 새벽 라운지"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    maxLength={60}
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 mb-3 block">
                    DESCRIPTION (선택)
                  </label>
                  <Input
                    placeholder="이 방에서 어떤 음악이 흐를까요?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={140}
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 mb-3 block">
                    VISIBILITY
                  </label>
                  <div className="inline-flex p-1 rounded-full bg-white/[0.04] ring-1 ring-white/10">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`px-4 h-9 text-xs font-medium rounded-full transition-all duration-300 ${
                        isPublic ? "bg-primary text-primary-foreground" : "text-foreground/60"
                      }`}
                    >
                      공개
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`px-4 h-9 text-xs font-medium rounded-full transition-all duration-300 ${
                        !isPublic ? "bg-secondary text-secondary-foreground" : "text-foreground/60"
                      }`}
                    >
                      비공개
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-destructive/10 ring-1 ring-destructive/30 p-3 text-xs text-destructive-foreground/90">
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy} size="lg" className="w-full md:w-auto">
              {busy ? "만드는 중..." : "방 만들기"}
              <span className="island-arrow">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 19L19 5" strokeLinecap="round" />
                  <path d="M9 5h10v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
