'use client';

interface QuickPromptsProps {
  onPick: (prompt: string) => void;
  disabled?: boolean;
  variant?: 'compact' | 'hero';
}

const PROMPTS = ['I want to activate my dormant guests.'];

export function QuickPrompts({
  onPick,
  disabled,
  variant = 'compact',
}: QuickPromptsProps) {
  if (variant === 'hero') {
    return (
      <div className="flex flex-col gap-2.5" style={{ maxWidth: 560 }}>
        <div
          className="k-label"
          style={{
            color: 'var(--fg-subtle)',
            fontSize: 10,
            letterSpacing: '0.16em',
          }}
        >
          Templates
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPick(p)}
              disabled={disabled}
              className="transition-colors"
              style={{
                fontFamily:
                  'var(--font-kaszek-sans), Inter, -apple-system, sans-serif',
                fontSize: 11.5,
                fontWeight: 500,
                letterSpacing: '-0.005em',
                color: 'var(--fg)',
                background: 'var(--bg-raised)',
                border: '1px solid var(--hairline-strong)',
                padding: '8px 12px',
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap min-w-0">
      {PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          disabled={disabled}
          className="k-mono text-[10px] uppercase px-2.5 py-1.5 transition-colors"
          style={{
            letterSpacing: '0.12em',
            color: 'var(--fg-subtle)',
            border: '1px solid var(--hairline)',
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
