-- ============================================================
-- Accessana — initial schema
-- Apply via: Supabase dashboard > SQL Editor > run this file
-- Or: supabase db push (once CLI is configured)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ── Enums ───────────────────────────────────────────────────
create type disability_type as enum (
  'mobility', 'vision', 'hearing', 'cognitive', 'sensory', 'other'
);

create type venue_category as enum (
  'restaurant', 'hotel', 'lounge', 'bar', 'cafe',
  'hospital', 'clinic', 'pharmacy', 'transit_stop', 'train_station',
  'airport', 'park', 'museum', 'theatre', 'cinema', 'gym', 'shopping',
  'government', 'education', 'place_of_worship', 'other'
);

create type subscription_plan as enum ('free', 'pro', 'enterprise');

create type civic_status as enum ('open', 'in_progress', 'resolved', 'closed');

create type civic_report_type as enum (
  'broken_sidewalk', 'missing_curb_cut', 'blocked_ramp',
  'broken_elevator', 'inaccessible_crossing', 'missing_signage',
  'inaccessible_parking', 'other'
);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Tables ───────────────────────────────────────────────────

-- USERS (extends auth.users)
create table public.users (
  id                uuid references auth.users(id) on delete cascade primary key,
  display_name      text,
  avatar_url        text,
  disability_types  disability_type[] default '{}',
  preferred_language text default 'en',
  reputation_score  integer default 0,
  review_count      integer default 0,
  saved_venues      uuid[] default '{}',
  plan              subscription_plan default 'free',
  stripe_customer_id text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- VENUES
create table public.venues (
  id                uuid default uuid_generate_v4() primary key,
  name              text not null,
  category          venue_category not null,
  address           text,
  city              text,
  state             text,
  country           text default 'US',
  location          geography(point, 4326),
  phone             text,
  website           text,
  google_place_id   text unique,
  osm_id            text,
  access_index      numeric(4,1),
  score_entrance    numeric(4,1),
  score_bathrooms   numeric(4,1),
  score_parking     numeric(4,1),
  score_staff       numeric(4,1),
  score_sensory     numeric(4,1),
  review_count      integer default 0,
  claimed           boolean default false,
  claimed_by        uuid references public.users(id),
  verified          boolean default false,
  certified         boolean default false,
  photos            text[] default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index venues_location_idx  on public.venues using gist(location);
create index venues_city_idx      on public.venues(city);
create index venues_category_idx  on public.venues(category);

create trigger venues_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

-- REVIEWS
create table public.reviews (
  id                uuid default uuid_generate_v4() primary key,
  venue_id          uuid references public.venues(id) on delete cascade not null,
  user_id           uuid references public.users(id)  on delete cascade not null,
  disability_types  disability_type[] not null default '{}',
  score_entrance    integer check (score_entrance between 1 and 5),
  score_bathrooms   integer check (score_bathrooms between 1 and 5),
  score_parking     integer check (score_parking between 1 and 5),
  score_staff       integer check (score_staff between 1 and 5),
  score_sensory     integer check (score_sensory between 1 and 5),
  note_entrance     text,
  note_bathrooms    text,
  note_parking      text,
  note_staff        text,
  note_sensory      text,
  photos_entrance   text[] default '{}',
  photos_bathrooms  text[] default '{}',
  photos_parking    text[] default '{}',
  photos_staff      text[] default '{}',
  photos_sensory    text[] default '{}',
  overall_comment   text,
  visit_date        date,
  helpful_count     integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (venue_id, user_id, visit_date)
);

create index reviews_venue_id_idx  on public.reviews(venue_id);
create index reviews_user_id_idx   on public.reviews(user_id);
create index reviews_created_at_idx on public.reviews(created_at desc);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- VENUE CHANGE REPORTS
create table public.venue_change_reports (
  id          uuid default uuid_generate_v4() primary key,
  venue_id    uuid references public.venues(id) on delete cascade not null,
  user_id     uuid references public.users(id)  on delete cascade not null,
  description text not null,
  change_type text,
  resolved    boolean default false,
  created_at  timestamptz default now()
);

create index venue_change_reports_venue_id_idx on public.venue_change_reports(venue_id);

-- BUSINESSES
create table public.businesses (
  id                     uuid default uuid_generate_v4() primary key,
  owner_id               uuid references public.users(id) not null,
  name                   text not null,
  venue_ids              uuid[] default '{}',
  plan                   subscription_plan default 'free',
  stripe_customer_id     text,
  stripe_subscription_id text,
  risk_score             numeric(4,1),
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- CIVIC REPORTS
create table public.civic_reports (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.users(id) on delete cascade not null,
  report_type         civic_report_type not null,
  description         text not null,
  location            geography(point, 4326) not null,
  address             text,
  city                text,
  state               text,
  photos              text[] default '{}',
  status              civic_status default 'open',
  upvote_count        integer default 0,
  seeclickfix_id      text,
  doj_reference       text,
  city_311_reference  text,
  resolved_at         timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index civic_reports_location_idx on public.civic_reports using gist(location);
create index civic_reports_status_idx   on public.civic_reports(status);
create index civic_reports_city_idx     on public.civic_reports(city);

create trigger civic_reports_updated_at
  before update on public.civic_reports
  for each row execute function public.set_updated_at();

-- CITIES
create table public.cities (
  id                   uuid default uuid_generate_v4() primary key,
  name                 text not null,
  state                text,
  country              text default 'US',
  access_index         numeric(4,1),
  open_reports         integer default 0,
  resolved_reports     integer default 0,
  avg_response_days    numeric(5,1),
  seeclickfix_area_id  text,
  api_311_endpoint     text,
  plan                 subscription_plan default 'free',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create trigger cities_updated_at
  before update on public.cities
  for each row execute function public.set_updated_at();

-- OUTINGS
create table public.outings (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.users(id) on delete cascade not null,
  title       text not null,
  venue_ids   uuid[] not null default '{}',
  venue_order integer[] default '{}',
  notes       text,
  is_public   boolean default false,
  created_at  timestamptz default now()
);

create index outings_user_id_idx on public.outings(user_id);

-- ── Row Level Security ───────────────────────────────────────
alter table public.users               enable row level security;
alter table public.venues              enable row level security;
alter table public.reviews             enable row level security;
alter table public.venue_change_reports enable row level security;
alter table public.businesses          enable row level security;
alter table public.civic_reports       enable row level security;
alter table public.cities              enable row level security;
alter table public.outings             enable row level security;

-- Users
create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Venues
create policy "Venues are publicly readable"
  on public.venues for select using (true);
create policy "Authenticated users can suggest venues"
  on public.venues for insert with check (auth.uid() is not null);
create policy "Claimed owners can update their venues"
  on public.venues for update using (auth.uid() = claimed_by);

-- Reviews
create policy "Reviews are publicly readable"
  on public.reviews for select using (true);
create policy "Users can write own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews"
  on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- Venue change reports
create policy "Venue change reports are publicly readable"
  on public.venue_change_reports for select using (true);
create policy "Authenticated users can submit change reports"
  on public.venue_change_reports for insert with check (auth.uid() = user_id);

-- Businesses
create policy "Business owners can manage their business"
  on public.businesses for all using (auth.uid() = owner_id);

-- Civic reports
create policy "Civic reports are publicly readable"
  on public.civic_reports for select using (true);
create policy "Authenticated users can submit civic reports"
  on public.civic_reports for insert with check (auth.uid() = user_id);
create policy "Users can update own civic reports"
  on public.civic_reports for update using (auth.uid() = user_id);

-- Cities
create policy "Cities are publicly readable"
  on public.cities for select using (true);

-- Outings
create policy "Users can read own or public outings"
  on public.outings for select using (auth.uid() = user_id or is_public = true);
create policy "Users can manage own outings"
  on public.outings for all using (auth.uid() = user_id);

-- ── Helper RPCs for atomic counter increments ────────────────────────────
-- Called from the reviews API route after a new review is inserted.

create or replace function public.increment_venue_review_count(venue_id uuid)
returns void as $$
  update public.venues
  set review_count = review_count + 1
  where id = venue_id;
$$ language sql security definer;

create or replace function public.increment_user_review_count(user_id uuid)
returns void as $$
  update public.users
  set review_count = review_count + 1
  where id = user_id;
$$ language sql security definer;
