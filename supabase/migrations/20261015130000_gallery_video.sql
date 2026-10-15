-- Gallery videos: "Our Work" can hold short clips as well as photos (admin → Gallery → Upload videos).
-- Same shape as barber_media: a video's poster frame is stored next to it and shown on the gallery tile.
alter table public.gallery_items
  add column if not exists kind text not null default 'photo' check (kind in ('photo', 'video')),
  add column if not exists poster_path text;

alter table public.gallery_items
  add constraint gallery_items_video_has_poster check (kind = 'photo' or poster_path is not null);
