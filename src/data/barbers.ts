/*
 * Barber profiles shown when a client taps "Book Appointment".
 *
 * The live site reads barbers from Supabase and they are managed in /admin — this file is only the
 * built-in fallback used when the backend is unreachable. The notes below still apply to media you upload.
 *
 * HOW TO ADD OR UPDATE A BARBER
 * 1. Put their media in  public/barbers/<id>/  e.g. public/barbers/ephrem/portrait.jpg
 *    - Portrait: JPG, about 800×1000 (portrait orientation), face in the upper third.
 *    - Work photos: JPG, about 1200px on the long side.
 *    - Work videos: MP4 (H.264), 15 s or shorter, under 8 MB, plus a poster JPG (first frame).
 *      Compress a phone clip with ffmpeg:
 *        ffmpeg -i input.mov -t 15 -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow \
 *               -movflags +faststart -c:a aac -b:a 96k work-1.mp4
 *        ffmpeg -i work-1.mp4 -vframes 1 -q:v 4 work-1-poster.jpg
 * 2. Fill in the entry below. Paths start with "/" (they are served from public/).
 * 3. Remove `placeholder: true` once the profile is real — it shows a "Sample profile" tag.
 *
 * Contact fields:
 *   phone     Shown on the profile and used for the Call button, e.g. '+251 94 668 8207'.
 *   telegram  Telegram username without "@" (preferred), or a phone number like '+251911223344'.
 *   whatsapp  Optional; defaults to `phone`.
 */

export type WorkItem =
  | { type: 'photo'; src: string; alt: string }
  | { type: 'video'; src: string; poster: string; alt: string }

export type Barber = {
  /** URL-safe id (the database slug), used in profile links: yoursite.com/#book/<id> */
  id: string
  /** Database id (absent in the built-in fallback content) */
  uuid?: string
  name: string
  role: string
  /** Portrait photo; without one, a gold monogram is shown */
  photo?: string
  bio: string
  specialties: string[]
  experience?: string
  languages?: string[]
  phone: string
  telegram?: string
  whatsapp?: string
  work: WorkItem[]
  placeholder?: boolean
}

const sampleVideo: WorkItem = {
  type: 'video',
  src: '/barbers/sample/work-sample.mp4',
  poster: '/barbers/sample/work-sample-poster.jpg',
  alt: 'Sample video — replace with a short clip of a finished cut',
}

// PLACEHOLDER PROFILES — every number below is the shop's line and every photo is a temporary stand-in.
export const barbers: Barber[] = [
  {
    id: 'ephrem',
    name: 'Ephrem',
    role: 'Master Barber',
    bio: 'Sample bio — replace with Ephrem’s story: how long he has been cutting, where he trained and the styles he loves. A Tripadvisor reviewer called his scissor technique “outstanding, very detailed, and professional.”',
    specialties: ['Scissor cuts', 'Skin fades', 'Beard design'],
    phone: '+251 94 668 8207',
    telegram: '+251946688207',
    work: [
      { type: 'photo', src: '/images/gallery-3.jpg', alt: 'Skin fade with a curved part-line design' },
      sampleVideo,
      { type: 'photo', src: '/images/gallery-1.jpg', alt: 'Low fade with a full, sculpted beard' },
      { type: 'photo', src: '/images/service-haircut.jpg', alt: 'Precision haircut with a sharp line-up' },
      { type: 'photo', src: '/images/gallery-2.jpg', alt: 'Curly top with a clean taper' },
      { type: 'photo', src: '/images/service-fade.jpg', alt: 'Close-up of a seamless skin fade' },
    ],
    placeholder: true,
  },
  {
    id: 'barber-two',
    name: 'Barber Two',
    role: 'Senior Barber',
    bio: 'Sample bio — replace with this barber’s name, background and signature services.',
    specialties: ['Beard sculpting', 'Hot towel shave', 'Line-ups'],
    experience: '6 years',
    languages: ['Amharic', 'English'],
    phone: '+251 94 668 8207',
    telegram: '+251946688207',
    work: [
      { type: 'photo', src: '/images/service-beard.jpg', alt: 'Shaped and lined-up full beard' },
      { type: 'photo', src: '/images/gallery-4.jpg', alt: 'Textured curls with a fade' },
      sampleVideo,
      { type: 'photo', src: '/images/service-shave.jpg', alt: 'Warm towel before a straight-razor shave' },
      { type: 'photo', src: '/images/gallery-5.jpg', alt: 'High fade with a zig-zag hair design' },
    ],
    placeholder: true,
  },
  {
    id: 'barber-three',
    name: 'Barber Three',
    role: 'Barber & Grooming Specialist',
    bio: 'Sample bio — replace with this barber’s name, background and signature services.',
    specialties: ['Taper fades', 'Facials', 'Scalp treatments'],
    experience: '4 years',
    languages: ['Amharic', 'English', 'Afaan Oromo'],
    phone: '+251 94 668 8207',
    telegram: '+251946688207',
    work: [
      { type: 'photo', src: '/images/service-fade.jpg', alt: 'Seamless taper fade' },
      { type: 'photo', src: '/images/service-scalp.jpg', alt: 'Scalp massage treatment' },
      sampleVideo,
      { type: 'photo', src: '/images/service-facial.jpg', alt: 'Cleansing facial mask treatment' },
      { type: 'photo', src: '/images/gallery-2.jpg', alt: 'Curly top with a clean taper' },
    ],
    placeholder: true,
  },
]
