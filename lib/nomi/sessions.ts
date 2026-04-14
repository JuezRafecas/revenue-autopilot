'use client';

import type { UIMessage } from 'ai';

export interface NomiSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: UIMessage[];
}

const KEY = 'nomi.sessions.v1';
const ACTIVE_KEY = 'nomi.sessions.active.v1';

function read(): NomiSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NomiSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(sessions: NomiSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // quota / disabled storage — silently ignore
  }
}

export function listSessions(): NomiSession[] {
  return read()
    .filter((s) => s.messages.length > 0)
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}

export function getSession(id: string): NomiSession | undefined {
  return read().find((s) => s.id === id);
}

export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) window.localStorage.setItem(ACTIVE_KEY, id);
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Create a fresh session in-memory. Does NOT persist to storage yet — the
 * session only gets written on the first `saveSessionMessages` call, so empty
 * sessions from page refreshes don't clutter the history.
 */
export function createSession(): NomiSession {
  const now = new Date().toISOString();
  const session: NomiSession = {
    id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title: 'Nueva conversación',
    created_at: now,
    updated_at: now,
    messages: [],
  };
  setActiveSessionId(session.id);
  return session;
}

export function saveSessionMessages(id: string, messages: UIMessage[]): void {
  if (messages.length === 0) return;
  const all = read();
  const idx = all.findIndex((s) => s.id === id);
  const now = new Date().toISOString();
  if (idx === -1) {
    all.push({
      id,
      title: deriveTitle(messages) || 'Nueva conversación',
      created_at: now,
      updated_at: now,
      messages,
    });
  } else {
    all[idx] = {
      ...all[idx],
      messages,
      updated_at: now,
      title: deriveTitle(messages) || all[idx].title,
    };
  }
  write(all);
}

export function deleteSession(id: string): void {
  const all = read().filter((s) => s.id !== id);
  write(all);
  const active = getActiveSessionId();
  if (active === id) setActiveSessionId(null);
}

/**
 * Derive a short title from the first user message. Falls back to default.
 */
export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) return '';
  const textParts = firstUser.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
    .trim();
  if (!textParts) return '';
  const clean = textParts.replace(/\s+/g, ' ');
  return clean.length > 56 ? clean.slice(0, 56) + '…' : clean;
}

export function ensureActiveSession(): NomiSession {
  const id = getActiveSessionId();
  if (id) {
    const found = getSession(id);
    if (found) return found;
  }
  return createSession();
}
