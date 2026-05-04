import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-foreground/50">
          404 · NOT FOUND
        </div>
        <h1 className="mt-4 font-display text-5xl md:text-7xl font-semibold tracking-tight">
          이 방은 비어있습니다.
        </h1>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full bg-primary text-primary-foreground h-11 px-6 text-sm font-medium glow-cyan transition-all duration-500 ease-smooth hover:brightness-110 active:scale-[0.98]"
        >
          돌아가기
        </Link>
      </div>
    </main>
  );
}
