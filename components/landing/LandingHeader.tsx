import { KaszekLogo } from './LandingPrimitives';

export function LandingHeader() {
  return (
    <>
      <header className="relative z-20 editorial-container pt-8 pb-6 flex items-center justify-between">
        <KaszekLogo />

        <nav className="hidden md:flex items-center gap-10">
          <a href="#problema" className="k-label text-[#0e5e48] hover:text-[#e6784c] transition-colors">
            Diagnosis
          </a>
          <a href="#metodo" className="k-label text-[#0e5e48] hover:text-[#e6784c] transition-colors">
            Method
          </a>
          <a href="#casos" className="k-label text-[#0e5e48] hover:text-[#e6784c] transition-colors">
            Use cases
          </a>
          <a href="#impacto" className="k-label text-[#0e5e48] hover:text-[#e6784c] transition-colors">
            Impact
          </a>
        </nav>

        <div className="k-mono text-[10.5px] uppercase tracking-[0.18em] text-[#605e5a] border border-[#e4dfd2] bg-[#f1ede3]/60 px-3 py-1.5">
          EN
        </div>
      </header>

      <div className="relative z-20 border-t border-[#e4dfd2]" />
    </>
  );
}
