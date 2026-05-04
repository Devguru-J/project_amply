"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-6 left-1/2 z-40 -translate-x-1/2">
        <div className="bezel-shell !rounded-full">
          <div className="bezel-core !rounded-full flex items-center gap-1 px-2 py-1.5">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-semibold tracking-tight text-foreground"
            >
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-foreground/60 mr-2">
                CT
              </span>
              Clubtable
            </Link>
            <span className="hidden md:block h-4 w-px bg-white/10 mx-1" />
            <Link
              href="/rooms"
              className="hidden md:inline-flex h-9 items-center rounded-full px-4 text-sm text-foreground/70 hover:text-foreground hover:bg-white/[0.06] transition-colors duration-300"
            >
              공개방
            </Link>
            <Link
              href="/rooms/new"
              className="hidden md:inline-flex h-9 items-center rounded-full px-4 text-sm text-foreground/70 hover:text-foreground hover:bg-white/[0.06] transition-colors duration-300"
            >
              방 만들기
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="menu"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden relative h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center"
            >
              <span
                className={cn(
                  "absolute h-px w-4 bg-foreground transition-all duration-500 ease-smooth",
                  open ? "rotate-45" : "-translate-y-1",
                )}
              />
              <span
                className={cn(
                  "absolute h-px w-4 bg-foreground transition-all duration-500 ease-smooth",
                  open ? "-rotate-45" : "translate-y-1",
                )}
              />
            </button>

            <Link
              href="/login"
              className="ml-1 group inline-flex items-center rounded-full bg-primary text-primary-foreground h-9 pl-4 pr-1 text-sm font-medium glow-cyan transition-all duration-500 ease-smooth hover:brightness-110 active:scale-[0.98]"
            >
              입장
              <span className="island-arrow">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          "fixed inset-0 z-30 backdrop-blur-3xl bg-black/85 transition-opacity duration-500",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex h-full flex-col items-center justify-center gap-6 px-8">
          {[
            { href: "/rooms", label: "공개방" },
            { href: "/rooms/new", label: "방 만들기" },
            { href: "/login", label: "입장" },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-3xl font-semibold tracking-tight transition-all duration-700 ease-smooth",
                open
                  ? "translate-y-0 opacity-100 blur-0"
                  : "translate-y-12 opacity-0 blur-md",
              )}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
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
