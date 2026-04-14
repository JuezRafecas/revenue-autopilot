export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-[4px] ${className ?? ''}`}>
      <span
        className="text-[22px] leading-none font-[800]"
        style={{
          fontFamily:
            'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
          color: 'var(--fg)',
          letterSpacing: '-0.045em',
        }}
      >
        NOMI
      </span>
      <span
        aria-hidden
        className="inline-block"
        style={{
          width: 6,
          height: 6,
          backgroundColor: 'var(--k-green, #0e5e48)',
          transform: 'translateY(-2px)',
        }}
      />
    </div>
  );
}
