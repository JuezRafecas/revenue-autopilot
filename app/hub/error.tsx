'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function HubError({
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
          No pudimos cargar Nomi Hub
        </h1>
        <p className="text-fg-muted text-[15px] mb-8 max-w-[48ch] mx-auto leading-snug">
          {error.message || 'Verificá la conexión con la CDP e intentá de nuevo.'}
        </p>
        <Button variant="primary" onClick={reset}>
          Reintentar
        </Button>
      </section>
    </AppShell>
  );
}
