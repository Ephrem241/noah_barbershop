import { supabaseKey, supabaseUrl } from '../lib/env'
import { restUrl } from '../lib/supabaseUrls'
import type { ContentPath } from './queries'

/*
 * The website's content, read straight from Supabase's REST API (PostgREST) with plain GET requests (see restUrl:
 * no CORS preflight). Read-only and public (row-level security allows these reads); the admin panel uses the
 * Supabase client.
 */

declare global {
  interface Window {
    /**
     * Requests index.html started before the app loaded (see vite.config.ts); each resolves to the rows, or null if
     * it failed
     */
    __noahContent?: Record<string, Promise<unknown> | undefined>
  }
}

async function request<T>(path: ContentPath): Promise<T> {
  const res = await fetch(restUrl(supabaseUrl, supabaseKey, path))
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message ?? `Content request failed (${res.status})`)
  return body as T
}

/** Rows for one content query: the request index.html started, if any (each is used once), otherwise a new one. */
export async function getRows<T>(path: ContentPath): Promise<T[]> {
  const started = window.__noahContent
  const early = started?.[path]
  if (started && early) {
    started[path] = undefined
    const rows = await early
    if (Array.isArray(rows)) return rows as T[]
  }
  return request<T[]>(path)
}
