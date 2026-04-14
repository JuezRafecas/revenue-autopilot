'use client';

import { useEffect, useRef, useState } from 'react';
import {
  deleteSession,
  listSessions,
  type NomiSession,
} from '@/lib/nomi/sessions';

interface SessionMenuProps {
  activeSessionId: string | null;
  onNewSession: () => void;
  onPickSession: (sessionId: string) => void;
}

export function SessionMenu({
  activeSessionId,
  onNewSession,
  onPickSession,
}: SessionMenuProps) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<NomiSession[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSessions(listSessions());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const activeCount = sessions.length;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 py-1.5 px-2.5 transition-colors"
        style={{
          border: '1px solid var(--hairline-strong)',
          background: 'transparent',
          color: 'var(--fg)',
          fontFamily:
            'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
          fontSize: 10,
          letterSpacing: '0.16em',
          fontWeight: 700,
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
        >
          <path d="M3 5h18M3 12h18M3 19h18" />
        </svg>
        Sessions
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 z-40"
          style={{
            width: 320,
            maxHeight: 380,
            overflowY: 'auto',
            border: '1px solid var(--hairline-strong)',
            background: 'var(--bg-raised)',
            boxShadow: '0 16px 40px -18px rgba(21,20,17,0.28)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNewSession();
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-sunken)]"
            style={{
              borderBottom: '1px solid var(--hairline)',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            <span
              className="k-label"
              style={{ color: 'var(--k-green)', fontSize: 9.5 }}
            >
              + New conversation
            </span>
            <span
              className="k-mono"
              style={{
                color: 'var(--fg-subtle)',
                fontSize: 9,
                letterSpacing: '0.14em',
              }}
            >
              {activeCount} saved
            </span>
          </button>

          {sessions.length === 0 ? (
            <div
              className="px-4 py-6 text-center k-italic-serif"
              style={{
                color: 'var(--fg-subtle)',
                fontSize: 13,
              }}
            >
              No saved conversations yet.
            </div>
          ) : (
            <ul>
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                const date = new Date(s.updated_at);
                const time = date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const day = date.toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                });
                return (
                  <li
                    key={s.id}
                    style={{ borderBottom: '1px solid var(--hairline)' }}
                  >
                    <div className="group flex items-stretch">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onPickSession(s.id);
                        }}
                        className="flex-1 text-left px-4 py-3 transition-colors hover:bg-[var(--bg-sunken)]"
                        style={{
                          borderLeft: isActive
                            ? '3px solid var(--accent)'
                            : '3px solid transparent',
                          background: 'transparent',
                          cursor: 'pointer',
                          minWidth: 0,
                        }}
                      >
                        <div
                          className="truncate"
                          style={{
                            fontFamily:
                              'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--fg)',
                            letterSpacing: '-0.005em',
                            lineHeight: 1.3,
                          }}
                        >
                          {s.title || 'Untitled'}
                        </div>
                        <div
                          className="k-mono mt-0.5"
                          style={{
                            fontSize: 9,
                            color: 'var(--fg-subtle)',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {day} · {time} · {s.messages.length} messages
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!window.confirm('¿Borrar esta conversación?')) return;
                          deleteSession(s.id);
                          setSessions(listSessions());
                          if (isActive) onNewSession();
                        }}
                        className="k-mono opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        style={{
                          color: 'var(--fg-subtle)',
                          fontSize: 13,
                          cursor: 'pointer',
                          background: 'transparent',
                          border: 'none',
                          width: 36,
                          minHeight: 36,
                        }}
                        aria-label={`Borrar conversación: ${s.title || 'Sin título'}`}
                        title="Borrar"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
