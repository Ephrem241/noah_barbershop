-- The website no longer has a request form: clients contact their barber directly from /barbers.
-- Close the public insert so the unused endpoint can't be used to fill the inbox; admins keep reading,
-- updating and deleting the requests already there.
-- Run this only AFTER the version of the site without the request form is deployed.

drop policy if exists "Anyone submits a booking request" on public.booking_requests;
