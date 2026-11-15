-- Giveaway relaunch (16 Nov to 13 Dec 2026): new entry window, a campaign marker, and the new form fields.
--
-- NOT APPLIED. Review, then apply yourself (Supabase SQL editor or `supabase db push`), in one transaction,
-- BEFORE the giveaway opens: the site sends area, story_publish_ok and terms_accepted with every new entry,
-- and those inserts fail until these columns exist.
--
-- Replaces the window in 20261009000000_giveaway_close_guard.sql (left as it was; it was never applied).
-- Window mirrors config/promos.ts. Update both together when you relaunch:
--   GIVEAWAY_STARTS_AT = 2026-11-16T00:00:00+00:00
--   GIVEAWAY_ENDS_AT   = 2026-12-13T23:59:00+00:00
--   GIVEAWAY_CAMPAIGN  = giveaway-2026-11
--
-- Existing rows are not updated or deleted. Columns are added without a value for old rows, so entries from the
-- first giveaway (10 Oct to 7 Nov 2026) keep campaign = null and are told apart from new ones by that
-- (and by created_at). The trigger stamps every new entry with the current campaign.

-- 1. New columns. Nullable, so existing rows stay as they are; defaults apply to new rows only.
alter table public.giveaway_entries add column if not exists campaign text;
alter table public.giveaway_entries add column if not exists area text
  check (area is null or char_length(area) <= 60);
alter table public.giveaway_entries add column if not exists story_publish_ok boolean;
alter table public.giveaway_entries add column if not exists terms_accepted boolean;

alter table public.giveaway_entries alter column story_publish_ok set default false;
alter table public.giveaway_entries alter column terms_accepted set default false;

comment on column public.giveaway_entries.campaign is 'Which giveaway the entry belongs to. Null = first giveaway (10 Oct to 7 Nov 2026).';
comment on column public.giveaway_entries.wants_offers is 'Opted in to host tips and offers by email.';
comment on column public.giveaway_entries.story_publish_ok is 'Agreed that Airola may publish an anonymised version of their story. Null = not asked (first giveaway).';
comment on column public.giveaway_entries.terms_accepted is 'Confirmed they read the terms and privacy notice and are 18 or over. Null = not asked (first giveaway).';

-- 2. One entry per person per giveaway (same email, ignoring case).
create unique index if not exists giveaway_entries_one_per_email_per_campaign
  on public.giveaway_entries (campaign, lower(email))
  where campaign is not null;

-- 3. Close guard: reject entries outside the window (database clock, not the visitor's browser), require the
-- terms box and an email, and stamp the campaign so it can't be forged from the browser.
create or replace function public.giveaway_entries_window_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  -- Matches GIVEAWAY_STARTS_AT in config/promos.ts.
  opens_at  timestamptz := '2026-11-16 00:00:00+00';
  -- Matches GIVEAWAY_ENDS_AT in config/promos.ts.
  closes_at timestamptz := '2026-12-13 23:59:00+00';
begin
  if now() < opens_at or now() > closes_at then
    raise exception 'Giveaway entries are closed'
      using errcode = 'P0001';
  end if;
  if new.terms_accepted is distinct from true then
    raise exception 'Entrants must accept the terms and confirm they are 18 or over'
      using errcode = 'P0001';
  end if;
  if coalesce(trim(new.email), '') = '' then
    raise exception 'An email address is required'
      using errcode = 'P0001';
  end if;
  -- Matches GIVEAWAY_CAMPAIGN in config/promos.ts.
  new.campaign := 'giveaway-2026-11';
  return new;
end;
$$;

drop trigger if exists giveaway_entries_window_guard on public.giveaway_entries;

create trigger giveaway_entries_window_guard
  before insert on public.giveaway_entries
  for each row
  execute function public.giveaway_entries_window_guard();
