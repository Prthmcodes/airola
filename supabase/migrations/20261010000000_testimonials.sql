-- Testimonials: hosts submit a star rating and review; nothing is public until an admin approves it.
-- APPLIED to production on 2026-10-10 (Supabase SQL editor, in one transaction). Run the security advisor after any change.

create table public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  display_name text not null check (char_length(display_name) between 2 and 40),
  area         text check (area is null or char_length(area) <= 40),
  rating       smallint not null check (rating between 1 and 5),
  body         text not null check (char_length(body) between 20 and 600),
  email        text not null,                       -- private: never exposed to the browser
  consent      boolean not null check (consent = true),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified     boolean not null default false,
  admin_note   text
);

-- One review per email per (UTC) day. date_trunc on a timestamptz isn't immutable,
-- so the day is taken in UTC to make it indexable.
create unique index testimonials_one_per_email_per_day
  on public.testimonials (lower(email), date_trunc('day', created_at at time zone 'UTC'));

create index testimonials_status_created_at on public.testimonials (status, created_at desc);

alter table public.testimonials enable row level security;

-- Column privileges: the browser can only ever write the form fields. id, created_at, status,
-- verified and admin_note always take their defaults, so they can't be forged.
-- Admins can change status, verified and admin_note, but never the review text.
revoke all on public.testimonials from anon, authenticated;
grant insert (display_name, area, rating, body, email, consent) on public.testimonials to anon, authenticated;
grant select, delete on public.testimonials to authenticated;
grant update (status, verified, admin_note) on public.testimonials to authenticated;

-- (1) Anyone can submit, only as a pending, unverified review with no admin note.
create policy "Anyone can submit a pending testimonial"
  on public.testimonials for insert
  to anon, authenticated
  with check (status = 'pending' and verified = false and admin_note is null);

-- (2) No SELECT policy for anon: the table itself is never readable without admin rights.
-- (3) Admins (same check as the other tables) can read, moderate and delete everything.
create policy "Admins can read testimonials"
  on public.testimonials for select
  to authenticated
  using (public.is_admin());

create policy "Admins can moderate testimonials"
  on public.testimonials for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete testimonials"
  on public.testimonials for delete
  to authenticated
  using (public.is_admin());

-- Public read model: approved reviews only, without email, status or admin notes.
-- security_invoker = false means the view reads the table with its owner's rights (bypassing RLS),
-- which is why it filters on status and lists safe columns explicitly.
create view public.testimonials_public
  with (security_invoker = false)
as
  select id, created_at, display_name, area, rating, body, verified
  from public.testimonials
  where status = 'approved';

-- Views over one table are auto-updatable, and Supabase grants ALL on new objects by default:
-- strip that so the view can only be read.
revoke all on public.testimonials_public from anon, authenticated;
grant select on public.testimonials_public to anon, authenticated;
