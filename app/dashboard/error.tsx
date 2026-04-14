'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <Header />
      <section className="editorial-container pt-20 pb-24 text-center">
        <div
          aria-hidden
          className="mb-6 mx-auto w-12 h-12 flex items-center justify-center"
          style={{ background: 'var(--bg-sunken)', border: '1px solid var(--hairline-strong)' }}
        >
          <span style={{ color: 'var(--accent)', fontSize: '20px' }}>!</span>
        </div>
        <h1
          className="font-display text-[28px] md:text-[36px] text-fg leading-tight mb-3"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Algo salió mal
        </h1>
        <p className="text-fg-muted text-[15px] mb-8 max-w-[48ch] mx-auto leading-snug">
          {error.message || 'No pudimos cargar esta página. Intentá de nuevo.'}
        </p>
        <Button variant="primary" onClick={reset}>
          Reintentar
        </Button>
      </section>
    </AppShell>
  );
}
