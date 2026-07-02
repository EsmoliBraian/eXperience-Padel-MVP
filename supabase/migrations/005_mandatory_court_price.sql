-- eXperience Padel MVP: every court now needs its own price, no more
-- fallback "default price" (was confusing — a court could silently use
-- a price nobody set on purpose). Run after 001-004.

update courts set price = coalesce(price, (select default_price from settings limit 1), 8000)
where price is null;

alter table courts alter column price set default 8000;
alter table courts alter column price set not null;

alter table settings drop column if exists default_price;
