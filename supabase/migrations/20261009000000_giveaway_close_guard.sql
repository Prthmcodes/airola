-- Giveaway close guard: reject giveaway entries outside the entry window, using the database clock
-- instead of the visitor's browser clock.
--
-- NOT APPLIED. Review, then apply yourself (Supabase SQL editor or `supabase db push`).
--
-- Window mirrors config/promos.ts. Update both together when you relaunch:
--   GIVEAWAY_OPEN = false
--   GIVEAWAY_CLOSES_AT = 2026-08-15T23:59:59+01:00
-- [CONFIRM: opening date and time of the next giveaway]
-- [CONFIRM: closing date and time of the next giveaway]
--
-- With the values below (closes 15 Aug 2026, already past), every new insert is rejected,
-- which matches GIVEAWAY_OPEN = false on the site.

create or replace function public.giveaway_entries_window_guard()
returns trigger
language plpgsql
as $$
declare
  -- [CONFIRM: opening time] Placeholder: no lower bound until a real opening time is set.
  opens_at  timestamptz := '-infinity';
  -- [CONFIRM: closing time] Matches GIVEAWAY_CLOSES_AT in config/promos.ts.
  closes_at timestamptz := '2026-08-15 23:59:59+01';
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
