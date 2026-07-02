-- eXperience Padel MVP: debt sales ("Adeuda")
-- Run this once in the Supabase SQL Editor (after 001/002).
-- A debt is now a real sale flagged as unpaid, instead of a separate
-- disconnected ledger, so it shows up in Ventas del dia / Metricas.

alter table sales add column if not exists payment_status text not null default 'pagado'
  check (payment_status in ('pagado', 'adeuda'));
alter table sales add column if not exists customer_name text;
alter table sales alter column payment_method drop not null;

-- The old "debtors" table (from migrations/002) is no longer used by the
-- app. It's left in place untouched — nothing to migrate automatically,
-- since it has no link to products/sales. Safe to ignore or drop manually
-- later if you don't need the old test data.
