'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/cn';
import { MOCK_RESTAURANT } from '@/lib/mock';

const NAV = [
  { href: '/hub', label: 'Nomi · Hub', live: true },
  { href: '/campaigns', label: 'Campañas' },
  { href: '/templates', label: 'Plantillas' },
  { href: '/audience', label: 'Audiencia' },
  { href: '/messages', label: 'Mensajes' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar(_props: SidebarProps = {}) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-[232px] shrink-0 flex-col min-h-screen sticky top-0"
      style={{
        background: 'var(--bg-sunken)',
        borderRight: '1px solid var(--hairline)',
      }}
    >
      <div
        className="px-7 py-7"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <Link href="/dashboard" className="inline-block">
          <Logo />
        </Link>
        <div
          className="mt-3 font-mono text-[9.5px] uppercase"
          style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
        >
          v0.1 · Fabric Sushi
        </div>
      </div>

      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href as '/dashboard'}
                  className={cn(
                    'group flex items-center gap-3 pl-3 pr-3 py-2.5 text-[11px] uppercase font-[600] transition-colors',
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
                  {item.label}
                  {item.live && (
                    <span
                      aria-hidden
                      className="ml-auto"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: 'var(--k-green, #0e5e48)',
                        boxShadow: '0 0 0 3px rgba(14, 94, 72, 0.2)',
                        animation: 'k-pulse 1.6s ease-in-out infinite',
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="px-7 py-6"
        style={{ borderTop: '1px solid var(--hairline)' }}
      >
        <div
          className="text-[10px] uppercase mb-2 font-[600]"
          style={{
            letterSpacing: '0.18em',
            color: 'var(--k-green, #0e5e48)',
            fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
          }}
        >
          Restaurante
        </div>
        <div
          className="k-italic-serif text-[18px] leading-tight"
          style={{ color: 'var(--fg)' }}
        >
          {MOCK_RESTAURANT.name}
        </div>
        <div
          className="font-mono text-[10px] mt-1"
          style={{ color: 'var(--fg-subtle)', letterSpacing: '0.08em' }}
        >
          {MOCK_RESTAURANT.slug}
        </div>
      </div>
    </aside>
  );
}
