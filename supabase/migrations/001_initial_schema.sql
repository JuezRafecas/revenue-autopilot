-- Revenue Autopilot — initial schema
-- Run this in your Supabase SQL editor, or via `supabase db push` if the CLI is linked.

create extension if not exists "pgcrypto";

-- Restaurantes (preparado para multi-tenant aunque la demo usa uno solo)
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  avg_ticket decimal(10,2) default 45000.00,
  currency text default 'ARS',
  created_at timestamptz default now()
);

-- Comensales
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

create index if not exists idx_guests_restaurant on guests(restaurant_id);

-- Visitas (la tabla core — cada fila es un touchpoint)
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,
  visit_date timestamptz not null,
  party_size int default 2,
  amount decimal(10,2),
  shift text,
  day_of_week text,
  sector text,
  visit_type text default 'reservation',
  outcome text default 'completed',
  score decimal(3,1),
  review_comment text,
  created_at timestamptz default now()
);

create index if not exists idx_visits_guest on visits(guest_id);
create index if not exists idx_visits_restaurant on visits(restaurant_id);
create index if not exists idx_visits_date on visits(visit_date);

-- Perfiles calculados (los llena el motor de segmentación durante el hackathon)
create table if not exists guest_profiles (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid unique references guests(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,

  total_visits int default 0,
  total_no_shows int default 0,
  total_cancellations int default 0,
  first_visit_at timestamptz,
  last_visit_at timestamptz,
  days_since_last int,
  avg_days_between_visits decimal(10,2),
  avg_party_size decimal(5,2),
  avg_amount decimal(10,2),
  total_spent decimal(12,2),
  avg_score decimal(3,1),

  preferred_shift text,
  preferred_day_of_week text,
  preferred_sector text,

  rfm_recency int,
  rfm_frequency int,
  rfm_monetary int,
  rfm_score text,

  segment text not null,

  calculated_at timestamptz default now()
);

create index if not exists idx_profiles_segment on guest_profiles(segment);
create index if not exists idx_profiles_restaurant on guest_profiles(restaurant_id);

-- Acciones ejecutadas
create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  action_type text not null,
  message text not null,
  channel text default 'whatsapp',
  status text default 'pending',
  estimated_revenue decimal(10,2),
  created_at timestamptz default now(),
  sent_at timestamptz,
  converted_at timestamptz
);

create index if not exists idx_actions_restaurant on actions(restaurant_id);
create index if not exists idx_actions_type on actions(action_type);
create index if not exists idx_actions_status on actions(status);
