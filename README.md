# noah_barbershop

Website and admin panel for **Noah Barbershop**, Addis Ababa: a one-page site with barber profiles, services and
prices, gallery, client reviews and a live map, plus a Google-sign-in admin panel to manage everything.

## Features
- **Website**: hero, services & prices, gallery, about, Tripadvisor reviews slider, Visit Us with an exact-pin Google map.
- **Booking**: "Book Appointment" opens a barber picker → profile with work photos/videos and Call / Telegram /
  WhatsApp buttons, or an appointment-request form (`#book`, `#book/<barber>` links are shareable).
- **Admin** (`/admin`, Google sign-in, admins only): booking-request inbox (live), barbers + media uploads, services &
  prices, gallery, testimonials, shop info (phone, hours, map pin, socials), admin list.

## Tech
Vite · React 19 · TypeScript · CSS Modules · Supabase (Postgres + row-level security, Auth, Storage, Realtime) ·
TanStack Query · React Router. Hosted on Vercel.

## Getting started
```bash
npm install
cp .env.example .env.local   # then fill in the Supabase URL and publishable key
npm run dev                  # http://localhost:5173
```
Without the env vars the site still runs on its built-in content (no admin).

| Script | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

## Docs
- **[docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md)** — turning on Google sign-in, deploying to Vercel, using the admin,
  setting the map pin, photo/video tips.
- `supabase/migrations/` — database schema, security policies and seed data.
- `docs/design/` — the original mockup and design brief.
