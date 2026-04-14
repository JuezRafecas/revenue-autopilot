import { cn } from '@/lib/cn';

export function Label({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'span' | 'p';
}) {
  return (
    <Tag
      className={cn(
        'font-sans text-[10px] font-medium uppercase tracking-label text-fg-subtle',
        className
      )}
    >
      {children}
    </Tag>
  );
}
