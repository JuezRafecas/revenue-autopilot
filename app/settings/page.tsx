import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { MOCK_RESTAURANT } from '@/lib/mock';

export const metadata: Metadata = {
  title: 'Configuración · Revenue Autopilot',
};

export default function SettingsPage() {
  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-16 pb-24 max-w-[780px]">
        <Label className="mb-3">Settings</Label>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-fg mb-16"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          Restaurant
        </h1>

        <div className="space-y-12">
          <Field label="Name" value={MOCK_RESTAURANT.name} />
          <Field label="Slug" value={MOCK_RESTAURANT.slug} mono />
          <Field label="Average ticket" value={`$${MOCK_RESTAURANT.avg_ticket.toLocaleString('es-AR')}`} mono />
          <Field label="Currency" value={MOCK_RESTAURANT.currency} mono />
          <Field label="Time zone" value="America/Argentina/Buenos_Aires" mono />
        </div>

        <div className="mt-20 pt-12 border-t border-hairline">
          <Label className="mb-6">Channels</Label>
          <div className="space-y-6">
            <ChannelRow name="WhatsApp Business" status="Connected" active />
            <ChannelRow name="Transactional email" status="Resend · connected" active />
          </div>
        </div>

        <div className="mt-16">
          <p
            className="font-mono text-[11px] uppercase"
            style={{ letterSpacing: '0.1em', color: 'var(--fg-subtle)' }}
          >
            Para modificar estos datos, contactá a soporte.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-8 items-baseline border-b border-hairline pb-5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className={mono ? 'font-mono text-[15px] text-fg' : 'font-display italic text-xl text-fg'}
          style={!mono ? { fontVariationSettings: '"opsz" 144, "SOFT" 50' } : undefined}
        >
          {value}
        </div>
        <span
          className="text-[9px] uppercase font-mono px-1.5 py-0.5"
          style={{
            letterSpacing: '0.1em',
            color: 'var(--fg-subtle)',
            border: '1px solid var(--hairline)',
          }}
        >
          solo lectura
        </span>
      </div>
    </div>
  );
}

function ChannelRow({ name, status, active }: { name: string; status: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-5">
      <div>
        <div
          className="font-display text-lg text-fg"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
        >
          {name}
        </div>
        <div className="text-[10px] uppercase tracking-label text-fg-subtle mt-1">{status}</div>
      </div>
      <div
        className={`text-[10px] uppercase tracking-label flex items-center gap-2 ${
          active ? 'text-segment-active' : 'text-fg-subtle'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {active ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
}
