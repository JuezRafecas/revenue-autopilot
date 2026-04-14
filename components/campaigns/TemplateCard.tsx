'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/Label';
import { SEGMENT_HEX } from '@/lib/constants';
import type { CampaignTemplate } from '@/lib/types';

const TYPE_LABEL = {
  automation: 'Automation',
  one_shot: 'One-off',
} as const;

export function TemplateCard({
  template,
  index = 0,
}: {
  template: CampaignTemplate;
  index?: number;
}) {
  const hex = SEGMENT_HEX[template.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06 * index, ease: [0.16, 1, 0.3, 1] }}
      className="group relative border border-hairline bg-bg-raised hover:bg-bg-elevated focus-within:bg-bg-elevated transition-colors duration-200 flex flex-col"
    >
      {/* Accent bar */}
      <span
        className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-200 group-hover:h-[6px]"
        style={{ backgroundColor: hex }}
        aria-hidden
      />

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <Label>{TYPE_LABEL[template.type]}</Label>
          <span className="text-[10px] uppercase tracking-label" style={{ color: hex }}>
            {template.accent.replace('_', ' ')}
          </span>
        </div>

        <h3
          className="font-display text-[26px] leading-tight text-fg mb-3"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {template.name}
        </h3>

        <p
          className="font-display italic text-[15px] text-fg-muted leading-snug mb-6"
          style={{ fontVariationSettings: '"opsz" 14, "SOFT" 100' }}
        >
          {template.description}
        </p>

        <div className="mt-auto pt-6 border-t border-hairline">
          <Label className="mb-3">KPIs optimized</Label>
          <ul className="space-y-1">
            {template.kpi_labels.map((kpi) => (
              <li
                key={kpi.key}
                className="flex items-center gap-2 text-[12px] text-fg-muted font-mono"
              >
                <span
                  className="h-[2px] w-3"
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
                {kpi.label}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/campaigns/new?template=${template.key}` as const}
          className="mt-8 inline-flex items-center justify-between px-4 py-3 transition-colors duration-150 text-[11px] uppercase font-[600] group/cta"
          style={{
            letterSpacing: '0.16em',
            border: '1px solid var(--fg)',
            color: 'var(--fg)',
            background: 'var(--bg-raised)',
            fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
          }}
        >
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-full transition-transform group-hover/cta:scale-125"
              style={{ background: hex }}
            />
            Use template
          </span>
          <span className="transition-transform group-hover/cta:translate-x-0.5">→</span>
        </Link>
      </div>
    </motion.div>
  );
}
