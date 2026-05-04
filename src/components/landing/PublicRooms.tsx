import Link from "next/link";
import type { Room } from "@/types/database";

export function PublicRooms({ rooms }: { rooms: Room[] }) {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span>NOW PLAYING · 라이브 룸</span>
            </div>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              지금 누군가 틀고 있는 방.
            </h2>
          </div>
          <Link
            href="/rooms"
            className="group inline-flex w-fit items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 h-11 pl-5 pr-1 text-sm font-medium hover:bg-white/[0.1] transition-all duration-500 ease-smooth"
          >
            전체 방 보기
            <span className="island-arrow">
              <ArrowIcon />
            </span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {rooms.length === 0 ? (
            <div className="md:col-span-3">
              <div className="bezel-shell">
                <div className="bezel-core p-12 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                    EMPTY · 아직 라이브 방이 없습니다
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold">첫 번째 DJ가 되어보세요.</h3>
                  <Link
                    href="/rooms/new"
                    className="mt-6 group inline-flex items-center rounded-full bg-primary text-primary-foreground h-11 pl-5 pr-1 text-sm font-medium glow-cyan transition-all duration-500 ease-smooth hover:brightness-110 active:scale-[0.98]"
                  >
                    방 만들기
                    <span className="island-arrow">
                      <ArrowIcon />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            rooms.map((room, i) => (
              <Link
                key={room.id}
                href={`/rooms/${room.slug}`}
                className="group block"
                style={{ transform: i % 3 === 1 ? "translateY(8px)" : "none" }}
              >
                <div className="bezel-shell h-full transition-transform duration-500 ease-smooth group-hover:-translate-y-1">
                  <div className="bezel-core h-full p-6 min-h-[180px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                        ROOM · {room.slug.split("-").pop()?.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-mono text-cyan-glow">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse-glow" />
                        LIVE
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight line-clamp-2">
                        {room.name}
                      </h3>
                      {room.description && (
                        <p className="mt-2 text-sm text-foreground/55 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
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
