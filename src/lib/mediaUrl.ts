import { supabaseUrl } from './env'
import { isStoragePath, publicUrl, resizedSrcSetFor } from './supabaseUrls'

// Public addresses of media in Supabase Storage for the website (no Supabase client: see src/lib/env.ts)
export { isStoragePath, MEDIA_BUCKET } from './supabaseUrls'

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (!isStoragePath(path)) return path
  return supabaseUrl ? publicUrl(supabaseUrl, path) : undefined
}

/** srcset of resized copies of an uploaded image; undefined for site files (which aren't in Storage). */
export function resizedSrcSet(path: string | null | undefined, widths: readonly number[]): string | undefined {
  if (!path || !isStoragePath(path) || !supabaseUrl) return undefined
  return resizedSrcSetFor(supabaseUrl, path, widths)
}
