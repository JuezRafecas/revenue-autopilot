import { describe, expect, it } from 'vitest';
import { voiceCampaignDraft, deriveChannels } from '../campaigns';
import type { MakeCallStep, WorkflowStep } from '../types';

describe('voiceCampaignDraft', () => {
  const members = [
    { name: 'Ana', phone: '+5491100000001' },
    { name: 'Bruno', phone: '+5491100000002' },
  ];

  it('builds a one_shot draft with a schedule trigger', () => {
    const draft = voiceCampaignDraft('r-1', {
      name: 'Voice test',
      scheduleAt: '2026-05-01T18:00:00.000Z',
      members,
    });

    expect(draft.restaurant_id).toBe('r-1');
    expect(draft.template_key).toBeNull();
    expect(draft.type).toBe('one_shot');
    expect(draft.status).toBe('draft');
    expect(draft.name).toBe('Voice test');
    expect(draft.trigger).toEqual({
      type: 'schedule',
      at: '2026-05-01T18:00:00.000Z',
    });
  });

  it('stores audience members inline in audience_filter', () => {
    const draft = voiceCampaignDraft('r-1', {
      name: 'Voice test',
      scheduleAt: '2026-05-01T18:00:00.000Z',
      members,
    });

    expect(draft.audience_filter.members).toEqual(members);
  });

  it('produces a single make_call step workflow plus an end step', () => {
    const draft = voiceCampaignDraft('r-1', {
      name: 'Voice test',
      scheduleAt: '2026-05-01T18:00:00.000Z',
      members,
    });

    expect(draft.workflow).toHaveLength(2);
    const first = draft.workflow[0] as WorkflowStep;
    expect(first.kind).toBe('make_call');
    const call = first as MakeCallStep;
    expect(call.next).toBe('end');
    expect(draft.workflow[1].kind).toBe('end');
  });

  it('includes call in the channels list', () => {
    const draft = voiceCampaignDraft('r-1', {
      name: 'Voice test',
      scheduleAt: '2026-05-01T18:00:00.000Z',
      members,
    });

    expect(draft.channels).toContain('call');
  });
});

describe('deriveChannels with make_call', () => {
  it('includes call when the workflow has a make_call step', () => {
    const workflow: WorkflowStep[] = [
      { id: 'call_guest', kind: 'make_call', next: 'end' },
      { id: 'end', kind: 'end', outcome: 'completed' },
    ];
    expect(deriveChannels(workflow)).toContain('call');
  });
});
