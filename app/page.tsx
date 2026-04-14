import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Logo } from '@/components/layout/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative z-10">
      <div className="absolute inset-0 ledger-grid pointer-events-none" />

      <header className="editorial-container pt-10 flex items-center justify-between relative z-10">
        <Logo />
        <div className="font-mono text-[10px] uppercase tracking-label text-fg-subtle">
          Kaszek · Dev Hackathon 2026
        </div>
      </header>

      <main className="editorial-container pt-32 pb-40 relative z-10">
        <Label className="mb-8">Diagnóstico autónomo · Restaurantes</Label>

        <h1
          className="font-display text-[clamp(3rem,8vw,9rem)] leading-[0.92] text-fg max-w-[18ch] mb-6"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50, "WONK" 1' }}
        >
          El{' '}
          <span className="italic text-accent">50%</span>{' '}
          de tus comensales <span className="italic">ya no vuelve</span>.
        </h1>

        <p
          className="font-display italic text-xl md:text-2xl text-fg-muted max-w-[48ch] leading-snug mb-16"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          diagnosticamos tu base, detectamos la plata que se está yendo,
          y generamos los mensajes que la recuperan. aprobás, no configurás.
        </p>

        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              Ver el diagnóstico
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="link" size="lg">
              Subir mis datos →
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-hairline">
        <div className="editorial-container py-8 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-label text-fg-subtle">
            Approve · don't configure
          </div>
          <div className="font-mono text-[10px] uppercase tracking-label text-fg-subtle">
            v0.1
          </div>
        </div>
      </footer>
    </div>
  );
}
