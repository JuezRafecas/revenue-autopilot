import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MessagesLoading() {
  return (
    <AppShell>
      <Header />
      <section className="editorial-container pt-12 pb-6">
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-10 w-56 mb-6" />
      </section>
      <section className="editorial-container pb-6">
        <div className="grid grid-cols-3 border-y border-hairline-strong">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-7 border-r border-hairline last:border-r-0">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </section>
      <section className="editorial-container pb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-5 border-b border-hairline flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48 ml-auto" />
          </div>
        ))}
      </section>
    </AppShell>
  );
}
