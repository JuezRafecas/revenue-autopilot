import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AudienceLoading() {
  return (
    <AppShell>
      <Header />
      <section className="editorial-container pt-12 pb-6">
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-10 w-80 mb-6" />
      </section>
      <section className="editorial-container pb-16">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-4 border-b border-hairline flex items-center gap-4">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        ))}
      </section>
    </AppShell>
  );
}
