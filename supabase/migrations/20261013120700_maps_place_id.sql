-- Google place ID of the shop: lets "Get Directions" and "Open in Google Maps" show the business by name
-- (not just raw coordinates). Optional; editable in Admin → Shop info.
alter table public.shop_settings
  add column maps_place_id text not null default '' check (maps_place_id = '' or maps_place_id ~ '^[A-Za-z0-9_-]{10,}$');
