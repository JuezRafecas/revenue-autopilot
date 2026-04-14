import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <AppShell>
      <Header />
      <section className="editorial-container pt-8 pb-14">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-24 w-72 mb-6" />
        <Skeleton className="h-5 w-96" />
      </section>
      <section className="editorial-container pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-y border-hairline-strong">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-7 border-r border-hairline last:border-r-0">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </section>
      <section className="editorial-container pb-16">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-5 border-b border-hairline flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </section>
    </AppShell>
  );
}
