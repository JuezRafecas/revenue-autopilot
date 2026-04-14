'use client';

import { cn } from '@/lib/cn';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  /** Optional hex dot — used for segment/status swatches. */
  dot?: string;
}

interface Props {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * Editorial filter chips — flat, underlined, accent on active.
 * Keyboard: Arrow-Left/Right move focus, Enter/Space selects.
 */
export function FilterBar({ options, value, onChange, label, className }: Props) {
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (index + dir + options.length) % options.length;
    const nextEl = e.currentTarget.parentElement?.children[next] as HTMLElement | undefined;
    nextEl?.focus();
    onChange(options[next].value);
  };

  return (
    <div
      role="tablist"
      aria-label={label ?? 'Filtros'}
      className={cn(
        'flex items-center gap-1 flex-wrap overflow-x-auto no-scrollbar',
        className
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <div
            key={opt.value}
            role="tab"
            tabIndex={active ? 0 : -1}
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(opt.value);
                return;
              }
              handleKey(e, i);
            }}
            className={cn(
              'group inline-flex items-center gap-2 px-3 py-2 text-[11px] uppercase font-[600] cursor-pointer select-none whitespace-nowrap transition-all duration-200',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              active ? 'rounded-sm' : ''
            )}
            style={{
              letterSpacing: '0.16em',
              color: active ? 'var(--fg)' : 'var(--fg-muted)',
              borderBottom: active ? '2px solid var(--fg)' : '2px solid transparent',
              background: active ? 'var(--bg-raised)' : 'transparent',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            {opt.dot && (
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: opt.dot }}
              />
            )}
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{
                  color: active ? 'var(--accent)' : 'var(--fg-subtle)',
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                }}
              >
                {opt.count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
