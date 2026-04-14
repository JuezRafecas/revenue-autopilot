-- Nomi - Guest Autopilot — campaigns / templates / messages / events / attributions
-- Run after 001_initial_schema.sql.

create extension if not exists "pgcrypto";

-- Extend guests with channel opt-ins
alter table guests add column if not exists opt_in_whatsapp boolean default true;
alter table guests add column if not exists opt_in_email boolean default true;

-- Extend guest_profiles with tier (VIP / frequent / occasional)
alter table guest_profiles add column if not exists tier text;

-- Extend restaurants with timezone
alter table restaurants add column if not exists timezone text default 'America/Argentina/Buenos_Aires';

-- ---------- Campaign templates (seeded) -----------------------------------
create table if not exists campaign_templates (
  key text primary key,
  type text not null check (type in ('automation', 'one_shot')),
  name text not null,
  description text not null,
  headline text not null,
  accent text not null,
  default_audience jsonb not null,
  default_trigger jsonb not null,
  workflow jsonb not null,
  kpi_labels jsonb not null,
  created_at timestamptz default now()
);

-- ---------- Campaigns -----------------------------------------------------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  template_key text references campaign_templates(key) on delete set null,
  type text not null check (type in ('automation', 'one_shot')),
  name text not null,
  description text,
  status text not null default 'draft' check (
    status in ('draft', 'scheduled', 'active', 'paused', 'completed', 'archived')
  ),
  audience_filter jsonb not null default '{}'::jsonb,
  trigger_config jsonb not null,
  workflow jsonb not null default '[]'::jsonb,
  channels text[] not null default array['whatsapp']::text[],

  -- denormalized metrics (updated as messages move through the pipeline)
  metric_sent int default 0,
  metric_delivered int default 0,
  metric_read int default 0,
  metric_responded int default 0,
  metric_converted int default 0,
  metric_failed int default 0,
  metric_revenue_attributed decimal(12, 2) default 0,
  estimated_revenue decimal(12, 2),

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_campaigns_restaurant on campaigns(restaurant_id);
create index if not exists idx_campaigns_status on campaigns(status);
create index if not exists idx_campaigns_template on campaigns(template_key);

-- ---------- Messages (each individual send) ------------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  campaign_id uuid references campaigns(id) on delete set null,
  workflow_step_id text,
  guest_id uuid references guests(id) on delete cascade not null,
  channel text not null check (channel in ('whatsapp', 'email', 'whatsapp_then_email')),
  content text not null,
  status text not null default 'pending_approval' check (
    status in (
      'pending_approval', 'approved', 'queued', 'sent',
      'delivered', 'read', 'responded', 'converted', 'failed', 'skipped'
    )
  ),
  response_type text check (response_type in ('positive', 'negative', 'no_response')),
  response_content text,

  created_at timestamptz default now(),
  approved_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  responded_at timestamptz,
  converted_at timestamptz,
  failed_at timestamptz,
  error_message text,

  estimated_revenue decimal(10, 2),
  realized_revenue decimal(10, 2)
);

create index if not exists idx_messages_restaurant on messages(restaurant_id);
create index if not exists idx_messages_campaign on messages(campaign_id);
create index if not exists idx_messages_guest on messages(guest_id);
create index if not exists idx_messages_status on messages(status);
create index if not exists idx_messages_created on messages(created_at desc);

-- ---------- Event queue (triggers for automations) ----------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  event_type text not null,
  guest_id uuid references guests(id) on delete set null,
  visit_id uuid references visits(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_events_restaurant on events(restaurant_id);
create index if not exists idx_events_unprocessed on events(processed_at) where processed_at is null;
create index if not exists idx_events_type on events(event_type);

-- ---------- Attributions (revenue linked to a specific message) --------
create table if not exists attributions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  message_id uuid references messages(id) on delete cascade not null,
  guest_id uuid references guests(id) on delete cascade not null,
  visit_id uuid references visits(id) on delete set null,
  amount decimal(10, 2) not null,
  attribution_window_days int not null default 14,
  attributed_at timestamptz default now()
);

create index if not exists idx_attributions_campaign on attributions(campaign_id);
create index if not exists idx_attributions_message on attributions(message_id);
create index if not exists idx_attributions_guest on attributions(guest_id);
