-- "#book/request" opens the booking-request form, so no barber may use that slug.
alter table public.barbers add constraint barbers_slug_not_reserved check (slug <> 'request');
