-- eXperience Padel MVP schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create extension if not exists pgcrypto;

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  venue_name text not null default 'Padel Center',
  whatsapp_phone text not null default '',
  price_per_player numeric not null default 2200,
  price_full_court numeric not null default 8000,
  open_hour int not null default 8,
  close_hour int not null default 23
);

create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  date date not null,
  time text not null,
  players int not null,
  status text not null check (status in ('reservado', 'confirmado', 'cancelado')),
  customer_name text,
  created_via text not null check (created_via in ('user', 'admin')),
  price_total numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  total numeric not null,
  payment_method text not null check (payment_method in ('efectivo', 'transferencia', 'mixto')),
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id),
  qty int not null,
  unit_price numeric not null
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  description text not null default '',
  image_url text
);

create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null default '',
  title text not null,
  subtitle text not null default '',
  "order" int not null default 0
);

-- Row level security: everyone can read; only logged-in admins can write,
-- except the public booking flow is allowed to insert its own reservation.
alter table settings enable row level security;
alter table courts enable row level security;
alter table reservations enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table tournaments enable row level security;
alter table hero_slides enable row level security;

create policy "public read settings" on settings for select using (true);
create policy "admin write settings" on settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read courts" on courts for select using (true);
create policy "admin write courts" on courts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read reservations" on reservations for select using (true);
create policy "public create reservations" on reservations for insert with check (true);
create policy "admin update reservations" on reservations for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin delete reservations" on reservations for delete
  using (auth.role() = 'authenticated');

create policy "public read products" on products for select using (true);
create policy "admin write products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read sales" on sales for select using (true);
create policy "admin write sales" on sales for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read sale_items" on sale_items for select using (true);
create policy "admin write sale_items" on sale_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read tournaments" on tournaments for select using (true);
create policy "admin write tournaments" on tournaments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read hero_slides" on hero_slides for select using (true);
create policy "admin write hero_slides" on hero_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed: structural minimum so the app isn't empty on first load.
-- Real reservations/sales/tournaments accumulate from actual use.
insert into settings (venue_name, whatsapp_phone, price_per_player, price_full_court, open_hour, close_hour)
values ('Padel Center', '5491122334455', 2200, 8000, 8, 23);

insert into courts (name) values ('Cancha 1'), ('Cancha 2'), ('Cancha 3'), ('Cancha 4');

insert into products (name, price) values
  ('Agua mineral', 1500),
  ('Gatorade', 2000),
  ('Grip Wilson', 2500),
  ('Overgrip Pro', 1800);

insert into hero_slides (image_url, title, subtitle, "order") values
  ('', 'Tu mejor partido empieza aca', 'Reserva tu turno facil y rapido', 0);

-- After running this: create one admin user under
-- Authentication -> Users -> Add user (email + password). That is the
-- login for /admin — there is no public sign-up in the app.
