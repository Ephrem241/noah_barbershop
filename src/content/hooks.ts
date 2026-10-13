import { useQuery, type QueryClient } from '@tanstack/react-query'
import { barbers as fallbackBarbers } from '../data/barbers'
import { gallery as fallbackGallery } from '../data/gallery'
import { services as fallbackServices } from '../data/services'
import { testimonials as fallbackTestimonials } from '../data/testimonials'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  contentKeys,
  fallbackShop,
  fetchBarbers,
  fetchGallery,
  fetchServices,
  fetchShop,
  fetchTestimonials,
} from './api'

const contentQueries = {
  shop: { queryKey: contentKeys.shop, queryFn: fetchShop },
  services: { queryKey: contentKeys.services, queryFn: fetchServices },
  gallery: { queryKey: contentKeys.gallery, queryFn: fetchGallery },
  testimonials: { queryKey: contentKeys.testimonials, queryFn: fetchTestimonials },
  barbers: { queryKey: contentKeys.barbers, queryFn: fetchBarbers },
}

/** Start every public request before React renders. */
export function prefetchContent(client: QueryClient) {
  if (!isSupabaseConfigured) return
  for (const q of Object.values(contentQueries)) void client.prefetchQuery(q as Parameters<QueryClient['prefetchQuery']>[0])
}

/**
 * Live content with a safety net: while loading, `isLoading` lets lists show skeletons (no flash of
 * outdated prices); if Supabase is unconfigured or unreachable, the built-in content is returned instead.
 */
function useContent<T>(query: { queryKey: readonly unknown[]; queryFn: () => Promise<T> }, fallback: T) {
  const q = useQuery({ ...query, enabled: isSupabaseConfigured })
  if (!isSupabaseConfigured || q.isError) return { data: fallback, isLoading: false }
  return { data: q.data ?? fallback, isLoading: q.isPending }
}

export const useShop = () => useContent(contentQueries.shop, fallbackShop).data
export const useServices = () => useContent(contentQueries.services, fallbackServices)
export const useGallery = () => useContent(contentQueries.gallery, fallbackGallery)
export const useTestimonials = () => useContent(contentQueries.testimonials, fallbackTestimonials)
export const useBarbers = () => useContent(contentQueries.barbers, fallbackBarbers)
