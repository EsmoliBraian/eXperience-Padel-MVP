-- eXperience Padel MVP: turnos fijos (weekly recurring holds).
-- Run after 001-011.

create table if not exists fixed_slots (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references settings(id) on delete cascade,
  court_id uuid not null references courts(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  time text not null,
  customer_name text not null default '',
  created_at timestamptz not null default now()
);

alter table fixed_slots enable row level security;

create policy "public read fixed_slots" on fixed_slots for select using (true);
create policy "owner write fixed_slots" on fixed_slots for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());
