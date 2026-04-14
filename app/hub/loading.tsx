import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HubLoading() {
  return (
    <AppShell>
      <div className="flex flex-col h-[100dvh] px-6 py-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="flex-1 flex flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-3/4" />
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    </AppShell>
  );
}
