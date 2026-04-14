'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from './Logo';
import { cn } from '@/lib/cn';
import { MOCK_RESTAURANT } from '@/lib/mock';

const NAV = [
  { href: '/hub', label: 'Nomi · Hub', live: true },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/templates', label: 'Templates', soon: true },
  { href: '/audience', label: 'Audience' },
  { href: '/messages', label: 'Messages', badgeKey: 'pending' as const },
  { href: '/integrations', label: 'Integrations' },
  { href: '/settings', label: 'Settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  pendingCount?: number;
}

export function Sidebar({ mobileOpen = false, onMobileClose, pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <div
        className="px-7 py-7"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <Link href="/dashboard" className="inline-block" onClick={onMobileClose}>
          <Logo />
        </Link>
        <div
          className="mt-3 font-mono text-[10px] uppercase"
          style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
        >
          {MOCK_RESTAURANT.name}
        </div>
      </div>

      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            const showPendingBadge = item.badgeKey === 'pending' && pendingCount > 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex items-center gap-3 pl-3 pr-3 py-2.5 text-[11px] uppercase font-[600] transition-colors',
                    'hover:bg-[var(--bg-raised)]'
                  )}
                  style={{
                    letterSpacing: '0.18em',
                    color: active ? 'var(--fg)' : 'var(--fg-subtle)',
                    fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
                  }}
                >
                  <span
                    aria-hidden
                    className="shrink-0 transition-all"
                    style={{
                      width: active ? 3 : 2,
                      height: active ? 14 : 10,
                      backgroundColor: active ? 'var(--accent)' : 'transparent',
                      border: active ? 'none' : '1px solid var(--fg-faint)',
                      borderRadius: 0,
                    }}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.soon && (
                    <span
                      className="font-mono text-[8.5px] px-1.5 py-0.5"
                      style={{
                        letterSpacing: '0.12em',
                        color: 'var(--fg-subtle)',
                        border: '1px solid var(--hairline-strong)',
                      }}
                    >
                      SOON
                    </span>
                  )}
                  {showPendingBadge && (
                    <span
                      className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-mono font-bold leading-none"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg)',
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-[232px] shrink-0 flex-col h-screen sticky top-0 overflow-y-auto"
        style={{
          background: 'var(--bg-sunken)',
          borderRight: '1px solid var(--hairline)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay + panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="relative z-50 flex w-[280px] max-w-[80vw] flex-col h-full"
            style={{
              background: 'var(--bg-sunken)',
              borderRight: '1px solid var(--hairline)',
            }}
          >
            <div className="flex items-center justify-end px-4 pt-4">
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="p-2 text-fg-subtle hover:text-fg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                  <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="none" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
