-- eXperience Padel MVP: product categories.
-- Run after 001-005.

alter table products add column if not exists category text;
