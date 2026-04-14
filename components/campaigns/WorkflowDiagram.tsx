'use client';

import { motion } from 'framer-motion';
import { SEGMENT_HEX } from '@/lib/constants';
import type { Segment, WorkflowStep, Channel } from '@/lib/types';
import { Label } from '@/components/ui/Label';

/**
 * Editorial-dark visualization of a campaign workflow.
 *
 * Layout model:
 *  - Walk the workflow tree from the first step
 *  - For sequential steps (send_message, wait, end), stack vertically
 *  - For branch steps, place children side-by-side in a row
 *  - Only one level of branching is supported (enough for the 5 templates)
 *  - Nodes are hairline boxes, edges are 1px lines, active path in accent
 */

const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  whatsapp_then_email: 'WhatsApp → Email',
};

interface Props {
  workflow: WorkflowStep[];
  accent?: Segment;
  activePathIds?: string[];
}

interface LaidOutNode {
  step: WorkflowStep;
  depth: number;
  col: number;
  isBranchChild?: boolean;
  branchLabel?: string;
}

function layoutWorkflow(workflow: WorkflowStep[]): LaidOutNode[][] {
  const byId = new Map(workflow.map((s) => [s.id, s]));
  const rows: LaidOutNode[][] = [];
  const visited = new Set<string>();

  const first = workflow[0];
  if (!first) return rows;

  // Walk until we hit a branch
  let current: WorkflowStep | undefined = first;
  let depth = 0;
  while (current && !visited.has(current.id) && current.kind !== 'branch') {
    visited.add(current.id);
    rows.push([{ step: current, depth, col: 0 }]);
    depth++;
    if (current.kind === 'end') break;
    if ('next' in current && current.next) {
      current = byId.get(current.next);
    } else {
      current = undefined;
    }
  }

  // If we hit a branch, add it as a row and then spread its children
  if (current && current.kind === 'branch' && !visited.has(current.id)) {
    visited.add(current.id);
    rows.push([{ step: current, depth, col: 0 }]);
    depth++;

    // Each branch target becomes a column. Walk each branch until it ends.
    const branchHeads: LaidOutNode[][] = current.branches.map((br, i) => {
      const targets: LaidOutNode[] = [];
      let cur = byId.get(br.next);
      let d = depth;
      const seen = new Set<string>();
      while (cur && !seen.has(cur.id)) {
        seen.add(cur.id);
        targets.push({
          step: cur,
          depth: d,
          col: i,
          isBranchChild: true,
          branchLabel: targets.length === 0 ? br.label : undefined,
        });
        d++;
        if (cur.kind === 'end') break;
        if (cur.kind === 'branch') break;
        if ('next' in cur && cur.next) {
          cur = byId.get(cur.next);
        } else {
          cur = undefined;
        }
      }
      return targets;
    });

    const maxLen = Math.max(...branchHeads.map((b) => b.length));
    for (let i = 0; i < maxLen; i++) {
      const row: LaidOutNode[] = [];
      for (const br of branchHeads) {
        if (br[i]) row.push(br[i]!);
      }
      rows.push(row);
    }
  }

  return rows;
}

function stepLabel(step: WorkflowStep): string {
  switch (step.kind) {
    case 'send_message':
      return stepTitle(step.id);
    case 'wait':
      return `Wait ${formatHours(step.hours)}`;
    case 'branch':
      return 'Replied?';
    case 'end':
      return step.outcome === 'escalated' ? 'Route to team' : 'End';
  }
}

function stepTitle(id: string): string {
  const map: Record<string, string> = {
    send_thanks: 'Send thank-you',
    request_review: 'Request Google review',
    escalate: 'Route to team',
    gentle_reminder: 'Gentle reminder',
    send_invite: 'Send invitation',
    send_reactivation: 'Send reactivation',
    final_attempt: 'Final attempt',
    send_vip_invite: 'VIP invitation',
    send_frequent_invite: 'Frequent guest invitation',
  };
  return map[id] ?? id.replace(/_/g, ' ');
}

function formatHours(h: number): string {
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? 'day' : 'days'}`;
}

export function WorkflowDiagram({ workflow, accent = 'active', activePathIds }: Props) {
  const rows = layoutWorkflow(workflow);
  const accentHex = SEGMENT_HEX[accent];
  const activeSet = new Set(activePathIds ?? []);

  return (
    <div className="relative border border-hairline bg-bg-raised p-6 md:p-16">
      <div className="flex items-center justify-between mb-10">
        <Label>Workflow</Label>
        <Label>{workflow.length} steps</Label>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
      <div className="flex flex-col items-stretch gap-6 min-w-[480px]">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`grid gap-6 items-stretch`}
            style={{
              gridTemplateColumns: row.length === 1 ? '1fr' : `repeat(${row.length}, 1fr)`,
            }}
          >
            {row.map((node, colIdx) => (
              <motion.div
                key={node.step.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.06 * (rowIdx + colIdx) }}
                className="relative"
              >
                {node.branchLabel && (
                  <div className="mb-2 text-center">
                    <span
                      className="inline-block text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 border border-hairline bg-bg"
                      style={{ color: accentHex }}
                    >
                      {node.branchLabel}
                    </span>
                  </div>
                )}
                <WorkflowNode
                  step={node.step}
                  accentHex={accentHex}
                  isActive={activeSet.has(node.step.id)}
                />
                {/* vertical connector down (hairline) */}
                {rowIdx < rows.length - 1 && node.step.kind !== 'end' && (
                  <div
                    className="absolute left-1/2 -bottom-6 w-px h-6"
                    style={{
                      backgroundColor: activeSet.has(node.step.id) ? accentHex : 'var(--hairline)',
                    }}
                    aria-hidden
                  />
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function WorkflowNode({
  step,
  accentHex,
  isActive,
}: {
  step: WorkflowStep;
  accentHex: string;
  isActive: boolean;
}) {
  const border = isActive ? accentHex : 'var(--hairline)';

  if (step.kind === 'send_message') {
    return (
      <div
        className="border bg-bg px-5 py-4 h-full"
        style={{ borderColor: border }}
      >
        <div className="text-[9px] uppercase tracking-[0.14em] text-fg-subtle mb-1">
          {CHANNEL_LABEL[step.channel]} · Send
        </div>
        <div
          className="font-display text-lg leading-tight text-fg"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
        >
          {stepLabel(step)}
        </div>
      </div>
    );
  }

  if (step.kind === 'wait') {
    return (
      <div
        className="border border-dashed bg-transparent px-5 py-4 h-full flex items-center justify-center"
        style={{ borderColor: border }}
      >
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-[0.14em] text-fg-subtle mb-1">
            Wait
          </div>
          <div className="font-mono text-lg text-fg tabular-nums">
            {step.kind === 'wait' ? formatHours(step.hours) : ''}
          </div>
        </div>
      </div>
    );
  }

  if (step.kind === 'branch') {
    return (
      <div
        className="border bg-bg px-5 py-4 text-center h-full"
        style={{ borderColor: border }}
      >
        <div className="text-[9px] uppercase tracking-[0.14em] text-fg-subtle mb-1">
          Decision
        </div>
        <div
          className="font-display italic text-lg text-fg"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          {stepLabel(step)}
        </div>
      </div>
    );
  }

  // end
  return (
    <div
      className="border-2 bg-bg-sunken px-5 py-4 h-full flex items-center justify-center"
      style={{ borderColor: border }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.14em]"
        style={{ color: accentHex }}
      >
        {step.outcome === 'escalated' ? '✕ Routed' : '✓ End'}
      </div>
    </div>
  );
}
