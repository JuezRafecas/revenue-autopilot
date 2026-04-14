'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function AudienceError({
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
        <h1
          className="font-display text-[28px] md:text-[36px] text-fg leading-tight mb-3"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          No pudimos cargar la audiencia
        </h1>
        <p className="text-fg-muted text-[15px] mb-8 max-w-[48ch] mx-auto leading-snug">
          {error.message || 'Intentá de nuevo en unos segundos.'}
        </p>
        <Button variant="primary" onClick={reset}>
          Reintentar
        </Button>
      </section>
    </AppShell>
  );
}
