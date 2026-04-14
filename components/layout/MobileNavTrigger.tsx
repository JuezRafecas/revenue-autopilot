'use client';

import { Logo } from './Logo';

export function MobileNavTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <div
      className="md:hidden flex items-center justify-between px-5 py-4 sticky top-0 z-30"
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <Logo />
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open navigation menu"
        className="inline-flex items-center justify-center p-2 -mr-2 transition-colors hover:bg-[var(--bg-sunken)]"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden>
          <path d="M0 1 H20 M0 7 H20 M0 13 H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="none" />
        </svg>
      </button>
    </div>
  );
}
