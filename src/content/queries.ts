/*
 * The website's content queries (Supabase REST / PostgREST paths), one per content type. Read by the app
 * (src/content/rest.ts) and by vite.config.ts, which starts the same requests from index.html while the main
 * JavaScript is still downloading. No imports on purpose, so the build config can use this file too.
 */
export const contentPaths = {
  shop: 'shop_settings?select=*&id=eq.1',
  services: 'services?select=*&is_active=eq.true&order=sort_order.asc',
  gallery: 'gallery_items?select=*&is_active=eq.true&order=sort_order.asc',
  testimonials: 'testimonials?select=*&is_published=eq.true&order=sort_order.asc',
  barbers:
    'barbers?select=*,barber_media(*)&is_active=eq.true&is_sample=eq.false&order=sort_order.asc&barber_media.order=sort_order.asc',
} as const

export type ContentPath = (typeof contentPaths)[keyof typeof contentPaths]
