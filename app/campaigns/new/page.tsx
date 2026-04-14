import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { WorkflowDiagram } from '@/components/campaigns/WorkflowDiagram';
import { AudienceSummary } from '@/components/campaigns/AudienceSummary';
import { VoiceCampaignWizard } from '@/components/campaigns/VoiceCampaignWizard';
import { TEMPLATES, TEMPLATE_ORDER } from '@/lib/templates';
import type { TemplateKey } from '@/lib/types';

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateParam } = await searchParams;

  // No template param → render the new voice-campaign wizard.
  if (!templateParam) {
    return (
      <AppShell>
        <Header />
        <VoiceCampaignWizard />
      </AppShell>
    );
  }

  // Legacy template preview (still linked from /templates with the SOON badge).
  const templateKey = TEMPLATE_ORDER.includes(templateParam as TemplateKey)
    ? (templateParam as TemplateKey)
    : 'reactivate_inactive';

  const tpl = TEMPLATES[templateKey];

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-12 pb-10">
        <Link
          href="/templates"
          className="inline-block font-mono text-[10px] uppercase tracking-label text-fg-subtle hover:text-fg mb-10"
        >
          ← Back to templates
        </Link>

        <Label className="mb-3">New campaign from template</Label>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-fg max-w-[22ch]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {tpl.name}
        </h1>
        <p
          className="mt-4 font-display italic text-xl text-fg-muted max-w-[56ch] leading-snug"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          {tpl.description}
        </p>
      </section>

      <section className="editorial-container pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,380px)] gap-10">
        <div>
          <Label className="mb-4">Proposed workflow</Label>
          <WorkflowDiagram workflow={tpl.workflow} accent={tpl.accent} />
        </div>

        <aside className="space-y-8">
          <AudienceSummary filter={tpl.default_audience} matchedCount={402} />

          <div className="border border-hairline bg-bg-raised p-8">
            <Label className="mb-4">Review and launch</Label>
            <p
              className="font-display italic text-[15px] text-fg-muted leading-snug mb-8"
              style={{ fontVariationSettings: '"opsz" 14' }}
            >
              campaign activation is in private beta. the workflow, audience,
              and KPIs are already wired — launch is coming next.
            </p>
            <div
              className="flex items-center justify-center px-4 py-4 text-[11px] uppercase font-[600]"
              style={{
                letterSpacing: '0.18em',
                border: '1px dashed var(--fg-faint)',
                color: 'var(--fg-subtle)',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)', opacity: 0.6 }}
                />
                Coming soon
              </span>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
