import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { campaignFromRow, type CampaignRow } from '@/lib/campaigns-db';
import { filterProfiles } from '@/lib/audience';
import { generateMessage } from '@/lib/claude';
import {
  SYSTEM_PROMPTS,
  buildReactivationPrompt,
  buildSecondVisitPrompt,
  buildPostVisitPrompt,
  buildFillTablesPrompt,
} from '@/lib/prompts';
import type {
  AudienceFilter,
  Campaign,
  GuestProfile,
  Guest,
  SendMessageStep,
} from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 300;

const MAX_MESSAGES_PER_RUN = 20;

function firstSendStep(campaign: Campaign): SendMessageStep | null {
  for (const step of campaign.workflow) {
    if (step.kind === 'send_message') return step;
  }
  return null;
}

function buildPromptForStep(
  promptKey: string,
  guest: Guest,
  profile: GuestProfile,
  restaurantName: string,
): { system: string; user: string } | null {
  if (promptKey === 'reactivation') {
    return {
      system: SYSTEM_PROMPTS.reactivation,
      user: buildReactivationPrompt(
        {
          name: guest.name,
          total_visits: profile.total_visits,
          days_since_last: profile.days_since_last ?? 0,
          preferred_day_of_week: profile.preferred_day_of_week,
          preferred_shift: profile.preferred_shift,
          preferred_sector: profile.preferred_sector,
          avg_party_size: profile.avg_party_size,
          avg_score: profile.avg_score,
        },
        restaurantName,
      ),
    };
  }
  if (promptKey === 'second_visit') {
    return {
      system: SYSTEM_PROMPTS.second_visit,
      user: buildSecondVisitPrompt(
        {
          name: guest.name,
          first_visit_at: profile.first_visit_at ?? new Date().toISOString(),
          preferred_shift: profile.preferred_shift,
          preferred_sector: profile.preferred_sector,
          party_size: profile.avg_party_size,
          score: profile.avg_score,
        },
        restaurantName,
      ),
    };
  }
  if (promptKey === 'post_visit') {
    return {
      system: SYSTEM_PROMPTS.post_visit,
      user: buildPostVisitPrompt(
        {
          name: guest.name,
          total_visits: profile.total_visits,
          party_size: profile.avg_party_size,
          sector: profile.preferred_sector,
          score: profile.avg_score,
        },
        restaurantName,
      ),
    };
  }
  if (promptKey === 'fill_tables') {
    return {
      system: SYSTEM_PROMPTS.fill_tables,
      user: buildFillTablesPrompt(
        {
          name: guest.name,
          total_visits: profile.total_visits,
          preferred_day_of_week: profile.preferred_day_of_week,
          preferred_shift: profile.preferred_shift,
        },
        restaurantName,
        profile.preferred_day_of_week ?? 'viernes',
        profile.preferred_shift ?? 'cena',
      ),
    };
  }
  return null;
}

async function runVoiceCampaign(
  db: SupabaseClient,
  campaign: Campaign,
  members: Array<{ name: string; phone: string }>,
  dryRun: boolean,
) {
  const capped = members.slice(0, MAX_MESSAGES_PER_RUN);

  if (dryRun) {
    return NextResponse.json({
      campaign_id: campaign.id,
      audience_size: members.length,
      messages_generated: 0,
      dry_run: true,
    });
  }

  // Create lightweight guest rows so messages.guest_id can reference a
  // real guest. No visits or profiles are generated — this is a one-shot
  // voice list, not a CDP import.
  const guestPayload = capped.map((m) => ({
    restaurant_id: campaign.restaurant_id,
    name: m.name || 'Guest',
    phone: m.phone,
    email: null,
  }));

  const { data: insertedGuests, error: guestErr } = await db
    .from('guests')
    .insert(guestPayload)
    .select('id, phone');
  if (guestErr) {
    return NextResponse.json({ error: guestErr.message }, { status: 500 });
  }

  const stepId =
    campaign.workflow.find((s) => s.kind === 'make_call')?.id ?? 'call_guest';
  const nowIso = new Date().toISOString();
  const messageRows = (insertedGuests ?? []).map((g, idx) => {
    const member = capped[idx];
    return {
      restaurant_id: campaign.restaurant_id,
      campaign_id: campaign.id,
      workflow_step_id: stepId,
      guest_id: g.id,
      channel: 'call' as const,
      content: `[voice call stub] would call ${member?.name ?? 'guest'} at ${member?.phone ?? g.phone}`,
      status: 'sent' as const,
      sent_at: nowIso,
    };
  });

  if (messageRows.length > 0) {
    const { error: msgErr } = await db.from('messages').insert(messageRows);
    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }
  }

  await db
    .from('campaigns')
    .update({
      status: 'active',
      started_at: nowIso,
      updated_at: nowIso,
      metric_sent: messageRows.length,
    })
    .eq('id', campaign.id);

  return NextResponse.json({
    campaign_id: campaign.id,
    audience_size: members.length,
    messages_generated: messageRows.length,
    capped_at: MAX_MESSAGES_PER_RUN,
    dry_run: false,
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: { dry_run?: boolean } = {};
  try {
    const raw = await req.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const dryRun = body.dry_run === true;

  try {
    const db = getServiceClient();
    const { data: row, error: cErr } = await db
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const campaign = campaignFromRow(row as CampaignRow);
    if (campaign.status === 'completed' || campaign.status === 'archived') {
      return NextResponse.json(
        { error: `campaign is ${campaign.status}` },
        { status: 409 },
      );
    }

    const { data: restaurant } = await db
      .from('restaurants')
      .select('name, avg_ticket')
      .eq('id', campaign.restaurant_id)
      .single();
    if (!restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    // Voice campaigns skip the CDP audience resolution and go straight to
    // the inline members uploaded from the CSV.
    const hasMakeCall = campaign.workflow.some((s) => s.kind === 'make_call');
    const inlineMembers = (campaign.audience_filter as AudienceFilter).members;
    if (hasMakeCall && inlineMembers && inlineMembers.length > 0) {
      return runVoiceCampaign(db, campaign, inlineMembers, dryRun);
    }

    // Materialize audience. For 46k profiles we fetch in pages.
    const allProfiles: Array<GuestProfile & { guest: Guest | null }> = [];
    const PAGE = 1000;
    let from = 0;
    for (;;) {
      const { data, error } = await db
        .from('guest_profiles')
        .select('*, guest:guests(*)')
        .eq('restaurant_id', campaign.restaurant_id)
        .order('id', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allProfiles.push(...(data as Array<GuestProfile & { guest: Guest | null }>));
      if (data.length < PAGE) break;
      from += PAGE;
    }

    const matched = filterProfiles(allProfiles, campaign.audience_filter);
    const audienceSize = matched.length;

    if (dryRun) {
      return NextResponse.json({
        campaign_id: id,
        audience_size: audienceSize,
        messages_generated: 0,
        dry_run: true,
      });
    }

    const step = firstSendStep(campaign);
    if (!step) {
      return NextResponse.json(
        { error: 'campaign workflow has no send_message step' },
        { status: 500 },
      );
    }

    // Cap on how many messages to actually generate per run to protect the
    // Anthropic API bill during demos. Pick the top N by recency × visits.
    const ranked = [...matched].sort((a, b) => {
      const aScore = (a.rfm_frequency ?? 0) + (a.rfm_monetary ?? 0);
      const bScore = (b.rfm_frequency ?? 0) + (b.rfm_monetary ?? 0);
      return bScore - aScore;
    });
    const toGenerate = ranked.slice(0, MAX_MESSAGES_PER_RUN);

    const rows: Array<Record<string, unknown>> = [];
    for (const profile of toGenerate) {
      const guest = profile.guest;
      if (!guest) continue;
      const prompt = buildPromptForStep(step.prompt_key, guest, profile, restaurant.name);
      if (!prompt) continue;
      let content = '';
      try {
        content = await generateMessage(prompt.system, prompt.user);
      } catch (e) {
        content = `[fallback] ${e instanceof Error ? e.message : 'generation failed'}`;
      }
      rows.push({
        restaurant_id: campaign.restaurant_id,
        campaign_id: id,
        workflow_step_id: step.id,
        guest_id: guest.id,
        channel: step.channel,
        content,
        status: 'pending_approval',
        estimated_revenue: Number(restaurant.avg_ticket),
      });
    }

    if (rows.length > 0) {
      const { error } = await db.from('messages').insert(rows);
      if (error) throw error;
    }

    await db
      .from('campaigns')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({
      campaign_id: id,
      audience_size: audienceSize,
      messages_generated: rows.length,
      capped_at: MAX_MESSAGES_PER_RUN,
      dry_run: false,
    });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
