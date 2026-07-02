-- eXperience Padel MVP: proper managed categories instead of a free-text
-- field, so renaming a category updates every product using it.
-- Run after 001-006.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

alter table categories enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "admin write categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table products add column if not exists category_id uuid references categories(id) on delete set null;

-- Backfill: turn whatever free-text categories already exist into rows,
-- then link each product to its category.
insert into categories (name)
select distinct category from products where category is not null and category <> ''
on conflict (name) do nothing;

update products p
set category_id = c.id
from categories c
where p.category = c.name and p.category is not null;

alter table products drop column if exists category;
