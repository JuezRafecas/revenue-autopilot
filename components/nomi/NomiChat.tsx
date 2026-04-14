'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart, type UIMessage } from 'ai';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { CampaignDraft } from '@/lib/agent/types';
import { CampaignDraftCard } from './CampaignDraftCard';
import { ToolCallBadge } from './ToolCallBadge';
import { QuickPrompts } from './QuickPrompts';
import { NomiMarkdown } from './NomiMarkdown';
import { ThinkingSparkle } from './Shimmer';
import { SessionMenu } from './SessionMenu';
import {
  createSession,
  getSession,
  saveSessionMessages,
  setActiveSessionId,
  type NomiSession,
} from '@/lib/nomi/sessions';

export interface NomiChatHandle {
  send: (prompt: string) => void;
}

interface NomiChatProps {
  handleRef?: React.RefObject<NomiChatHandle | null>;
  currency?: string;
}

const SANS_STACK =
  'var(--font-kaszek-sans), Inter, -apple-system, "Helvetica Neue", sans-serif';

export function NomiChat({ handleRef, currency = 'ARS' }: NomiChatProps) {
  const transport = useRef(
    new DefaultChatTransport({ api: '/api/agent/chat' })
  );
  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    stop,
  } = useChat({
    transport: transport.current,
  });

  const [input, setInput] = useState('');
  const [activeSession, setActiveSession] = useState<NomiSession | null>(null);
  const [sessionVersion, setSessionVersion] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // On every fresh mount we start a brand new session. Previous ones live
    // in the SessionMenu and can be reopened explicitly.
    const session = createSession();
    setActiveSession(session);
    setMessages([]);
  }, [setMessages]);

  useEffect(() => {
    if (!activeSession) return;
    if (messages.length === 0) return;
    saveSessionMessages(activeSession.id, messages);
    setSessionVersion((v) => v + 1);
  }, [messages, activeSession]);

  useImperativeHandle(
    handleRef,
    () => ({
      send: (prompt: string) => {
        sendMessage({ text: prompt });
      },
    }),
    [sendMessage]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const autoresize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, []);

  useEffect(() => {
    autoresize();
  }, [input, autoresize]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      sendMessage({ text: trimmed });
      setInput('');
      requestAnimationFrame(() => autoresize());
    },
    [input, sendMessage, autoresize]
  );

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleNewSession = useCallback(() => {
    const session = createSession();
    setActiveSession(session);
    setMessages([]);
    setInput('');
    setSessionVersion((v) => v + 1);
  }, [setMessages]);

  const handlePickSession = useCallback(
    (sessionId: string) => {
      const session = getSession(sessionId);
      if (!session) return;
      setActiveSessionId(sessionId);
      setActiveSession(session);
      setMessages(session.messages);
      setInput('');
      setSessionVersion((v) => v + 1);
    },
    [setMessages]
  );

  const isBusy = status === 'submitted' || status === 'streaming';
  const lastMessage = messages[messages.length - 1];
  const showBottomThinking =
    isBusy &&
    (!lastMessage ||
      lastMessage.role !== 'assistant' ||
      lastMessage.parts.length === 0);

  return (
    <section
      className="flex flex-col w-full"
      style={{
        border: '1px solid var(--hairline-strong)',
        background: 'var(--bg-raised)',
        boxShadow:
          '0 1px 0 0 var(--hairline), 0 18px 42px -24px rgba(21,20,17,0.22)',
        minHeight: 0,
        flex: 1,
      }}
    >
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <SessionMenu
            key={sessionVersion}
            activeSessionId={activeSession?.id ?? null}
            onNewSession={handleNewSession}
            onPickSession={handlePickSession}
          />
          <div
            className="truncate"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--fg-muted)',
              maxWidth: 280,
              letterSpacing: '-0.005em',
            }}
          >
            {activeSession?.title ?? 'Nueva conversación'}
          </div>
        </div>
        <StatusPill status={status} isBusy={isBusy} />
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5"
        aria-live="polite"
        style={{ minHeight: 0, scrollbarGutter: 'stable' }}
      >
        {messages.length === 0 ? <EmptyChat /> : null}
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} currency={currency} />
        ))}
        {showBottomThinking && (
          <div className="py-2">
            <ThinkingSparkle label="nomi está pensando" />
          </div>
        )}
        {error && (
          <div
            className="my-3 py-2 px-3"
            style={{
              fontFamily: SANS_STACK,
              color: 'var(--accent-dim)',
              fontSize: 12,
              borderLeft: '2px solid var(--accent)',
              background: 'rgba(230,120,76,0.05)',
            }}
          >
            {truncateError(error.message)}
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="shrink-0"
        style={{ borderTop: '1px solid var(--hairline)' }}
      >
        <div className="px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={onKey}
            placeholder="Preguntale a Nomi… (Enter para enviar, Shift+Enter para salto de línea)"
            disabled={isBusy}
            aria-label="Preguntale a Nomi"
            rows={1}
            className="w-full resize-none bg-transparent focus:outline-none nomi-textarea"
            style={{
              fontFamily: SANS_STACK,
              fontStyle: 'normal',
              fontSize: 15,
              fontWeight: 400,
              color: 'var(--fg)',
              lineHeight: 1.5,
              minHeight: 24,
              maxHeight: 140,
              padding: 0,
              letterSpacing: '-0.005em',
            }}
          />
        </div>
        <div
          className="px-5 py-3 flex items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--hairline)' }}
        >
          <QuickPrompts
            onPick={(p) => {
              sendMessage({ text: p });
            }}
            disabled={isBusy}
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors"
              style={{
                fontFamily: SANS_STACK,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--accent-dim)',
                background: 'transparent',
                border: '1px solid var(--accent)',
                cursor: 'pointer',
              }}
            >
              Parar
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 transition-colors"
              style={{
                fontFamily: SANS_STACK,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: input.trim() ? '#fff' : 'var(--fg-subtle)',
                background: input.trim() ? 'var(--accent)' : 'transparent',
                border: `1px solid ${
                  input.trim() ? 'var(--accent)' : 'var(--hairline-strong)'
                }`,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Enviar
              <span aria-hidden>↵</span>
            </button>
          )}
        </div>
      </form>

      <style jsx global>{`
        .nomi-textarea::placeholder {
          color: var(--fg-subtle);
          font-family: ${SANS_STACK};
          font-style: normal;
          font-weight: 400;
          opacity: 0.7;
        }
      `}</style>
    </section>
  );
}

function StatusPill({
  status,
  isBusy,
}: {
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  isBusy: boolean;
}) {
  if (isBusy) {
    return (
      <ThinkingSparkle label={status === 'submitted' ? 'pensando' : 'escribiendo'} />
    );
  }
  const ok = status !== 'error';
  return (
    <div
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: SANS_STACK,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: ok ? 'var(--k-green)' : 'var(--accent-dim)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: 999,
          background: ok ? 'var(--k-green)' : 'var(--accent)',
          boxShadow: ok
            ? '0 0 0 3px rgba(14,94,72,0.18)'
            : '0 0 0 3px rgba(230,120,76,0.2)',
        }}
      />
      {ok ? 'Listo' : 'Error'}
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="flex flex-col gap-2 pb-3">
      <div
        className="k-label"
        style={{ color: 'var(--k-green)' }}
      >
        Nomi
      </div>
      <p
        style={{
          fontFamily: SANS_STACK,
          fontSize: 14.5,
          lineHeight: 1.6,
          color: 'var(--fg-muted)',
          maxWidth: 520,
          letterSpacing: '-0.005em',
        }}
      >
        Hola. Soy tu CMO — mientras vos atendés el salón, yo miro a cada
        comensal y sé quién vuelve, quién se fue y cuánta plata hay sobre la
        mesa.
      </p>
    </div>
  );
}

function MessageRow({
  message,
  currency,
}: {
  message: UIMessage;
  currency: string;
}) {
  if (message.role === 'user') {
    const text = message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');

    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-[85%] px-4 py-2.5"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--hairline)',
            borderRadius: 2,
          }}
        >
          <div
            className="mb-1"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-subtle)',
            }}
          >
            Tú
          </div>
          <div
            style={{
              fontFamily: SANS_STACK,
              fontSize: 14,
              lineHeight: 1.55,
              color: 'var(--fg)',
              whiteSpace: 'pre-wrap',
              letterSpacing: '-0.005em',
            }}
          >
            {text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div
        className="mb-2"
        style={{
          fontFamily: SANS_STACK,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--k-green)',
        }}
      >
        Nomi
      </div>
      <div>
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return <NomiMarkdown key={i}>{part.text}</NomiMarkdown>;
          }
          if (isToolUIPart(part)) {
            const toolName = part.type.replace(/^tool-/, '');
            const input =
              part.state === 'input-available' || part.state === 'output-available'
                ? part.input
                : undefined;
            const output =
              part.state === 'output-available' ? part.output : undefined;

            if (
              toolName === 'draftCampaign' &&
              part.state === 'output-available' &&
              output &&
              typeof output === 'object' &&
              'draft' in (output as Record<string, unknown>)
            ) {
              return (
                <CampaignDraftCard
                  key={i}
                  draft={(output as { draft: CampaignDraft }).draft}
                  currency={currency}
                />
              );
            }

            return (
              <ToolCallBadge
                key={i}
                toolName={toolName}
                state={part.state as ToolCallBadgeState}
                input={input}
                output={output}
                summary={summarizeToolResult(toolName, output)}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

type ToolCallBadgeState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error';

function truncateError(msg: string | undefined): string {
  if (!msg) return 'Algo falló.';
  const cleaned = msg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length > 140) return cleaned.slice(0, 140) + '…';
  return cleaned || 'Algo falló.';
}

function summarizeToolResult(toolName: string, output: unknown): string | undefined {
  if (!output || typeof output !== 'object') return undefined;
  const o = output as Record<string, unknown>;
  if (toolName === 'queryCustomers' && typeof o.count === 'number') {
    return `${o.count} resultados`;
  }
  if (toolName === 'estimateAudienceSize' && typeof o.count === 'number') {
    return `${o.count} clientes`;
  }
  if (toolName === 'detectOpportunities' && Array.isArray(o.opportunities)) {
    return `${o.opportunities.length} oportunidades`;
  }
  if (toolName === 'getSegmentMetrics' && Array.isArray(o.rows)) {
    return `${o.rows.length} segmentos`;
  }
  if (toolName === 'listTemplates' && Array.isArray(o.templates)) {
    return `${o.templates.length} templates`;
  }
  if (toolName === 'getCampaignResults' && Array.isArray(o.campaigns)) {
    return `${o.campaigns.length} campañas`;
  }
  if (toolName === 'draftCampaign' && o.draft) {
    return 'borrador listo';
  }
  return undefined;
}
