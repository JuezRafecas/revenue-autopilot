import type { ReactNode } from 'react';

export function KaszekLogo({ small = false }: { small?: boolean }) {
  const size = small ? 18 : 22;
  return (
    <div className="flex items-baseline gap-[3px]" aria-label="Revenue Autopilot">
      <span
        className="k-display italic"
        style={{
          fontSize: size,
          lineHeight: 1,
          color: '#151411',
          letterSpacing: '-0.03em',
        }}
      >
        Revenue
      </span>
      <span
        className="k-display"
        style={{
          fontSize: size,
          lineHeight: 1,
          color: '#e6784c',
          letterSpacing: '-0.04em',
        }}
      >
        Autopilot
      </span>
      <span
        aria-hidden
        className="inline-block ml-1"
        style={{
          width: 6,
          height: 6,
          background: '#0e5e48',
          transform: 'translateY(-2px)',
        }}
      />
    </div>
  );
}

type ButtonVariant = 'primary' | 'ghost';

export function KaszekButton({
  variant = 'primary',
  children,
  as: Comp = 'button',
  className = '',
  ...rest
}: {
  variant?: ButtonVariant;
  children: ReactNode;
  as?: 'button' | 'span';
  className?: string;
} & Record<string, unknown>) {
  const base =
    'k-btn inline-flex items-center gap-3 h-12 px-7 text-[12px] uppercase tracking-[0.16em] font-semibold border-2 border-[#151411] select-none';

  const variantClass =
    variant === 'primary'
      ? 'k-btn--primary text-[#faf8f4] bg-[#e6784c]'
      : 'k-btn--ghost text-[#151411] bg-transparent';

  return (
    <Comp
      className={`${base} ${variantClass} ${className}`.trim()}
      {...(rest as Record<string, never>)}
    >
      {children}
    </Comp>
  );
}

export function Arrow() {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        d="M0 6H16M10 1L16 6L10 11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Metric({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="k-display text-[#151411]"
        style={{
          fontSize: 32,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {value}
      </div>
      <div className="k-mono text-[10px] uppercase tracking-[0.14em] text-[#8a8782]">
        {label}
      </div>
    </div>
  );
}
