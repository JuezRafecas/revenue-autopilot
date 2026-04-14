'use client';

import { useState } from 'react';
import { ThinkingSparkle } from './Shimmer';

interface ToolCallBadgeProps {
  toolName: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: unknown;
  output?: unknown;
  summary?: string;
}

const TOOL_META: Record<
  string,
  { label: string; verbRunning: string; icon: string }
> = {
  queryCustomers: {
    label: 'guests',
    verbRunning: 'querying CDP',
    icon: '◎',
  },
  getSegmentMetrics: {
    label: 'segments',
    verbRunning: 'measuring segments',
    icon: '◒',
  },
  getCampaignResults: {
    label: 'campaigns',
    verbRunning: 'reading results',
    icon: '◈',
  },
  listTemplates: {
    label: 'templates',
    verbRunning: 'loading templates',
    icon: '◧',
  },
  detectOpportunities: {
    label: 'opportunities',
    verbRunning: 'detecting opportunities',
    icon: '✦',
  },
  estimateAudienceSize: {
    label: 'audience',
    verbRunning: 'estimating audience',
    icon: '◉',
  },
  draftCampaign: {
    label: 'draft',
    verbRunning: 'drafting campaign',
    icon: '◐',
  },
};

export function ToolCallBadge({
  toolName,
  state,
  input,
  output,
  summary,
}: ToolCallBadgeProps) {
  const [open, setOpen] = useState(false);
  const meta =
    TOOL_META[toolName] ?? { label: toolName, verbRunning: toolName, icon: '◇' };
  const isRunning =
    state === 'input-streaming' || state === 'input-available';
  const isError = state === 'output-error';
  const isDone = state === 'output-available';

  return (
    <div
      className="nomi-tool my-2"
      style={{
        borderLeft: `2px solid ${
          isError
            ? 'var(--accent)'
            : isDone
              ? 'var(--hairline-strong)'
              : 'var(--accent)'
        }`,
        paddingLeft: 12,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left inline-flex items-center gap-2 py-1 transition-opacity"
        style={{
          fontFamily: 'var(--font-mono), ui-monospace, monospace',
          fontSize: 11,
          letterSpacing: '0.04em',
        }}
      >
        {isRunning ? (
          <ThinkingSparkle label={meta.verbRunning} />
        ) : (
          <>
            <span
              aria-hidden
              style={{
                color: isError ? 'var(--accent-dim)' : 'var(--k-green)',
                fontSize: 12,
                fontFamily: 'var(--font-display), Georgia, serif',
              }}
            >
              {isError ? '✕' : '✓'}
            </span>
            <span
              style={{
                color: isError ? 'var(--accent-dim)' : 'var(--fg-muted)',
                textTransform: 'lowercase',
              }}
            >
              {meta.verbRunning}
            </span>
            {summary && (
              <span
                style={{
                  color: 'var(--fg-subtle)',
                  marginLeft: 2,
                }}
              >
                · {summary}
              </span>
            )}
            {isError && (
              <span style={{ color: 'var(--accent-dim)' }}>· error</span>
            )}
          </>
        )}
        <span
          aria-hidden
          className="ml-auto text-[9px]"
          style={{
            color: 'var(--fg-subtle)',
            opacity: 0.55,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="mt-1.5 mb-2 space-y-1.5">
          {input !== undefined && (
            <JsonBlock title="input" value={input} />
          )}
          {output !== undefined && (
            <JsonBlock title="output" value={output} />
          )}
        </div>
      )}
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <div
        className="k-mono"
        style={{
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--fg-subtle)',
          marginBottom: 2,
        }}
      >
        {title}
      </div>
      <pre
        className="k-mono overflow-x-auto whitespace-pre-wrap"
        style={{
          fontSize: 10.5,
          color: 'var(--fg-muted)',
          background: 'var(--bg-sunken)',
          padding: '8px 10px',
          lineHeight: 1.5,
          borderLeft: '1px solid var(--hairline)',
          margin: 0,
        }}
      >
        {safeJson(value)}
      </pre>
    </div>
  );
}

function safeJson(v: unknown): string {
  try {
    const s = JSON.stringify(v, null, 2);
    if (s && s.length > 800) return s.slice(0, 800) + '\n…';
    return s ?? '';
  } catch {
    return String(v);
  }
}
