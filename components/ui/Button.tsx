import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent text-bg hover:bg-[#F2C37A] uppercase tracking-[0.1em] font-medium font-sans',
  ghost:
    'bg-transparent text-fg border border-hairline hover:bg-bg-raised hover:border-hairline-strong font-sans',
  link: 'bg-transparent text-fg-muted hover:text-fg underline-offset-4 hover:underline font-sans',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-[11px]',
  md: 'h-10 px-5 text-[12px]',
  lg: 'h-12 px-7 text-[13px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-none transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        className
      )}
    >
      {children}
    </button>
  );
}
