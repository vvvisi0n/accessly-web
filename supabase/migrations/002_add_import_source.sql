-- ============================================================
-- Migration 002: add import_source to venues
-- Tracks whether a venue listing was imported from an external
-- source ('osm', 'google_places') or created organically (null).
-- Safe to run multiple times (IF NOT EXISTS guards).
-- ============================================================

alter table public.venues
  add column if not exists import_source text
  check (import_source in ('osm', 'google_places'));

-- Partial unique index so we can upsert OSM records by osm_id
-- without constraining the many rows where osm_id is null.
create unique index if not exists venues_osm_id_key
  on public.venues(osm_id)
  where osm_id is not null;

comment on column public.venues.import_source is
  'Source of the venue listing: osm, google_places, or null for user-submitted venues.';
