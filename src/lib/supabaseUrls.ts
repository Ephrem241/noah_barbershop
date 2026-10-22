/*
 * Addresses in the Supabase project, built without the Supabase client. Pure functions of the project URL, so the
 * tests can check them. No imports on purpose: the tests run this file directly (`npm test`).
 */

export const MEDIA_BUCKET = 'media'

/** Seeded assets are site paths ("/images/…"); uploads are Storage object paths ("gallery/<uuid>.webp"). */
export const isStoragePath = (path: string) => !path.startsWith('/') && !/^https?:\/\//.test(path)

/** An uploaded file as stored — the same address supabase-js `getPublicUrl` gives. */
export const publicUrl = (base: string, path: string) => encodeURI(`${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`)

/**
 * A resized copy from Supabase Image Transformations, as WebP where the browser takes it (Kedirr's 225 KB portrait
 * is 37 KB at 600px wide). Height follows the original's aspect ratio.
 */
export const resizedUrl = (base: string, path: string, width: number) =>
  `${encodeURI(`${base}/storage/v1/render/image/public/${MEDIA_BUCKET}/${path}`)}?width=${width}&quality=75`

/** srcset of resized copies at the given widths */
export const resizedSrcSetFor = (base: string, path: string, widths: readonly number[]) =>
  widths.map((w) => `${resizedUrl(base, path, w)} ${w}w`).join(', ')

/**
 * A REST (PostgREST) read. The publishable key goes in the query string, not in headers, so the browser sends a
 * plain GET with no CORS preflight round trip first.
 */
export const restUrl = (base: string, key: string, path: string) =>
  `${base}/rest/v1/${path}${path.includes('?') ? '&' : '?'}apikey=${encodeURIComponent(key)}`
