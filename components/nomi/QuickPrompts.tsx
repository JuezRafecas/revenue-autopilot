'use client';

interface QuickPromptsProps {
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  '¿Cómo va mi campaña de reactivación?',
  'Quiero activar mis dormidos.',
  '¿Quiénes son mis VIPs en riesgo?',
  'Mostrame las oportunidades de esta semana.',
];

export function QuickPrompts({ onPick, disabled }: QuickPromptsProps) {
  return (
    <div className="flex gap-2 flex-wrap min-w-0">
      {PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          disabled={disabled}
          className="k-mono text-[9.5px] uppercase px-2.5 py-1.5 transition-colors"
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
