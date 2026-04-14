import { cn } from '@/lib/cn';

export function Hairline({
  vertical = false,
  className,
}: {
  vertical?: boolean;
  className?: string;
}) {
  if (vertical) {
    return <div className={cn('w-px self-stretch bg-hairline', className)} />;
  }
  return <div className={cn('h-px w-full bg-hairline', className)} />;
}
