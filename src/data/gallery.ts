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

// The live site reads the gallery from Supabase (managed in /admin) and shows only photos and videos uploaded there.
// The seeded /images/gallery-*.jpg files are generated stand-ins, not the shop's own work, so they are never shown
// as "Our work"; with nothing uploaded, the section and its navbar link stay hidden.
export const gallery: GalleryImage[] = []
