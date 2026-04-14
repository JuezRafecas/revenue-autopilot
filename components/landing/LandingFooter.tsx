import { KaszekLogo } from './LandingPrimitives';

export function LandingFooter() {
  return (
    <footer className="relative z-10">
      <div className="editorial-container py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <KaszekLogo small />
          <div className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8782]">
            Approve · don&rsquo;t configure
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8782]">
            © 2026 · Hackathon Entry
          </div>
          <div className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#605e5a]">
            v0.1 · La Cabrera
          </div>
        </div>
      </div>
    </footer>
  );
}
