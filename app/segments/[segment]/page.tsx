import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { GuestList } from '@/components/guests/GuestList';
import { BulkActionPanel } from '@/components/actions/BulkActionPanel';
import { Label } from '@/components/ui/Label';
import { SEGMENT_CONFIG } from '@/lib/constants';
import type { Segment } from '@/lib/types';
import { MOCK_GUESTS, MOCK_SEGMENT_SUMMARIES, MOCK_SAMPLE_MESSAGES } from '@/lib/mock';

const VALID_SEGMENTS: Segment[] = ['vip', 'active', 'new', 'at_risk', 'dormant', 'lead'];

export default async function SegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  if (!VALID_SEGMENTS.includes(segment as Segment)) {
    notFound();
  }
  const seg = segment as Segment;
  const cfg = SEGMENT_CONFIG[seg];
  const summary = MOCK_SEGMENT_SUMMARIES.find((s) => s.segment === seg)!;
  const guests = MOCK_GUESTS.filter((g) => g.segment === seg);
  const sampleMessage = MOCK_SAMPLE_MESSAGES[seg];

  const previews = guests.slice(0, 2).map((g) => ({
    name: g.name,
    message: sampleMessage,
  }));

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-16 pb-10">
        <Label className="mb-4">Segmento</Label>
        <h1
          className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.95] text-fg mb-4"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50, "WONK" 1' }}
        >
          {cfg.label}
        </h1>
        <p
          className="font-display italic text-xl md:text-2xl text-fg-muted max-w-[52ch] leading-snug"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          {cfg.description}.
        </p>
      </section>

      <section className="editorial-container grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-12 pb-24">
        <div>
          <GuestList rows={guests} />
        </div>
        <BulkActionPanel
          segmentLabel={cfg.label}
          guestCount={summary.count}
          estimatedRevenue={summary.revenue_opportunity}
          previews={previews}
        />
      </section>
    </AppShell>
  );
}
