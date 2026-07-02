-- eXperience Padel MVP: realtime availability, flat per-turno pricing,
-- configurable slot duration, closed days.
-- Run this once in the Supabase SQL Editor (after 001/002/003).

-- Enable Realtime for reservations so every connected client (public
-- booking page and admin dashboard) sees new/updated reservations live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reservations'
  ) then
    alter publication supabase_realtime add table public.reservations;
  end if;
end $$;

alter table settings add column if not exists default_price numeric not null default 8000;
alter table settings add column if not exists slot_duration_minutes int not null default 60;
alter table settings drop column if exists price_per_player;
alter table settings drop column if exists price_full_court;

alter table courts add column if not exists price numeric;

create table if not exists closed_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text
);

alter table closed_dates enable row level security;

create policy "public read closed_dates" on closed_dates for select using (true);
create policy "admin write closed_dates" on closed_dates for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
