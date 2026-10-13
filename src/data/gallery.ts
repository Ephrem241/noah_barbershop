export type GalleryImage = { image: string; alt: string }

// Built-in fallback content — the live site reads the gallery from Supabase (managed in /admin).
export const gallery: GalleryImage[] = [
  { image: '/images/gallery-1.jpg', alt: 'Low fade with a full, sculpted beard' },
  { image: '/images/gallery-2.jpg', alt: 'Curly top with a clean taper' },
  { image: '/images/gallery-3.jpg', alt: 'Skin fade with a curved part-line design' },
  { image: '/images/gallery-4.jpg', alt: 'Textured curls with a fade, worn with sunglasses' },
  { image: '/images/gallery-5.jpg', alt: 'High fade with a zig-zag hair design' },
]
