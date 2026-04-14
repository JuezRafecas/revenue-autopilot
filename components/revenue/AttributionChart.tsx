'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { SEGMENT_HEX } from '@/lib/constants';
import { TEMPLATES } from '@/lib/templates';
import type { AttributionSummary } from '@/lib/types';

interface Props {
  rows: AttributionSummary[];
  height?: number;
}

export function AttributionChart({ rows, height = 320 }: Props) {
  const data = rows.map((r) => {
    const tpl = r.template_key ? TEMPLATES[r.template_key] : null;
    return {
      name: r.campaign_name,
      revenue: r.revenue,
      conversions: r.conversions,
      color: tpl ? SEGMENT_HEX[tpl.accent] : SEGMENT_HEX.active,
    };
  });

  return (
    <div className="border border-hairline bg-bg-raised p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[10px] uppercase tracking-label text-fg-subtle">
          Revenue by campaign
        </div>
        <div className="text-[10px] uppercase tracking-label text-fg-subtle">
          last 30 days
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <XAxis
            type="number"
            tickLine={false}
            axisLine={{ stroke: 'var(--hairline)' }}
            tick={{
              fill: 'var(--fg-subtle)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
            }}
            tickFormatter={(v) =>
              new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(
                v
              )
            }
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: 'var(--hairline)' }}
            width={180}
            tick={{
              fill: 'var(--fg-muted)',
              fontSize: 12,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
            }}
          />
          <Tooltip
            cursor={{ fill: 'var(--bg-elevated)' }}
            contentStyle={{
              background: 'var(--bg)',
              border: '1px solid var(--hairline-strong)',
              borderRadius: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--fg)',
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                maximumFractionDigits: 0,
              }).format(value)
            }
          />
          <Bar dataKey="revenue" barSize={18}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
