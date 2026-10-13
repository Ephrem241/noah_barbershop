-- Website upgrade: optional service durations, gallery categories (portfolio filters), and messaging cleanup.

-- Services: optional duration, shown on the website only once it is filled in (admin → Services & prices).
alter table public.services
  add column if not exists duration_minutes smallint check (duration_minutes is null or duration_minutes between 5 and 480);

-- Gallery: optional category for the "Our Work" filters. Allowed values live in src/data/gallery.ts.
alter table public.gallery_items
  add column if not exists category text not null default '' check (char_length(category) <= 30);

update public.gallery_items
set category = case path
  when '/images/gallery-1.jpg' then 'beards'
  when '/images/gallery-2.jpg' then 'fades'
  when '/images/gallery-3.jpg' then 'designs'
  when '/images/gallery-4.jpg' then 'cuts'
  when '/images/gallery-5.jpg' then 'designs'
  else category
end
where path like '/images/gallery-%';

-- The shop number (+251 94 668 8207) takes phone calls only: drop it where it was seeded as a Telegram contact.
update public.barbers
set telegram = ''
where regexp_replace(telegram, '\D', '', 'g') = '251946688207';
