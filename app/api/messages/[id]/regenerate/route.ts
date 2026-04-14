import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { generateMessage } from '@/lib/claude';
import {
  SYSTEM_PROMPTS,
  buildReactivationPrompt,
  buildSecondVisitPrompt,
  buildPostVisitPrompt,
  buildFillTablesPrompt,
} from '@/lib/prompts';
import type { Campaign, Guest, GuestProfile, SendMessageStep } from '@/lib/types';

export const maxDuration = 60;

function findSendStep(workflow: unknown, stepId: string | null): SendMessageStep | null {
  if (!Array.isArray(workflow)) return null;
  for (const step of workflow as SendMessageStep[]) {
    if (step.kind === 'send_message' && (!stepId || step.id === stepId)) return step;
  }
  // Fallback: return first send step.
  for (const step of workflow as SendMessageStep[]) {
    if (step.kind === 'send_message') return step;
  }
  return null;
}

function buildPrompt(
  promptKey: string,
  guest: Guest,
  profile: GuestProfile,
  restaurantName: string,
  hint?: string,
): { system: string; user: string } | null {
  let built: { system: string; user: string } | null = null;
  if (promptKey === 'reactivation') {
    built = {
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
  } else if (promptKey === 'second_visit') {
    built = {
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
  } else if (promptKey === 'post_visit') {
    built = {
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
  } else if (promptKey === 'fill_tables') {
    built = {
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
  if (built && hint) built.user += `\n\nPista adicional: ${hint}`;
  return built;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let hint: string | undefined;
  try {
    const raw = await req.text();
    if (raw) hint = (JSON.parse(raw) as { hint?: string }).hint;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  try {
    const db = getServiceClient();
    const { data: msg } = await db
      .from('messages')
      .select(
        '*, guest:guests(*), campaign:campaigns(id, name, workflow, restaurant_id)',
      )
      .eq('id', id)
      .maybeSingle();
    if (!msg) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (msg.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `cannot regenerate message in status ${msg.status}` },
        { status: 409 },
      );
    }
    const guest = msg.guest as Guest | null;
    const campaign = msg.campaign as
      | (Pick<Campaign, 'id' | 'name' | 'workflow' | 'restaurant_id'> & { workflow: unknown })
      | null;
    if (!guest || !campaign) {
      return NextResponse.json({ error: 'missing guest or campaign' }, { status: 500 });
    }
    const step = findSendStep(campaign.workflow, msg.workflow_step_id);
    if (!step) {
      return NextResponse.json({ error: 'no send_message step found' }, { status: 500 });
    }

    const { data: profile } = await db
      .from('guest_profiles')
      .select('*')
      .eq('guest_id', guest.id)
      .maybeSingle();
    if (!profile) return NextResponse.json({ error: 'profile not found' }, { status: 500 });

    const { data: restaurant } = await db
      .from('restaurants')
      .select('name')
      .eq('id', campaign.restaurant_id)
      .single();
    if (!restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    const prompt = buildPrompt(
      step.prompt_key,
      guest,
      profile as GuestProfile,
      restaurant.name,
      hint,
    );
    if (!prompt) {
      return NextResponse.json(
        { error: `no prompt builder for key ${step.prompt_key}` },
        { status: 500 },
      );
    }

    const content = await generateMessage(prompt.system, prompt.user);
    const { error: updErr } = await db.from('messages').update({ content }).eq('id', id);
    if (updErr) throw updErr;

    return NextResponse.json({ id, content });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
