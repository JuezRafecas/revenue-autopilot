import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import { campaignFromTemplate, voiceCampaignDraft } from '@/lib/campaigns';
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
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return createVoiceCampaignFromFormData(req);
  }

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

// ----------------------------------------------------------------------------
// Voice campaign creation from multipart form data (CSV audience + schedule).
// ----------------------------------------------------------------------------

interface VoiceCsvRow {
  name?: string;
  phone?: string;
}

async function createVoiceCampaignFromFormData(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid multipart body' }, { status: 400 });
  }

  const name = (form.get('name') ?? '').toString().trim();
  const scheduleAt = (form.get('schedule_at') ?? '').toString().trim();
  const file = form.get('file');

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!scheduleAt || Number.isNaN(Date.parse(scheduleAt))) {
    return NextResponse.json({ error: 'schedule_at must be a valid ISO datetime' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'file exceeds 50 MB limit' }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<VoiceCsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: 'CSV parse failed', details: parsed.errors.slice(0, 3) },
      { status: 400 },
    );
  }

  const members = parsed.data
    .map((row) => ({
      name: (row.name ?? '').toString().trim(),
      phone: (row.phone ?? '').toString().trim(),
    }))
    .filter((m) => m.phone.length > 0);

  if (members.length === 0) {
    return NextResponse.json(
      { error: 'CSV must have at least one row with a phone column' },
      { status: 400 },
    );
  }

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

    const draft = voiceCampaignDraft(restaurant.id, {
      name,
      scheduleAt: new Date(scheduleAt).toISOString(),
      members,
    });
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
    return NextResponse.json(
      { campaign: campaignFromRow(data as CampaignRow) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
