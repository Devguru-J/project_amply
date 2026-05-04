export function Features() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl">
          <div className="eyebrow">
            <span>RITUAL · 03</span>
          </div>
          <h2 className="mt-6 font-display text-balance text-4xl md:text-6xl tracking-tight font-semibold leading-[0.95]">
            한 명이 틀면, 모두가 듣는다.
          </h2>
          <p className="mt-6 text-foreground/65 text-base md:text-lg leading-relaxed">
            줄을 서고, 한 곡을 틀고, 다음 사람으로 자연스럽게 넘어갑니다. 작고 단단한 의식 같은 구조.
          </p>
        </div>

        {/* Asymmetric Bento */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Big card */}
          <div className="md:col-span-7 md:row-span-2">
            <div className="bezel-shell h-full">
              <div className="bezel-core h-full p-8 flex flex-col justify-between min-h-[340px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                    01 · DJ ROTATION
                  </span>
                  <DotIcon />
                </div>
                <div>
                  <h3 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
                    DJ 큐에 줄을 서면,
                    <br />
                    당신 차례에 한 곡을.
                  </h3>
                  <p className="mt-4 text-foreground/65 text-sm md:text-base max-w-md">
                    YouTube URL 하나면 충분합니다. 곡이 끝나면 큐의 다음 사람으로 자동 전환됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column small cards */}
          <div className="md:col-span-5">
            <div className="bezel-shell">
              <div className="bezel-core p-6 min-h-[160px] flex flex-col justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  02 · REALTIME
                </span>
                <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
                  채팅·반응이 그 자리에서.
                </h3>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="bezel-shell">
              <div className="bezel-core p-6 min-h-[160px] flex flex-col justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  03 · NO SIGNUP
                </span>
                <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
                  닉네임 하나로 입장.
                </h3>
              </div>
            </div>
          </div>

          <div className="md:col-span-12">
            <div className="bezel-shell">
              <div className="bezel-core p-6 md:p-8 grid md:grid-cols-3 gap-6 md:gap-10">
                <Stat label="ROOMS" value="∞" sub="공개방·비공개방" />
                <Stat label="LATENCY" value="< 200ms" sub="채팅·큐·반응" />
                <Stat label="QUEUE" value="ROTATING" sub="턴테이블 스타일" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-sm text-foreground/55">{sub}</div>
    </div>
  );
}

function DotIcon() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-glow opacity-75 animate-ping" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-glow" />
    </span>
  );
}
