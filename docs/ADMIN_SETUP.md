# Noah Barbershop — admin setup

The website reads its content (barbers, services & prices, gallery, testimonials, shop info) from Supabase, and
staff manage it at **`/admin`** after signing in with Google. Booking requests sent from the website land in the
admin inbox.

- Supabase project: **naoh_barbershop** — `https://wxyfhszrtumhpavjmhul.supabase.co`
- First admin: **eph8611@gmail.com** (add more under *Admins* in the panel)
- Database schema & security rules: `supabase/migrations/` (all applied, the latest being
  `20261014120000_duration_category_contacts`: service durations, gallery categories)
- New migrations: run the file in Supabase → **SQL Editor**, *before* deploying code that uses it.

## 1. Turn on Google sign-in (one time, ~10 minutes)

### a. Google Cloud Console — create the OAuth client
1. Go to <https://console.cloud.google.com/> → create (or pick) a project, e.g. *Noah Barbershop*.
2. **APIs & Services → OAuth consent screen**: User type *External* → app name **Noah Barbershop Admin**,
   support email = your Gmail → Save. Under *Audience*, click **Publish app** (so any admin’s Gmail can sign in).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**: `http://localhost:5173` and your live site, e.g. `https://noah-barbershop.vercel.app`
   - **Authorized redirect URIs**: `https://wxyfhszrtumhpavjmhul.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.

### b. Supabase Dashboard
1. <https://supabase.com/dashboard/project/wxyfhszrtumhpavjmhul> → **Authentication → Sign In / Providers → Google**:
   enable it, paste the Client ID and Client secret → Save.
2. **Authentication → URL Configuration**:
   - **Site URL**: your live site, e.g. `https://noah-barbershop.vercel.app`
   - **Redirect URLs** (add each): `http://localhost:5173/**`, `http://localhost:5174/**`, `https://noah-barbershop.vercel.app/**`
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
| Booking requests | New requests appear instantly. Call or WhatsApp the client, set the status (new → confirmed → done / cancelled), add a private note. |
| Barbers | Add, edit, hide, reorder, delete. Portrait, bio, specialties, phone; Telegram and WhatsApp buttons appear only when those fields are filled in. Upload work photos and videos. Turn off “Sample profile” once a profile is real. |
| Services & prices | Title, description, price in birr (a “from” price shows as *from ETB 350*), optional duration in minutes (shown only when filled in), image, order, hide. |
| Gallery | Upload photos (resized automatically), describe each, pick a category, reorder, hide. “Our Work” shows every visible photo; the style filters appear once photos use at least two categories. |
| Testimonials | Add real client reviews with source and date, reorder, hide. They appear in the “Reviews” section. |
| Shop info | Phone, address, **exact map location**, opening hours, Tripadvisor badge (link, rating, review count), Instagram / Facebook / TikTok links. |
| Admins | Add or remove admin Gmail addresses (you can’t remove yourself or the last admin). |

Every change shows on the website immediately (visitors see it on their next page load).

### Set the exact map location (do this once)
Until a pin is set, the website shows a drawn map and “Get Directions” searches Google Maps for the shop.
1. Open Google Maps (phone or computer) and find the shop’s door on the map.
2. **Phone:** long-press that spot — a red pin drops and the coordinates (e.g. `8.99642, 38.78452`) appear in the
   search bar; tap to copy. **Computer:** right-click the spot and click the coordinates at the top of the menu.
3. Admin → **Shop info → Exact location** → paste into *Coordinates*. A preview map shows the pin — check it is on
   the shop, then **Save shop info**.
4. The website now shows a real map at that pin, and “Get Directions” starts turn-by-turn navigation to it.

A full Google Maps link also works in the Coordinates box; short `maps.app.goo.gl` share links don’t (open the link
and copy the coordinates instead).

### Hero video
The top of the homepage plays the shop’s own footage, muted and looping, with a pause button. It doesn’t play for
visitors who ask for reduced motion or have data saver on: they see a still frame instead. Three files, all made from
one landscape clip (ideally 8–15 s):

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

### Photos to replace
Apart from the hero video, every photo the site shipped with is a **generated placeholder**, not the shop’s own work.
Replace them with real photos from the shop as soon as you can — real work is what convinces new clients.

| Where | How to replace | Best size |
|---|---|---|
| Services menu thumbnails | Admin → Services & prices → Edit → Image | Square-ish, ≥ 400 px |
| “Our Work” gallery | Admin → Gallery: upload real cuts, then hide or delete `gallery-1…5` | Portrait or square, ≥ 1000 px |
| Barber portraits and work | Admin → Barbers → Edit: portrait, photos and short videos | Portrait 800 × 1000 px |
| Sample work video | Admin → Barbers: delete the “Sample video” item from each profile | — |

Also worth filling in when you have them: Instagram / Facebook / TikTok links (Shop info — they appear in the
footer, and Instagram also under “Our Work”), real barber names and bios, and service durations.

### Photo & video tips
- Photos: JPG/PNG/WebP straight from a phone are fine — they’re resized to ~1600px in the browser before upload.
- Videos: **MP4**, ideally under 15 seconds; the hard limit is **50 MB** per file (Supabase free plan). Compress a
  long phone clip with [ffmpeg](https://ffmpeg.org/):
  ```
  ffmpeg -i input.mov -t 15 -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow -movflags +faststart -c:a aac -b:a 96k clip.mp4
  ```
- Storage on the free plan is 1 GB in total — plenty for photos and a few dozen short clips.

## How access is protected
- The browser key in `.env.local` is public by design; **row-level security** in the database decides what each
  visitor may do: the public can only read visible content and *submit* booking requests (max 3 per phone number
  per 10 minutes); only admins can read requests or change anything.
- “Admin” = signed in **with Google** *and* the email is on the Admins list (checked by `public.is_admin()` in the
  database, not just in the browser).
- Uploaded files go to the public `media` storage bucket; only admins can upload, replace or delete them.

## If something goes wrong
- *“Unsupported provider”* or the Google button does nothing → Google isn’t enabled yet in Supabase (step 1b).
- *“redirect_uri_mismatch”* from Google → the redirect URI in step 1a.3 must be exactly
  `https://wxyfhszrtumhpavjmhul.supabase.co/auth/v1/callback`.
- Signed in but “Not authorized” → that Gmail isn’t on the Admins list; an existing admin must add it.
- Website shows old content → it falls back to built-in content only if Supabase can’t be reached; check the
  environment variables on Vercel.
