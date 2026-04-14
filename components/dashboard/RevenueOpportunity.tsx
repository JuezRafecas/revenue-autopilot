'use client';

import { motion } from 'framer-motion';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';

export function RevenueOpportunity({
  totalAtStake,
  dormantCount,
  avgTicket,
}: {
  totalAtStake: number;
  dormantCount: number;
  avgTicket: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="border-t border-b border-hairline py-16 md:py-24"
    >
      <div className="editorial-container grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 items-end">
        <div>
          <Label className="mb-4">Plata esperando</Label>
          <div
            className="font-display font-light text-accent tabular-nums leading-[0.9]"
            style={{
              fontVariationSettings: '"opsz" 144, "SOFT" 20',
              fontSize: 'clamp(4rem, 10vw, 9.5rem)',
            }}
          >
            <Numeral value={totalAtStake} animated format="ars" size="display" className="font-display not-italic" />
          </div>
        </div>
        <p
          className="font-display italic text-fg-muted text-xl md:text-2xl leading-snug max-w-[38ch] pb-6"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          recuperable en los próximos 90 días si se acciona sobre los{' '}
          <span className="text-fg">{dormantCount}</span> comensales que dejaron de venir.
          Ticket promedio <span className="font-mono text-[0.8em] not-italic">${(avgTicket / 1000).toFixed(0)}K</span>.
        </p>
      </div>
    </motion.section>
  );
}
