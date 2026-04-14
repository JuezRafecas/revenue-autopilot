'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/cn';
import { MOCK_RESTAURANT } from '@/lib/mock';

const NAV = [
  { href: '/dashboard', label: 'Diagnóstico' },
  { href: '/actions', label: 'Acciones' },
  { href: '/revenue', label: 'Revenue' },
  { href: '/upload', label: 'Subir datos' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-hairline bg-bg-sunken min-h-screen sticky top-0">
      <div className="px-7 py-8 border-b border-hairline">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-8">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href as '/dashboard'}
                  className={cn(
                    'group flex items-center gap-3 pl-4 pr-3 py-3 text-[11px] uppercase tracking-[0.14em] font-sans font-medium transition-colors',
                    active ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'h-3 w-[2px] shrink-0 transition-colors',
                      active ? 'bg-accent' : 'bg-transparent group-hover:bg-fg-faint'
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-7 py-6 border-t border-hairline">
        <div className="text-[10px] uppercase tracking-label text-fg-subtle mb-2">
          Restaurante
        </div>
        <div
          className="font-display italic text-lg text-fg leading-tight"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          {MOCK_RESTAURANT.name}
        </div>
        <div className="font-mono text-[10px] text-fg-subtle mt-1">
          {MOCK_RESTAURANT.slug}
        </div>
      </div>
    </aside>
  );
}
