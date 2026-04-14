import { Label } from '@/components/ui/Label';

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="border-b border-hairline">
      <div className="editorial-container flex items-center justify-between py-6">
        <div>
          {title && <Label>{subtitle ?? 'Diagnóstico'}</Label>}
          {title && (
            <h1
              className="font-display text-2xl text-fg mt-1"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {title}
            </h1>
          )}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-label text-fg-subtle">
          {today}
        </div>
      </div>
    </header>
  );
}
