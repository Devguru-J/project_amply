import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden pt-40 pb-24 md:pb-32">
      {/* Aurora orbs */}
      <div
        className="orb h-[520px] w-[520px] left-[-180px] top-[-80px] bg-cyan-glow/40 animate-orb-drift"
        aria-hidden
      />
      <div
        className="orb h-[480px] w-[480px] right-[-160px] top-[120px] bg-magenta-glow/35 animate-orb-drift"
        style={{ animationDelay: "-7s" }}
        aria-hidden
      />
      <div
        className="orb h-[340px] w-[340px] left-1/3 bottom-[-100px] bg-fuchsia-500/20 animate-orb-drift"
        style={{ animationDelay: "-14s" }}
        aria-hidden
      />

      <div className="container relative">
        <div className="max-w-5xl">
          <div className="eyebrow animate-fade-up [animation-delay:80ms] gpu">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span>NOW LIVE · 사람들이 음악을 틀고 있다</span>
          </div>

          <h1 className="mt-8 text-balance font-display font-semibold tracking-tight text-[clamp(2.6rem,9vw,7.5rem)] leading-[0.95] animate-fade-up [animation-delay:140ms] gpu">
            같이 듣는 순간,
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              방이 된다
            </span>
            <span className="text-foreground/40">.</span>
          </h1>

          <p className="mt-8 max-w-xl text-pretty text-base md:text-lg text-foreground/70 leading-relaxed animate-fade-up [animation-delay:220ms] gpu">
            Clubtable은 작은 클럽처럼 사람들이 모여 한 명이 DJ가 되어 음악을 트는 공간입니다.
            대기열에 줄을 서고, 채팅하고, 좋아요를 누르세요. 음악이 끝나면 다음 차례로 자연스럽게 넘어갑니다.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:300ms] gpu">
            <Link
              href="/rooms"
              className="group inline-flex items-center rounded-full bg-primary text-primary-foreground h-12 pl-6 pr-1.5 text-sm font-medium glow-cyan transition-all duration-500 ease-smooth hover:brightness-110 active:scale-[0.98]"
            >
              공개방 둘러보기
              <span className="island-arrow">
                <ArrowIcon />
              </span>
            </Link>
            <Link
              href="/rooms/new"
              className="inline-flex items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 h-12 px-6 text-sm font-medium hover:bg-white/[0.1] transition-all duration-500 ease-smooth active:scale-[0.98]"
            >
              방 만들기
            </Link>

            <div className="ml-2 hidden md:flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/50">
              <span className="h-px w-8 bg-white/10" />
              <span>NO SIGNUP · ENTER WITH A NICKNAME</span>
            </div>
          </div>
        </div>

        {/* Floating ticker (Z-axis cascade card) */}
        <div className="mt-20 md:mt-28 animate-fade-up [animation-delay:380ms] gpu">
          <div className="bezel-shell -rotate-[0.6deg] hover:rotate-0 transition-transform duration-700 ease-smooth max-w-3xl">
            <div className="bezel-core flex items-center gap-4 px-5 py-4">
              <div className="flex items-center gap-1">
                <Bar h={14} delay={0} />
                <Bar h={20} delay={120} />
                <Bar h={10} delay={240} />
                <Bar h={18} delay={60} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/50 font-mono">
                  ROOM // BOILER · DJ kim_v
                </div>
                <div className="truncate text-sm text-foreground/90">
                  Caribou — Bowls · Dan Snaith
                </div>
              </div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-foreground/50">
                03:42 / 06:18
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 19L19 5" strokeLinecap="round" />
      <path d="M9 5h10v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Bar({ h, delay }: { h: number; delay: number }) {
  return (
    <span
      className="block w-[3px] rounded-full bg-gradient-to-t from-cyan-glow to-magenta-glow animate-pulse-glow"
      style={{ height: h, animationDelay: `${delay}ms` }}
    />
  );
}
