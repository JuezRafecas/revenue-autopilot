'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatARS } from '@/lib/constants';
import { describeAudience } from '@/lib/audience';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { Numeral } from '@/components/ui/Numeral';
import type { Campaign } from '@/lib/types';
import { TEMPLATES } from '@/lib/templates';

export function CampaignRow({ campaign, index = 0 }: { campaign: Campaign; index?: number }) {
  const tpl = campaign.template_key ? TEMPLATES[campaign.template_key] : null;
  const accent = tpl?.accent ?? 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 * index, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <Link
        href={`/campaigns/${campaign.id}` as const}
        className="group relative block transition-colors duration-200 hover:bg-bg-sunken focus-visible:bg-bg-sunken"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 transition-[width] duration-200 group-hover:w-[6px] group-focus-visible:w-[6px] w-[3px]"
          style={{ backgroundColor: `var(--segment-${accent})` }}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1.8fr)_100px_90px_100px_140px_auto] items-center gap-4 lg:gap-6 pl-6 pr-5 lg:pl-8 lg:pr-6 py-5 lg:py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <CampaignStatusBadge status={campaign.status} animated />
              <span
                className="text-[9.5px] uppercase"
                style={{
                  letterSpacing: '0.16em',
                  color: 'var(--fg-subtle)',
                  fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
                }}
              >
                {campaign.type === 'automation' ? 'Automation' : 'One-off campaign'}
              </span>
            </div>
            <h3
              className="truncate"
              style={{
                fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.035em',
                color: 'var(--fg)',
                lineHeight: 1.1,
              }}
            >
              {campaign.name}
            </h3>
            <p
              className="k-italic-serif mt-1 leading-snug truncate"
              style={{
                fontSize: '13px',
                color: 'var(--fg-muted)',
                maxWidth: '62ch',
              }}
            >
              {describeAudience(campaign.audience_filter)}
            </p>
          </div>

          {/* Desktop metrics */}
          <div className="hidden lg:block"><Metric value={<Numeral value={campaign.metrics.sent} />} label="sent" /></div>
          <div className="hidden lg:block"><Metric
            value={`${(campaign.metrics.response_rate * 100).toFixed(1)}%`}
            label="response"
          /></div>
          <div className="hidden lg:block"><Metric
            value={`${(campaign.metrics.conversion_rate * 100).toFixed(1)}%`}
            label="conversion"
          /></div>
          <div className="hidden lg:block"><Metric
            value={formatARS(campaign.metrics.revenue_attributed)}
            label="revenue"
            anchor
          /></div>

          {/* Mobile compact metrics */}
          <div className="lg:hidden col-span-2 mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-hairline">
            <MobileMetric label="Sent" value={<Numeral value={campaign.metrics.sent} />} />
            <MobileMetric label="Conv." value={`${(campaign.metrics.conversion_rate * 100).toFixed(1)}%`} />
            <MobileMetric
              label="Revenue"
              value={formatARS(campaign.metrics.revenue_attributed)}
              accent
              align="right"
            />
          </div>

          <div className="text-right">
            <span
              className="inline-flex items-center gap-1.5 text-[10.5px] uppercase font-[600] px-3 py-1.5 transition-colors group-hover:bg-[var(--k-green)] group-hover:text-[var(--bg)] group-hover:border-[var(--k-green)]"
              style={{
                letterSpacing: '0.16em',
                border: '1px solid var(--fg)',
                color: 'var(--fg)',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              Open
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MobileMetric({
  label,
  value,
  accent,
  align = 'left',
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div
        className="text-[9px] uppercase mb-0.5"
        style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
      >
        {label}
      </div>
      <div
        className="font-mono tabular-nums text-[13px]"
        style={{
          color: accent ? 'var(--accent)' : 'var(--fg)',
          fontWeight: accent ? 600 : 400,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  anchor = false,
}: {
  value: React.ReactNode;
  label: string;
  anchor?: boolean;
}) {
  return (
    <div className="text-right">
      <div
        className="font-mono tabular-nums"
        style={{
          fontSize: '18px',
          color: anchor ? 'var(--accent)' : 'var(--fg)',
          fontWeight: anchor ? 600 : 400,
          letterSpacing: '-0.005em',
        }}
      >
        {value}
      </div>
      <div
        className="text-[9.5px] uppercase mt-0.5"
        style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
      >
        {label}
      </div>
    </div>
  );
}
