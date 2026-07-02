-- eXperience Padel MVP: multi-tenant conversion.
-- Run after 001-007.

alter table settings add column if not exists owner_id uuid references auth.users(id);
alter table settings add column if not exists slug text unique;
alter table settings add column if not exists logo_url text;

alter table courts add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table reservations add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table products add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table sales add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table sale_items add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table sale_payments add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table tournaments add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table hero_slides add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table closed_dates add column if not exists venue_id uuid references settings(id) on delete cascade;
alter table categories add column if not exists venue_id uuid references settings(id) on delete cascade;

-- === Backfill: turn the current single tenant into venue #1. ===
update settings
set owner_id = 'ab9d3c0d-a183-46f3-9d3e-c0d83b958986',
    slug = 'ventana-padel'
where owner_id is null;

update courts set venue_id = (select id from settings limit 1) where venue_id is null;
update reservations set venue_id = (select id from settings limit 1) where venue_id is null;
update products set venue_id = (select id from settings limit 1) where venue_id is null;
update sales set venue_id = (select id from settings limit 1) where venue_id is null;
update sale_items set venue_id = (select id from settings limit 1) where venue_id is null;
update sale_payments set venue_id = (select id from settings limit 1) where venue_id is null;
update tournaments set venue_id = (select id from settings limit 1) where venue_id is null;
update hero_slides set venue_id = (select id from settings limit 1) where venue_id is null;
update closed_dates set venue_id = (select id from settings limit 1) where venue_id is null;
update categories set venue_id = (select id from settings limit 1) where venue_id is null;

alter table courts alter column venue_id set not null;
alter table reservations alter column venue_id set not null;
alter table products alter column venue_id set not null;
alter table sales alter column venue_id set not null;
alter table sale_items alter column venue_id set not null;
alter table sale_payments alter column venue_id set not null;
alter table tournaments alter column venue_id set not null;
alter table hero_slides alter column venue_id set not null;
alter table closed_dates alter column venue_id set not null;
alter table categories alter column venue_id set not null;

-- === The single source of truth every write policy checks against. ===
create or replace function get_my_venue_id()
returns uuid
language sql
security definer
stable
as $$
  select id from settings where owner_id = auth.uid() limit 1;
$$;

-- === settings: select stays public (needed to resolve a venue by slug
-- from the public site), write is owner-only, insert is what makes
-- self-serve signup work (a fresh user can create exactly one venue). ===
drop policy if exists "admin write settings" on settings;
create policy "owner update settings" on settings for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner delete settings" on settings for delete
  using (owner_id = auth.uid());
create policy "owner insert settings" on settings for insert
  with check (owner_id = auth.uid());

-- === Every other admin-write policy: was "any logged-in admin", now
-- "only this venue's owner". ===
drop policy if exists "admin write courts" on courts;
create policy "owner write courts" on courts for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "admin update reservations" on reservations;
create policy "owner update reservations" on reservations for update
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());
drop policy if exists "admin delete reservations" on reservations;
create policy "owner delete reservations" on reservations for delete
  using (venue_id = get_my_venue_id());

drop policy if exists "admin write products" on products;
create policy "owner write products" on products for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "admin write tournaments" on tournaments;
create policy "owner write tournaments" on tournaments for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "admin write hero_slides" on hero_slides;
create policy "owner write hero_slides" on hero_slides for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "admin write closed_dates" on closed_dates;
create policy "owner write closed_dates" on closed_dates for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "admin write categories" on categories;
create policy "owner write categories" on categories for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

-- === Financial tables: no reason these should be publicly readable at
-- all, tenant or not. ===
drop policy if exists "public read sales" on sales;
drop policy if exists "admin write sales" on sales;
create policy "owner read sales" on sales for select
  using (venue_id = get_my_venue_id());
create policy "owner write sales" on sales for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "public read sale_items" on sale_items;
drop policy if exists "admin write sale_items" on sale_items;
create policy "owner read sale_items" on sale_items for select
  using (venue_id = get_my_venue_id());
create policy "owner write sale_items" on sale_items for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());

drop policy if exists "public read sale_payments" on sale_payments;
drop policy if exists "admin write sale_payments" on sale_payments;
create policy "owner read sale_payments" on sale_payments for select
  using (venue_id = get_my_venue_id());
create policy "owner write sale_payments" on sale_payments for all
  using (venue_id = get_my_venue_id()) with check (venue_id = get_my_venue_id());
