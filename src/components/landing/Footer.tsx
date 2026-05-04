export function Footer() {
  return (
    <footer className="relative pt-16 pb-12">
      <div className="container">
        <div className="hairline" />
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-foreground/50">
              CT · CLUBTABLE
            </span>
            <span className="text-foreground/40 text-sm">같이 듣는 순간, 방이 된다.</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
            © {new Date().getFullYear()} · Built with YouTube · Supabase · Next
          </div>
        </div>
      </div>
    </footer>
  );
}
