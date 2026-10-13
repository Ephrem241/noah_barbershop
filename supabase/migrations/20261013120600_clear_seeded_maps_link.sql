-- The first seed set maps_url to a generic "Edna Mall" search. That placeholder overrode the more precise
-- fallback, so clear it — but only if the owner hasn't replaced it with their own link.
update public.shop_settings
set maps_url = ''
where id = 1
  and maps_url = 'https://www.google.com/maps/search/?api=1&query=Edna+Mall+Addis+Ababa';
