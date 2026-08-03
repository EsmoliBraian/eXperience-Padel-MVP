-- eXperience Padel MVP: full body content for hero slides, so they can work as blog posts.
-- Run after 001-010.

alter table hero_slides add column if not exists body text not null default '';
