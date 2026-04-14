'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Papa from 'papaparse';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { WorkflowDiagram } from '@/components/campaigns/WorkflowDiagram';
import type { WorkflowStep } from '@/lib/types';

interface Member {
  name: string;
  phone: string;
}

interface VoiceRow {
  name?: string;
  phone?: string;
}

const VOICE_WORKFLOW: WorkflowStep[] = [
  { id: 'call_guest', kind: 'make_call', next: 'end' },
  { id: 'end', kind: 'end', outcome: 'completed' },
];

function defaultScheduleLocal(): string {
  const now = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function VoiceCampaignWizard() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [scheduleLocal, setScheduleLocal] = useState<string>(defaultScheduleLocal());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsePreview = (f: File) => {
    setCsvError(null);
    setMembers([]);
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Only .csv files are accepted');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setCsvError('File exceeds 50 MB');
      return;
    }
    Papa.parse<VoiceRow>(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (result) => {
        const rows = result.data
          .map((r) => ({
            name: (r.name ?? '').toString().trim(),
            phone: (r.phone ?? '').toString().trim(),
          }))
          .filter((m) => m.phone.length > 0);
        if (rows.length === 0) {
          setCsvError('CSV must have at least one row with a phone column');
          return;
        }
        setMembers(rows);
      },
      error: (err) => setCsvError(err.message),
    });
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    parsePreview(f);
  };

  const canLaunch = useMemo(
    () => !!name.trim() && !!file && members.length > 0 && !!scheduleLocal && !submitting,
    [name, file, members.length, scheduleLocal, submitting],
  );

  const launch = async () => {
    if (!file) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('schedule_at', new Date(scheduleLocal).toISOString());
      fd.append('file', file);
      const res = await fetch('/api/campaigns', { method: 'POST', body: fd });
      const body = await res.json();
      if (!res.ok) {
        setSubmitError(body.error ?? `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      const campaignId: string = body.campaign?.id;
      if (!campaignId) {
        setSubmitError('Campaign created but no id returned');
        setSubmitting(false);
        return;
      }
      const runRes = await fetch(`/api/campaigns/${campaignId}/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
      if (!runRes.ok) {
        const runBody = await runRes.json().catch(() => ({}));
        setSubmitError(runBody.error ?? `run HTTP ${runRes.status}`);
        setSubmitting(false);
        return;
      }
      router.push(`/campaigns/${campaignId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'unknown error');
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="editorial-container pt-12 pb-10">
        <Link
          href="/campaigns"
          className="inline-block font-mono text-[10px] uppercase tracking-label text-fg-subtle hover:text-fg mb-10"
        >
          ← Back to campaigns
        </Link>

        <Label className="mb-3">New voice campaign</Label>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-fg max-w-[22ch]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          One-shot voice call.
        </h1>
        <p
          className="mt-4 font-display italic text-xl text-fg-muted max-w-[56ch] leading-snug"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          upload your guest list, pick a time, launch. the voice agent calls
          every guest once.
        </p>
      </section>

      <section className="editorial-container pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,420px)] gap-10">
        <div className="space-y-12">
          {/* Name */}
          <div>
            <Label className="mb-3">Step 1 · Name</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VIP reactivation — April 20"
              className="w-full bg-transparent border-b border-hairline-strong focus:border-accent outline-none py-3 font-display text-2xl text-fg placeholder:text-fg-faint"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            />
          </div>

          {/* Audience CSV */}
          <div>
            <Label className="mb-3">Step 2 · Audience CSV</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files[0] ?? null);
              }}
              onClick={() => inputRef.current?.click()}
              className={`
                cursor-pointer border border-dashed p-16 text-center transition-colors duration-200
                ${dragging ? 'border-accent bg-accent/5' : 'border-hairline-strong hover:border-fg-subtle'}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-subtle">
                {file ? `✓ ${file.name}` : 'Drop your CSV here · or click to choose'}
              </div>
              <div className="font-mono text-[10px] mt-2 text-fg-faint uppercase tracking-label">
                Expected columns: name, phone
              </div>
              {members.length > 0 && (
                <div
                  className="font-mono text-[11px] mt-4 uppercase tracking-label"
                  style={{ color: 'var(--accent)' }}
                >
                  {members.length} guests loaded
                </div>
              )}
            </div>
            {csvError && (
              <div
                className="mt-4 px-4 py-3 font-mono text-[11px] uppercase tracking-label"
                style={{
                  color: 'var(--accent-dim)',
                  background: 'rgba(230,120,76,0.06)',
                  border: '1px solid var(--accent)',
                }}
              >
                {csvError}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <Label className="mb-3">Step 3 · Schedule (one-shot)</Label>
            <input
              type="datetime-local"
              value={scheduleLocal}
              onChange={(e) => setScheduleLocal(e.target.value)}
              className="bg-transparent border-b border-hairline-strong focus:border-accent outline-none py-3 font-mono text-lg text-fg"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-label text-fg-faint">
              The campaign will fire once at the selected time.
            </p>
          </div>

          {/* Workflow preview */}
          <div>
            <Label className="mb-4">Workflow preview</Label>
            <WorkflowDiagram workflow={VOICE_WORKFLOW} accent="vip" />
          </div>
        </div>

        <aside className="space-y-8">
          <div className="border border-hairline bg-bg-raised p-8">
            <Label className="mb-4">Review and launch</Label>
            <dl className="space-y-4 mb-8">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-label text-fg-faint">
                  Name
                </dt>
                <dd className="font-display text-lg text-fg truncate">
                  {name.trim() || '—'}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-label text-fg-faint">
                  Audience
                </dt>
                <dd className="font-display text-lg text-fg">
                  {members.length > 0 ? `${members.length} guests` : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-label text-fg-faint">
                  Schedule
                </dt>
                <dd className="font-display text-lg text-fg">
                  {scheduleLocal ? scheduleLocal.replace('T', ' ') : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-label text-fg-faint">
                  Channel
                </dt>
                <dd className="font-display text-lg text-fg">Voice · Call</dd>
              </div>
            </dl>

            <Button
              variant="primary"
              size="lg"
              disabled={!canLaunch}
              onClick={launch}
              className="w-full"
            >
              {submitting ? 'Launching…' : 'Launch campaign'}
            </Button>

            {submitError && (
              <div
                className="mt-4 px-3 py-2 font-mono text-[10px] uppercase tracking-label"
                style={{
                  color: 'var(--accent-dim)',
                  background: 'rgba(230,120,76,0.06)',
                  border: '1px solid var(--accent)',
                }}
              >
                {submitError}
              </div>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
