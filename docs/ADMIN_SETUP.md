# Noah Barbershop — admin setup

The website reads its content (barbers, services & prices, gallery, testimonials, shop info) from Supabase, and
staff manage it at **`/admin`** after signing in with Google. Clients book by choosing a barber at **`/barbers`**
(every “Book” button leads there) and calling or messaging that barber directly.

- Supabase project: **naoh_barbershop** — `https://wxyfhszrtumhpavjmhul.supabase.co`
- First admin: **eph8611@gmail.com** (add more under *Admins* in the panel)
- Database schema & security rules: `supabase/migrations/`. Applied up to
  `20261014120000_duration_category_contacts` (service durations, gallery categories).
  **Still to run:** `20261015120000_close_public_booking_requests`, once the version without the request form is
  live (see *Booking requests* below).
- New migrations: run the file in Supabase → **SQL Editor**, *before* deploying code that uses it.

## 1. Turn on Google sign-in (one time, ~10 minutes)

### a. Google Cloud Console — create the OAuth client
1. Go to <https://console.cloud.google.com/> → create (or pick) a project, e.g. *Noah Barbershop*.
2. **APIs & Services → OAuth consent screen**: User type *External* → app name **Noah Barbershop Admin**,
   support email = your Gmail → Save. Under *Audience*, click **Publish app** (so any admin’s Gmail can sign in).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**: `http://localhost:5173` and your live site, `https://noah-barbershop-9cv3.vercel.app`
   - **Authorized redirect URIs**: `https://wxyfhszrtumhpavjmhul.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.

### b. Supabase Dashboard
1. <https://supabase.com/dashboard/project/wxyfhszrtumhpavjmhul> → **Authentication → Sign In / Providers → Google**:
   enable it, paste the Client ID and Client secret → Save.
2. **Authentication → URL Configuration** (current settings):
   - **Site URL**: `https://noah-barbershop-9cv3.vercel.app`
   - **Redirect URLs**: `https://noah-barbershop-9cv3.vercel.app/**`, `http://localhost:5173/**`, and the
     `noah-barbershop-eprems-projects.vercel.app` entries (the same site under its Vercel team address).
   - **Every address you open `/admin` from must be on this list.** Sign-in returns to the address it started
     from; if that address isn’t listed, Supabase sends you to the Site URL instead — a different domain, where the
     sign-in can’t finish — and you have to sign in a second time. Add a custom domain here as soon as you use it.
3. Optional but recommended: **Sign In / Providers → Email** → turn off, since only Google is used.

## 2. Deploy on Vercel
1. Push this folder to a GitHub repository, then at <https://vercel.com/new> import it (framework: **Vite**).
2. **Settings → Environment Variables** — add both (values are in `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Deploy. `vercel.json` already makes `/admin` work on refresh.
4. Put the final Vercel URL into the Google origins (1a.3) and Supabase URL settings (1b.2).

## 3. Using the admin
Open `https://<your-site>/admin` → **Sign in with Google**.

| Page | What you can do |
|---|---|
| Booking requests | Requests sent through the website’s former request form. The form has been removed (clients now contact their barber directly), so nothing new arrives; you can still call or WhatsApp those clients, set the status and add notes. |
| Barbers | Add, edit, hide, reorder, delete. Portrait, bio, specialties and the three contact buttons (see *Barber profiles and contact buttons* below). Upload work photos and videos. **A profile appears on the website only once it is visible and “Sample profile” is turned off**; while none is published, `/barbers` and “Meet the barbers” show a short note about the team instead (a client review naming Ephrem, plus Call the shop / Get Directions). |
| Services & prices | Title, description, price in birr (a “from” price shows as *from ETB 350*), optional duration in minutes (shown only when filled in), image, order, hide. |
| Gallery | Upload photos (resized automatically) and short videos, describe each, pick a category, reorder, hide. “Our Work” shows every visible item; videos show their first frame with a play button and play when tapped. The style filters appear once items use at least two categories. |
| Testimonials | Add real client reviews with source and date, reorder, hide. They appear in the “Reviews” section. |
| Shop info | Phone, address, **exact map location**, opening hours, Tripadvisor badge (link, rating, review count), Instagram / Facebook / TikTok links. |
| Admins | Add or remove admin Gmail addresses (you can’t remove yourself or the last admin). |

Every change shows on the website immediately (visitors see it on their next page load).

### Barber profiles and contact buttons
Every “Book” button on the website (hero, navbar, each service, the phone bar) opens **`/barbers`**, “Choose Your
Barber”. Each barber card has up to three buttons, and the client agrees on a day and time with the barber directly;
the website never claims a message confirms a booking. Booking from a service adds it to the address
(`/barbers?service=skin-fade-taper-fade`) and to the WhatsApp message.

| Field | What to enter | Button on the website |
|---|---|---|
| Phone (Call button) | The barber’s own number, e.g. `+251 94 668 8207` or `0946688207` | **Call** → `tel:+251946688207` |
| WhatsApp number | Only a number that is on WhatsApp | **WhatsApp** → `wa.me/251…` with the message *“Hello, I found you on the Noah Barbershop website. I’d like to book a haircut (or the chosen service). What dates and times are available?”* |
| Telegram username | The public username: `noahbarber`, `@noahbarber` or `t.me/noahbarber` (a phone number also works if the barber allows it in Telegram’s privacy settings) | **Telegram** → `t.me/noahbarber` (opens the app, or Telegram’s web page without it) |

- Only enter details the barber has agreed to show publicly. The shop line (+251 94 668 8207) takes calls only:
  don’t enter it as anyone’s WhatsApp or Telegram.
- Ethiopian numbers can be typed in any common way; they are saved as `+251 9x xxx xxxx`. Under each field the
  editor shows the link it will create (“Opens wa.me/251…”); a value that can’t work is refused, and an empty field
  simply hides that button.
- To publish a profile (visible, “Sample profile” off), it needs a **portrait, a bio, at least one specialty and at
  least one contact**. Saving then asks you to confirm the exact numbers and username visitors will see.
- The first two or three lines of the bio show on the card; the full bio, languages and work photos are on the
  profile (`/barbers#book/<link name>`, also “View on website” in the editor).

### Set the exact map location (do this once)
Until a pin is set, the website shows a drawn map and “Get Directions” searches Google Maps for the shop.
1. Open Google Maps (phone or computer) and find the shop’s door on the map.
2. **Phone:** long-press that spot — a red pin drops and the coordinates (e.g. `8.99642, 38.78452`) appear in the
   search bar; tap to copy. **Computer:** right-click the spot and click the coordinates at the top of the menu.
3. Admin → **Shop info → Exact location** → paste into *Coordinates*. A preview map shows the pin — check it is on
   the shop, then **Save shop info**.
4. The website now shows a real map at that pin, and “Get Directions” starts turn-by-turn navigation to it.

**Google place ID:** leave it empty unless the shop’s own Google Maps listing has its pin on the shop. With a place
ID, Google sends “Get Directions” to the listing’s pin, not to your coordinates. In October 2026 the “NOAH
Barbershop” listing sat about 45 m north of the real building (the Hananeel pastry building, plus code XQVP+944). Move
the listing’s pin in Google Business Profile (Edit profile → Location) before adding the place ID back.

A full Google Maps link also works in the Coordinates box; short `maps.app.goo.gl` share links don’t (open the link
and copy the coordinates instead).

### Hero video
The top of the homepage plays the shop’s own footage, muted and looping, with a pause button. It starts once the page
has finished loading (the still frame shows first), pauses while scrolled out of view, and phones or slow connections
get the lighter 480p file. It doesn’t play for visitors who ask for reduced motion or have data saver on: they see the
still frame and can press play. Three files, all made from one landscape clip (ideally 8–15 s):

| File | What it is |
|---|---|
| `public/videos/hero-720.mp4` | Desktop and tablets (1280 × 720, no sound) |
| `public/videos/hero-480.mp4` | Phones (854 × 480, no sound) |
| `public/images/hero-poster.jpg` | The clip’s first frame: shown while the video loads, and as the link preview image |

To swap in a new clip, run these with [ffmpeg](https://ffmpeg.org/), then redeploy:
```
ffmpeg -i clip.mp4 -an -c:v libx264 -profile:v high -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -vf "scale=1280:-2" public/videos/hero-720.mp4
ffmpeg -i clip.mp4 -an -c:v libx264 -profile:v high -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart -vf "scale=-2:480" public/videos/hero-480.mp4
ffmpeg -i clip.mp4 -frames:v 1 -q:v 4 public/images/hero-poster.jpg
```
Keep people roughly in the centre-left of the frame: the left edge fades into the headline on desktop.
Browsers cache files in `public/images`, `public/videos` and `public/barbers` for a day (`vercel.json`), so returning
visitors may see the old clip for up to a day after a swap; use new file names (and update `src/sections/Hero.tsx`) if
it must change at once. Fonts are self-hosted in `public/fonts` (see `src/styles/fonts.css`).

### Photos to replace
Apart from the hero video, every photo the site shipped with is a **generated placeholder**, not the shop’s own work.
Replace them with real photos from the shop as soon as you can — real work is what convinces new clients.

| Where | How to replace | Best size |
|---|---|---|
| Services menu thumbnails | Admin → Services & prices → Edit → Image | Square-ish, ≥ 400 px |
| “Our Work” gallery | Admin → Gallery: upload real cuts (photos or short videos), then hide or delete `gallery-1…5` | Portrait or square, ≥ 1000 px |
| Barber portraits and work | Admin → Barbers → Edit: portrait, photos and short videos | Portrait 800 × 1000 px |
| Sample work video | Admin → Barbers: delete the “Sample video” item from each profile (sample profiles aren’t shown on the website) | — |

Also worth filling in when you have them: Instagram / Facebook / TikTok links (Shop info — they appear in the
footer, and Instagram also under “Our Work”), real barber names and bios, and service durations.

### Photo & video tips
- Photos: JPG/PNG/WebP straight from a phone are fine — they’re resized in the browser before upload (gallery
  ~1400px, service and work photos ~1600px).
- Videos: **MP4**, ideally under 15 seconds; the hard limit is **50 MB** per file (Supabase free plan). The first
  frame is saved automatically as the thumbnail. Videos aren’t compressed on upload, so compress a long phone clip
  with [ffmpeg](https://ffmpeg.org/):
  ```
  ffmpeg -i input.mov -t 15 -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow -movflags +faststart -c:a aac -b:a 96k clip.mp4
  ```
- iPhones record in HEVC (`.mov`) by default, which some Android phones and desktop browsers can’t play. Before
  filming, set **Settings → Camera → Formats → Most Compatible**, or convert the clip with the command above.
- Storage on the free plan is 1 GB in total — plenty for photos and a few dozen short clips.

### Logo
The logo artwork is `docs/brand/noah-logo.jpg`. The website uses versions cut from it, with the black background
made transparent: `public/images/logo-nav.webp` (navbar: crown, monogram and NOAH), `logo.webp` (full emblem:
footer and admin sign-in), `logo-mark.webp` (admin header), `logo-512.jpg` (search engines), plus `favicon.ico`,
`icon-192.png` and `apple-touch-icon.png`. If the logo changes, regenerate all of them from the new artwork.

## How access is protected
- The browser key in `.env.local` is public by design; **row-level security** in the database decides what each
  visitor may do: the public can only read visible content (and, until `20261015120000_close_public_booking_requests`
  is run, *submit* booking requests, max 3 per phone number per 10 minutes); only admins can read requests or change
  anything.
- “Admin” = signed in **with Google** *and* the email is on the Admins list (checked by `public.is_admin()` in the
  database, not just in the browser).
- Uploaded files go to the public `media` storage bucket; only admins can upload, replace or delete them.

## If something goes wrong
- *“Unsupported provider”* or the Google button does nothing → Google isn’t enabled yet in Supabase (step 1b).
- *“redirect_uri_mismatch”* from Google → the redirect URI in step 1a.3 must be exactly
  `https://wxyfhszrtumhpavjmhul.supabase.co/auth/v1/callback`.
- Have to sign in twice, or Google sends you back to the homepage / another domain → the address you started
  from isn’t in **Redirect URLs** (step 1b.2). Add `https://<that address>/**`.
- Signed in but “Not authorized” → that Gmail isn’t on the Admins list; an existing admin must add it.
- Website shows old content → it falls back to built-in content only if Supabase can’t be reached; check the
  environment variables on Vercel.
