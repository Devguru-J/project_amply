"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Mode = "guest" | "email";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] flex items-center justify-center">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-foreground/50 animate-pulse">
            LOADING...
          </div>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = getSupabaseBrowser();
  const next = params.get("next") || "/rooms";

  const [mode, setMode] = useState<Mode>("guest");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // If already signed in, bounce to next.
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) router.replace(next);
    });
    return () => {
      active = false;
    };
  }, [supabase, router, next]);

  async function handleGuest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const trimmed = nickname.trim();
      if (trimmed.length < 2) throw new Error("닉네임은 2자 이상이어야 합니다.");

      const { data, error: signInErr } = await supabase.auth.signInAnonymously({
        options: { data: { display_name: trimmed } },
      });
      if (signInErr) throw signInErr;
      if (!data.user) throw new Error("로그인에 실패했습니다.");

      // Profile is auto-created via trigger; ensure display_name is what user typed.
      await supabase.from("profiles").update({ display_name: trimmed }).eq("id", data.user.id);

      router.replace(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (otpErr) throw otpErr;
      setInfo("매직 링크를 보냈습니다. 메일함을 확인하세요.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4 py-24">
      {/* Background orbs */}
      <div className="orb h-[480px] w-[480px] left-[-180px] top-[20%] bg-cyan-glow/30 animate-orb-drift" aria-hidden />
      <div
        className="orb h-[420px] w-[420px] right-[-160px] bottom-[10%] bg-magenta-glow/30 animate-orb-drift"
        style={{ animationDelay: "-8s" }}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-fade-up gpu">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.3em] uppercase text-foreground/50 hover:text-foreground transition"
        >
          ← CLUBTABLE
        </Link>

        <div className="mt-6 bezel-shell">
          <div className="bezel-core p-8 md:p-10">
            <div className="eyebrow mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span>ENTRY</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              {mode === "guest" ? "닉네임으로 입장" : "이메일로 입장"}
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              {mode === "guest"
                ? "회원가입 없이 닉네임만으로 음악방에 들어갑니다."
                : "받은 메일의 매직링크를 클릭해 입장합니다."}
            </p>

            {/* Tabs */}
            <div className="mt-7 inline-flex p-1 rounded-full bg-white/[0.04] ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => setMode("guest")}
                className={`px-4 h-9 text-xs font-medium rounded-full transition-all duration-300 ${
                  mode === "guest" ? "bg-primary text-primary-foreground" : "text-foreground/60"
                }`}
              >
                게스트
              </button>
              <button
                type="button"
                onClick={() => setMode("email")}
                className={`px-4 h-9 text-xs font-medium rounded-full transition-all duration-300 ${
                  mode === "email" ? "bg-primary text-primary-foreground" : "text-foreground/60"
                }`}
              >
                이메일
              </button>
            </div>

            {mode === "guest" ? (
              <form onSubmit={handleGuest} className="mt-6 space-y-4">
                <Input
                  placeholder="DJ 닉네임 (예: kim_v)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoFocus
                  maxLength={24}
                />
                <Button type="submit" disabled={busy} className="w-full" size="lg">
                  {busy ? "입장 중..." : "지금 입장"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleEmail} className="mt-6 space-y-4">
                <Input
                  placeholder="이메일"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <Button type="submit" disabled={busy} className="w-full" size="lg">
                  {busy ? "전송 중..." : "매직링크 받기"}
                </Button>
              </form>
            )}

            {error && (
              <div className="mt-4 rounded-2xl bg-destructive/10 ring-1 ring-destructive/30 p-3 text-xs text-destructive-foreground/90">
                {error}
              </div>
            )}
            {info && (
              <div className="mt-4 rounded-2xl bg-cyan-glow/10 ring-1 ring-cyan-glow/30 p-3 text-xs text-foreground/90">
                {info}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] font-mono uppercase tracking-[0.22em] text-foreground/40">
          NO PASSWORDS · NO INSTALL · ENTER & PLAY
        </p>
      </div>
    </main>
  );
}
