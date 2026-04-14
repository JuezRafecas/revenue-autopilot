import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-bg-raised relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-hairline-strong before:to-transparent before:animate-[shimmer_1.8s_infinite]',
        className
      )}
      style={{
        // @ts-expect-error — CSS custom prop
        '--shimmer-start': '-100%',
      }}
    />
  );
}
