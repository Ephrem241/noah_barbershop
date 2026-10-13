-- Exact map location (set by the owner in Admin → Shop info) and the Tripadvisor rating badge.
alter table public.shop_settings
  add column latitude double precision check (latitude between -90 and 90),
  add column longitude double precision check (longitude between -180 and 180),
  add column tripadvisor_url text not null default '',
  add column tripadvisor_rating numeric(2, 1) check (tripadvisor_rating between 0 and 5),
  add column tripadvisor_review_count integer check (tripadvisor_review_count >= 0),
  add constraint shop_settings_coordinates_pair check ((latitude is null) = (longitude is null));

update public.shop_settings
set
  tripadvisor_url = 'https://www.tripadvisor.com/Attraction_Review-g293791-d34039775-Reviews-Noah_barber_shop-Addis_Ababa.html',
  tripadvisor_rating = 5.0,
  tripadvisor_review_count = 11
where id = 1;
