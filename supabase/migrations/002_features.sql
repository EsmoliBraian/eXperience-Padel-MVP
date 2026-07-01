-- eXperience Padel MVP: publish toggles, product descriptions, split payments,
-- linked turno on sales, debtors, slide image storage.
-- Run this once in the Supabase SQL Editor (after schema.sql).

alter table products add column if not exists description text not null default '';
alter table hero_slides add column if not exists published boolean not null default true;
alter table tournaments add column if not exists published boolean not null default true;
alter table sales add column if not exists reservation_id uuid references reservations(id) on delete set null;

create table if not exists sale_payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  method text not null check (method in ('efectivo', 'transferencia')),
  amount numeric not null
);

create table if not exists debtors (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  amount numeric not null,
  detail text not null default '',
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table sale_payments enable row level security;
alter table debtors enable row level security;

create policy "public read sale_payments" on sale_payments for select using (true);
create policy "admin write sale_payments" on sale_payments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read debtors" on debtors for select using (true);
create policy "admin write debtors" on debtors for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for hero slide images, uploaded from the admin panel.
insert into storage.buckets (id, name, public)
values ('slides', 'slides', true)
on conflict (id) do nothing;

create policy "public read slide images" on storage.objects for select
  using (bucket_id = 'slides');
create policy "admin write slide images" on storage.objects for all
  using (bucket_id = 'slides' and auth.role() = 'authenticated')
  with check (bucket_id = 'slides' and auth.role() = 'authenticated');
