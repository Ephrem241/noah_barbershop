/** Portfolio filters ("Our Work"). The admin's category picker offers exactly these. */
export const GALLERY_CATEGORIES = [
  { id: 'fades', label: 'Fades' },
  { id: 'cuts', label: 'Cuts & texture' },
  { id: 'beards', label: 'Beards' },
  { id: 'designs', label: 'Designs' },
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]['id']

/** `image` is the still shown on the tile; for a clip it's the poster frame and `video` is the clip itself. */
export type GalleryImage = { image: string; alt: string; category?: GalleryCategory; video?: string }

export const isGalleryCategory = (value: string): value is GalleryCategory =>
  GALLERY_CATEGORIES.some((c) => c.id === value)

// Built-in fallback content — the live site reads the gallery from Supabase (managed in /admin).
// PLACEHOLDER IMAGES: generated stand-ins, not the shop's own work — replace them with real photos in /admin.
export const gallery: GalleryImage[] = [
  { image: '/images/gallery-1.jpg', alt: 'Low fade with a full, sculpted beard', category: 'beards' },
  { image: '/images/gallery-2.jpg', alt: 'Curly top with a clean taper', category: 'fades' },
  { image: '/images/gallery-3.jpg', alt: 'Skin fade with a curved part-line design', category: 'designs' },
  { image: '/images/gallery-4.jpg', alt: 'Textured curls with a fade, worn with sunglasses', category: 'cuts' },
  { image: '/images/gallery-5.jpg', alt: 'High fade with a zig-zag hair design', category: 'designs' },
]
