-- Noah Barbershop: content + booking schema.

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- admins & authorization ----------
create table public.admins (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  added_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- True only for a signed-in Google account whose email is on the admin list.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' -> 'providers') ? 'google'
      and exists (select 1 from public.admins a where a.email = lower(auth.jwt() ->> 'email')),
    false
  );
$$;

create or replace function public.prevent_last_admin_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.admins) <= 1 then
    raise exception 'The last admin cannot be removed';
  end if;
  return old;
end;
$$;

create trigger admins_keep_one
  before delete on public.admins
  for each row execute function public.prevent_last_admin_delete();

-- ---------- shop settings (single row) ----------
create table public.shop_settings (
  id smallint primary key default 1 check (id = 1),
  phone text not null,
  address_line1 text not null default '',
  address_line2 text not null default '',
  hours_time text not null default '',
  hours_days text not null default '',
  maps_url text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  tiktok_url text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------- barbers ----------
create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60),
  role text not null default '',
  bio text not null default '',
  specialties text[] not null default '{}',
  experience text not null default '',
  languages text[] not null default '{}',
  phone text not null,
  telegram text not null default '',
  whatsapp text not null default '',
  photo_path text,
  is_active boolean not null default true,
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.barber_media (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete cascade,
  kind text not null check (kind in ('photo', 'video')),
  path text not null,
  poster_path text,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind = 'photo' or poster_path is not null)
);
create index barber_media_barber_idx on public.barber_media (barber_id, sort_order);

-- ---------- services, gallery, testimonials ----------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '',
  price_etb integer not null check (price_etb >= 0),
  price_is_from boolean not null default true,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  alt text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (char_length(quote) between 1 and 1200),
  name text not null check (char_length(name) between 1 and 80),
  source text not null default 'Tripadvisor',
  review_date text not null default '',
  rating smallint not null default 5 check (rating between 1 and 5),
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- booking requests ----------
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  phone text not null check (phone ~ '^[+0-9 ()-]{7,25}$'),
  service_id uuid references public.services (id) on delete set null,
  barber_id uuid references public.barbers (id) on delete set null,
  preferred_date date,
  preferred_time text check (preferred_time is null or preferred_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'new' check (status in ('new', 'confirmed', 'done', 'cancelled')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index booking_requests_status_idx on public.booking_requests (status, created_at desc);
create index booking_requests_service_idx on public.booking_requests (service_id);
create index booking_requests_barber_idx on public.booking_requests (barber_id);

-- Public submissions: force a clean "new" request, keep dates sensible, and rate-limit per phone number.
create or replace function public.validate_booking_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Africa/Addis_Ababa')::date;
  recent integer;
begin
  if public.is_admin() then
    return new;
  end if;

  new.status := 'new';
  new.admin_note := null;

  if new.preferred_date is not null and (new.preferred_date < today or new.preferred_date > today + 90) then
    raise exception 'Please choose a date between today and the next 90 days';
  end if;

  select count(*) into recent
  from public.booking_requests r
  where regexp_replace(r.phone, '\D', '', 'g') = regexp_replace(new.phone, '\D', '', 'g')
    and r.created_at > now() - interval '10 minutes';
  if recent >= 3 then
    raise exception 'Too many requests from this phone number. Please call the shop instead.';
  end if;

  return new;
end;
$$;

create trigger booking_requests_validate
  before insert on public.booking_requests
  for each row execute function public.validate_booking_request();

-- ---------- updated_at triggers ----------
create trigger shop_settings_updated before update on public.shop_settings for each row execute function public.set_updated_at();
create trigger barbers_updated before update on public.barbers for each row execute function public.set_updated_at();
create trigger barber_media_updated before update on public.barber_media for each row execute function public.set_updated_at();
create trigger services_updated before update on public.services for each row execute function public.set_updated_at();
create trigger gallery_items_updated before update on public.gallery_items for each row execute function public.set_updated_at();
create trigger testimonials_updated before update on public.testimonials for each row execute function public.set_updated_at();
create trigger booking_requests_updated before update on public.booking_requests for each row execute function public.set_updated_at();
