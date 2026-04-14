import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import { campaignFromTemplate } from '@/lib/campaigns';
import { campaignFromRow, campaignInsertPayload, type CampaignRow } from '@/lib/campaigns-db';
import type {
  AudienceFilter,
  CampaignStatus,
  CampaignTrigger,
  TemplateKey,
} from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as CampaignStatus | null;
  const templateKey = url.searchParams.get('template_key') as TemplateKey | null;

  try {
    const db = getServiceClient();
    const { data: restaurant } = await db
      .from('restaurants')
      .select('id')
      .eq('slug', DEFAULT_RESTAURANT.slug)
      .maybeSingle();
    if (!restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    let query = db
      .from('campaigns')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('updated_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (templateKey) query = query.eq('template_key', templateKey);

    const { data, error } = await query;
    if (error) throw error;
    const campaigns = (data as CampaignRow[] | null)?.map(campaignFromRow) ?? [];
    return NextResponse.json({ campaigns });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface CreatePayload {
  template_key: TemplateKey;
  name?: string;
  audience_overrides?: Partial<AudienceFilter>;
  trigger_overrides?: Partial<CampaignTrigger>;
  restaurant_id?: string;
}

export async function POST(req: Request) {
  let body: CreatePayload;
  try {
    body = (await req.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  if (!body.template_key) {
    return NextResponse.json({ error: 'template_key is required' }, { status: 400 });
  }

  try {
    const db = getServiceClient();
    const { data: restaurant } = body.restaurant_id
      ? await db
          .from('restaurants')
          .select('id')
          .eq('id', body.restaurant_id)
          .maybeSingle()
      : await db
          .from('restaurants')
          .select('id')
          .eq('slug', DEFAULT_RESTAURANT.slug)
          .maybeSingle();
    if (!restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    const draft = campaignFromTemplate(body.template_key, restaurant.id, {
      name: body.name,
    });
    if (body.audience_overrides) {
      draft.audience_filter = { ...draft.audience_filter, ...body.audience_overrides };
    }
    if (body.trigger_overrides) {
      draft.trigger = { ...draft.trigger, ...body.trigger_overrides } as CampaignTrigger;
    }

    const payload = campaignInsertPayload(draft);
    const { data, error } = await db
      .from('campaigns')
      .insert(payload)
      .select('*')
      .single();
    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: 'insert returned no row' }, { status: 500 });
    }
    return NextResponse.json({ campaign: campaignFromRow(data as CampaignRow) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
