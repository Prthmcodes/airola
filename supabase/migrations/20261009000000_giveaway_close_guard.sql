-- Giveaway close guard: reject giveaway entries outside the entry window, using the database clock
-- instead of the visitor's browser clock.
--
-- NOT APPLIED. Review, then apply yourself (Supabase SQL editor or `supabase db push`).
--
-- Window mirrors config/promos.ts. Update both together when you relaunch:
--   GIVEAWAY_STARTS_AT = 2026-10-10T00:00:00+01:00
--   GIVEAWAY_ENDS_AT   = 2026-11-07T23:59:00+00:00
--
-- With the values below, inserts are accepted only from 10 Oct 2026 00:00 to 7 Nov 2026 23:59 UK time,
-- which matches isGiveawayOpen() on the site.

create or replace function public.giveaway_entries_window_guard()
returns trigger
language plpgsql
as $$
declare
  -- Matches GIVEAWAY_STARTS_AT in config/promos.ts.
  opens_at  timestamptz := '2026-10-10 00:00:00+01';
  -- Matches GIVEAWAY_ENDS_AT in config/promos.ts.
  closes_at timestamptz := '2026-11-07 23:59:00+00';
begin
  if now() < opens_at or now() > closes_at then
    raise exception 'Giveaway entries are closed'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists giveaway_entries_window_guard on public.giveaway_entries;

create trigger giveaway_entries_window_guard
  before insert on public.giveaway_entries
  for each row
  execute function public.giveaway_entries_window_guard();
