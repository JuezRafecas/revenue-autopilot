interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Show the "Live · Today" pulse pill. Defaults to true on live routes. */
  live?: boolean;
}

export function Header({ title, subtitle, live = true }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hasContent = Boolean(title || live);
  if (!hasContent) return null;

  return (
    <header style={{ borderBottom: '1.5px solid var(--fg)' }}>
      <div className="editorial-container flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-4 min-w-0">
          {live && <span className="k-event-pill shrink-0">Live · Today</span>}
          {title && (
            <div className="min-w-0">
              <div
                className="text-[10px] uppercase font-[600]"
                style={{
                  letterSpacing: '0.18em',
                  color: 'var(--k-green, #0e5e48)',
                  fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
                }}
              >
                {subtitle ?? 'Diagnosis'}
              </div>
              <h1
                className="text-[22px] leading-tight truncate"
                style={{
                  fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--fg)',
                }}
              >
                {title}
              </h1>
            </div>
          )}
        </div>
        <div
          className="font-mono text-[10px] uppercase shrink-0"
          style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
        >
          {today}
        </div>
      </div>
    </header>
  );
}
