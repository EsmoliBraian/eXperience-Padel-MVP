-- eXperience Padel MVP: landing page content fields.
-- Run after 001-009.

alter table settings add column if not exists about text not null default '';
alter table settings add column if not exists address text not null default '';
alter table settings add column if not exists instagram_url text;
