-- Row-level security: the public reads published content; only admins write.
-- `(select public.is_admin())` is wrapped so Postgres evaluates it once per statement.

alter table public.admins enable row level security;
alter table public.shop_settings enable row level security;
alter table public.barbers enable row level security;
alter table public.barber_media enable row level security;
alter table public.services enable row level security;
alter table public.gallery_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.booking_requests enable row level security;

-- admins: visible and editable by admins only
create policy "Admins read admins" on public.admins for select to authenticated using ((select public.is_admin()));
create policy "Admins add admins" on public.admins for insert to authenticated with check ((select public.is_admin()));
create policy "Admins remove admins" on public.admins for delete to authenticated using ((select public.is_admin()));

-- shop settings: public read, admin update
create policy "Anyone reads shop settings" on public.shop_settings for select to anon, authenticated using (true);
create policy "Admins update shop settings" on public.shop_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- barbers
create policy "Anyone reads active barbers" on public.barbers for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "Admins insert barbers" on public.barbers for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update barbers" on public.barbers for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete barbers" on public.barbers for delete to authenticated using ((select public.is_admin()));

-- barber media: visible when its barber is
create policy "Anyone reads media of active barbers" on public.barber_media for select to anon, authenticated
  using (
    exists (select 1 from public.barbers b where b.id = barber_id and b.is_active)
    or (select public.is_admin())
  );
create policy "Admins insert barber media" on public.barber_media for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update barber media" on public.barber_media for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete barber media" on public.barber_media for delete to authenticated using ((select public.is_admin()));

-- services
create policy "Anyone reads active services" on public.services for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "Admins insert services" on public.services for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update services" on public.services for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete services" on public.services for delete to authenticated using ((select public.is_admin()));

-- gallery
create policy "Anyone reads active gallery items" on public.gallery_items for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "Admins insert gallery items" on public.gallery_items for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update gallery items" on public.gallery_items for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete gallery items" on public.gallery_items for delete to authenticated using ((select public.is_admin()));

-- testimonials
create policy "Anyone reads published testimonials" on public.testimonials for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "Admins insert testimonials" on public.testimonials for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update testimonials" on public.testimonials for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete testimonials" on public.testimonials for delete to authenticated using ((select public.is_admin()));

-- booking requests: anyone may submit a new request; only admins can see or manage them
create policy "Anyone submits a booking request" on public.booking_requests for insert to anon, authenticated
  with check (status = 'new' and admin_note is null);
create policy "Admins read booking requests" on public.booking_requests for select to authenticated using ((select public.is_admin()));
create policy "Admins update booking requests" on public.booking_requests for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete booking requests" on public.booking_requests for delete to authenticated using ((select public.is_admin()));

-- Live updates for the admin inbox (realtime still applies the policies above)
alter publication supabase_realtime add table public.booking_requests;

-- ---------- storage: one public bucket, admin-only writes ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;

create policy "Admins list media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "Admins delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
