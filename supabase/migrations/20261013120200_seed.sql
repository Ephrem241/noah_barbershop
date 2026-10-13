-- Initial content: everything the static site showed, so the site looks identical once it reads from the database.

insert into public.admins (email) values ('eph8611@gmail.com') on conflict do nothing;

insert into public.shop_settings (id, phone, address_line1, address_line2, hours_time, hours_days, maps_url)
values (
  1, '+251 94 668 8207', 'Near Edna Mall, Bole', 'Addis Ababa, Ethiopia',
  '8:00 AM – 9:00 PM', 'Mon – Sun (Including Public Holidays)',
  'https://www.google.com/maps/search/?api=1&query=Edna+Mall+Addis+Ababa'
)
on conflict (id) do nothing;

insert into public.services (title, description, price_etb, image_path, sort_order) values
  ($$Premium Men’s Haircut$$, $$Consultation, custom cut, precision razor line finish & hair wash.$$, 350, '/images/service-haircut.jpg', 1),
  ($$Skin Fade / Taper Fade$$, $$High-precision seamless fades crafted by our master barbers.$$, 300, '/images/service-fade.jpg', 2),
  ($$Beard Design & Line-up$$, $$Shaping, trimming, hot towel conditioning & razor cleanup.$$, 250, '/images/service-beard.jpg', 3),
  ($$Luxury Facial Treatment$$, $$Deep cleansing, exfoliating scrub, blackhead extraction & hydration.$$, 600, '/images/service-facial.jpg', 4),
  ($$Hot Towel Shave Experience$$, $$Traditional straight-razor shave with premium oils & soothing towels.$$, 500, '/images/service-shave.jpg', 5),
  ($$Scalp Treatment & Conditioning$$, $$Anti-dandruff treatment & nourishing massage for healthy hair growth.$$, 400, '/images/service-scalp.jpg', 6);

insert into public.gallery_items (path, alt, sort_order) values
  ('/images/gallery-1.jpg', 'Low fade with a full, sculpted beard', 1),
  ('/images/gallery-2.jpg', 'Curly top with a clean taper', 2),
  ('/images/gallery-3.jpg', 'Skin fade with a curved part-line design', 3),
  ('/images/gallery-4.jpg', 'Textured curls with a fade, worn with sunglasses', 4),
  ('/images/gallery-5.jpg', 'High fade with a zig-zag hair design', 5);

insert into public.testimonials (quote, name, source, review_date, rating, sort_order) values
  ($$Clean and welcoming barber shop with friendly, professional staff. The shop is very clean, they use high-quality products, and they genuinely care about their clients. Great service and attention to detail. Highly recommended!$$, 'Yonatan A', 'Tripadvisor', 'Dec 2025', 5, 1),
  ($$I had a great experience with Ephrem at Noah Barbershop. His scissor technique is outstanding, very detailed, and professional. You can truly tell he’s one of the best barbers in Ethiopia. Highly recommended!$$, '182abreham', 'Tripadvisor', 'Dec 2025', 5, 2),
  ($$I had a fantastic experience at Noah Barber. The barbers are highly skilled and the hospitality is top-notch. They truly listen to what you want and deliver with great precision. The place is clean, and the service is professional. Highly recommended for anyone looking for a fresh cut!$$, 'Tripadvisor reviewer', 'Tripadvisor', 'Dec 2025', 5, 3),
  ($$It’s a very clean place, with professional barbers, and great service. recommend to anyone looking for a great haircut!$$, 'Daniel M.', 'Tripadvisor', 'Dec 2025', 5, 4),
  ($$It's one of the best barbershop in the city. The interior looks very refreshing, Clean with experienced barber's. I guarantee everyone will have a good time here.$$, 'Bruce G', 'Tripadvisor', 'Dec 2025', 5, 5),
  ($$Job well done! Great with beards! Excellent service and attention to detail. Highly recommend and it’s super cheap too.$$, 'Munir B', 'Tripadvisor', 'Dec 2025', 5, 6),
  ($$I went there by seeing their banner from outside and I was curious about their service but they make feel as I know them for decade. They have clean environment with a professional staff. Enjoy their service$$, 'Tadesse G', 'Tripadvisor', 'Dec 2025', 5, 7),
  ($$It is winding the Best Barber Shop in the town! Try it, you will have best time and pleasant experience! I recommend for Professional and expat who come to Addis Ababa from different regions.$$, 'Yonas F', 'Tripadvisor', 'Dec 2025', 5, 8);

-- Sample barber profiles (flagged is_sample until real details are entered in the admin)
insert into public.barbers (slug, name, role, bio, specialties, experience, languages, phone, telegram, is_sample, sort_order) values
  ('ephrem', 'Ephrem', 'Master Barber',
   $$Sample bio — replace with Ephrem’s story: how long he has been cutting, where he trained and the styles he loves. A Tripadvisor reviewer called his scissor technique “outstanding, very detailed, and professional.”$$,
   array['Scissor cuts', 'Skin fades', 'Beard design'], '', '{}', '+251 94 668 8207', '+251946688207', true, 1),
  ('barber-two', 'Barber Two', 'Senior Barber',
   $$Sample bio — replace with this barber’s name, background and signature services.$$,
   array['Beard sculpting', 'Hot towel shave', 'Line-ups'], '6 years', array['Amharic', 'English'], '+251 94 668 8207', '+251946688207', true, 2),
  ('barber-three', 'Barber Three', 'Barber & Grooming Specialist',
   $$Sample bio — replace with this barber’s name, background and signature services.$$,
   array['Taper fades', 'Facials', 'Scalp treatments'], '4 years', array['Amharic', 'English', 'Afaan Oromo'], '+251 94 668 8207', '+251946688207', true, 3);

insert into public.barber_media (barber_id, kind, path, poster_path, alt, sort_order)
select b.id, m.kind, m.path, m.poster, m.alt, m.ord
from public.barbers b
join (values
  ('ephrem', 'photo', '/images/gallery-3.jpg', null, 'Skin fade with a curved part-line design', 1),
  ('ephrem', 'video', '/barbers/sample/work-sample.mp4', '/barbers/sample/work-sample-poster.jpg', 'Sample video — replace with a short clip of a finished cut', 2),
  ('ephrem', 'photo', '/images/gallery-1.jpg', null, 'Low fade with a full, sculpted beard', 3),
  ('ephrem', 'photo', '/images/service-haircut.jpg', null, 'Precision haircut with a sharp line-up', 4),
  ('ephrem', 'photo', '/images/gallery-2.jpg', null, 'Curly top with a clean taper', 5),
  ('ephrem', 'photo', '/images/service-fade.jpg', null, 'Close-up of a seamless skin fade', 6),
  ('barber-two', 'photo', '/images/service-beard.jpg', null, 'Shaped and lined-up full beard', 1),
  ('barber-two', 'photo', '/images/gallery-4.jpg', null, 'Textured curls with a fade', 2),
  ('barber-two', 'video', '/barbers/sample/work-sample.mp4', '/barbers/sample/work-sample-poster.jpg', 'Sample video — replace with a short clip of a finished cut', 3),
  ('barber-two', 'photo', '/images/service-shave.jpg', null, 'Warm towel before a straight-razor shave', 4),
  ('barber-two', 'photo', '/images/gallery-5.jpg', null, 'High fade with a zig-zag hair design', 5),
  ('barber-three', 'photo', '/images/service-fade.jpg', null, 'Seamless taper fade', 1),
  ('barber-three', 'photo', '/images/service-scalp.jpg', null, 'Scalp massage treatment', 2),
  ('barber-three', 'video', '/barbers/sample/work-sample.mp4', '/barbers/sample/work-sample-poster.jpg', 'Sample video — replace with a short clip of a finished cut', 3),
  ('barber-three', 'photo', '/images/service-facial.jpg', null, 'Cleansing facial mask treatment', 4),
  ('barber-three', 'photo', '/images/gallery-2.jpg', null, 'Curly top with a clean taper', 5)
) as m (slug, kind, path, poster, alt, ord) on m.slug = b.slug;
