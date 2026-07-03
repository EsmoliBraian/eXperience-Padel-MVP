-- eXperience Padel MVP: ranking feature.
-- Run after 001-008. No placeholders to fill in this time.

create table if not exists ranking_categories (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references settings(id) on delete cascade,
  name text not null,
  unique (venue_id, name)
);

create table if not exists ranking_points (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references settings(id) on delete cascade,
  instance text not null check (
    instance in ('fase_grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semis', 'finalista', 'campeon')
  ),
  points numeric not null default 0,
  unique (venue_id, instance)
);

create table if not exists ranking_entries (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references settings(id) on delete cascade,
  category_id uuid not null references ranking_categories(id) on delete cascade,
  player_name text not null,
  total_points numeric not null default 0,
  best_instance text not null check (
    best_instance in ('fase_grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semis', 'finalista', 'campeon')
  ),
  unique (venue_id, category_id, player_name)
);

alter table ranking_categories enable row level security;
alter table ranking_points enable row level security;
alter table ranking_entries enable row level security;

create policy "public read ranking_categories" on ranking_categories for select using (true);
create policy "owner write ranking_categories" on ranking_categories for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

create policy "public read ranking_points" on ranking_points for select using (true);
create policy "owner write ranking_points" on ranking_points for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

create policy "public read ranking_entries" on ranking_entries for select using (true);
create policy "owner write ranking_entries" on ranking_entries for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());
