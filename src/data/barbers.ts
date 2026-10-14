/*
 * Barber profiles: the "Choose Your Barber" page (/barbers), "Meet the barbers" on the homepage, and the profile
 * dialog (/barbers#book/<id>).
 *
 * Barbers are managed in /admin → Barbers and read from Supabase. A profile only appears on the website once it is
 * visible and its "Sample profile" switch is off; the admin only allows that with a portrait, a bio, at least one
 * specialty and at least one valid contact method, so unfinished profiles never reach visitors. Until one is
 * published, the website shows a short note about the team instead of cards.
 *
 * The built-in list below is used only when the backend is unreachable, and is empty on purpose: it holds no
 * verified profiles. Never add invented names, photos or contact details here.
 *
 * Contact fields (only details the barber has approved for public display):
 *   phoneNumber       Call button, e.g. '+251 94 668 8207' or '0946688207' (Ethiopian numbers get +251).
 *   whatsappNumber    WhatsApp button; only a number that is actually on WhatsApp.
 *   telegramUsername  Telegram button: the public username ('noahbarber', '@noahbarber' or 't.me/noahbarber'),
 *                     or a phone number if the barber allows being found by number in Telegram's privacy settings.
 * A missing or invalid value hides that button (src/booking/contact.ts validates them); nothing is ever faked.
 *
 * Media tips for the profiles you upload:
 *   - Portrait: JPG, about 800×1000 (portrait orientation), face in the upper third.
 *   - Work photos: JPG, about 1200px on the long side.
 *   - Work videos: MP4 (H.264), 15 s or shorter, under 8 MB. Compress a phone clip with ffmpeg:
 *       ffmpeg -i input.mov -t 15 -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow \
 *              -movflags +faststart -c:a aac -b:a 96k work-1.mp4
 */

export type WorkItem =
  | { type: 'photo'; src: string; alt: string }
  | { type: 'video'; src: string; poster: string; alt: string }

export type Barber = {
  /** URL-safe id (the database slug), used in profile links: yoursite.com/barbers#book/<id> */
  id: string
  /** Database id (absent in the built-in fallback content) */
  uuid?: string
  name: string
  role: string
  /** Portrait photo; without one, a gold monogram is shown */
  photo?: string
  /** Short introduction; the first lines show on the barber card, all of it on the profile */
  bio: string
  specialties: string[]
  experience?: string
  languages?: string[]
  phoneNumber?: string
  whatsappNumber?: string
  telegramUsername?: string
  /** Shown on the website */
  active: boolean
  work: WorkItem[]
}

export const barbers: Barber[] = []
