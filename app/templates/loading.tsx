import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TemplatesLoading() {
  return (
    <AppShell>
      <Header live={false} />
      <section className="editorial-container pt-12 pb-6">
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-5 w-96" />
      </section>
      <section className="editorial-container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-hairline">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-8 border-b border-r border-hairline">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
