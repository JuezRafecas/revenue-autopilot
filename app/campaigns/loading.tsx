import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CampaignsLoading() {
  return (
    <AppShell>
      <Header />
      <section className="editorial-container pt-12 pb-6">
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-full max-w-lg" />
      </section>
      <section className="editorial-container pb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-6 border-b border-hairline flex items-center gap-6">
            <Skeleton className="h-3 w-3" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-3 w-72" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </section>
    </AppShell>
  );
}
