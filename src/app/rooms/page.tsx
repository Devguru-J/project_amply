import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPublicRooms } from "@/lib/db/rooms";
import type { Room } from "@/types/database";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function RoomsListPage() {
  let rooms: Room[] = [];
  try {
    const supabase = await getSupabaseServer();
    rooms = await getPublicRooms(supabase, 60);
  } catch {
    rooms = [];
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-fade-up gpu">
          <div className="max-w-xl">
            <div className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span>NOW OPEN · 입장 가능</span>
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95]">
              공개방
              <span className="block text-foreground/40 mt-1">— pick a vibe.</span>
            </h1>
          </div>
          <Link
            href="/rooms/new"
            className="group inline-flex w-fit items-center rounded-full bg-primary text-primary-foreground h-12 pl-6 pr-1.5 text-sm font-medium glow-cyan transition-all duration-500 ease-smooth hover:brightness-110 active:scale-[0.98]"
          >
            방 만들기
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
                    EMPTY
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold">
                    아직 라이브 방이 없습니다.
                  </h2>
                  <p className="mt-2 text-foreground/60 text-sm">
                    첫 번째 DJ가 되어 방을 만들어보세요.
                  </p>
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
                className="group block animate-fade-up gpu"
                style={{
                  animationDelay: `${100 + i * 40}ms`,
                  transform: i % 3 === 1 ? "translateY(8px)" : "none",
                }}
              >
                <div className="bezel-shell h-full transition-transform duration-500 ease-smooth group-hover:-translate-y-1">
                  <div className="bezel-core h-full p-6 min-h-[200px] flex flex-col justify-between">
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
                      <h3 className="font-display text-2xl font-semibold tracking-tight line-clamp-2">
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
      </section>

      <Footer />
    </main>
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
