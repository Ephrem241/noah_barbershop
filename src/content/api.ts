import type { IconName } from '../components/Icon'
import type { Barber, WorkItem } from '../data/barbers'
import { isGalleryCategory, type GalleryImage } from '../data/gallery'
import { site, socials as fallbackSocials } from '../data/site'
import type { Service } from '../data/services'
import type { Testimonial } from '../data/testimonials'
import type { Tables } from '../lib/database.types'
import { mediaUrl } from '../lib/media'
import { directionsToQuery, directionsUrl, embedUrl, pinUrl, searchUrl } from './location'
import { requireSupabase } from '../lib/supabase'

/** Public query keys — admin mutations invalidate these so edits show up on the site immediately. */
export const contentKeys = {
  shop: ['content', 'shop'] as const,
  services: ['content', 'services'] as const,
  gallery: ['content', 'gallery'] as const,
  testimonials: ['content', 'testimonials'] as const,
  barbers: ['content', 'barbers'] as const,
}

export type ShopInfo = {
  phone: { display: string; href: string }
  address: { line1: string; line2: string }
  hours: { time: string; days: string }
  /** Opens Google Maps navigation to the shop (exact pin once coordinates are set) */
  directionsUrl: string
  /** The shop in Google Maps */
  mapsUrl: string
  /** Embeddable map of the exact pin; null until coordinates are set */
  mapEmbedUrl: string | null
  tripadvisor?: { url: string; rating: number; count: number | null }
  socials: { label: string; icon: IconName; href: string }[]
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** "Open daily · 8:00 AM – 9:00 PM", or the shop's own day range when it isn't every day. */
export function openingSummary(hours: ShopInfo['hours']) {
  const everyDay = /mon\w*\s*[–-]\s*sun/i.test(hours.days)
  return [everyDay ? 'Open daily' : hours.days, hours.time].filter(Boolean).join(' · ')
}

export const formatPrice = (etb: number, from: boolean) => `ETB ${etb.toLocaleString('en-US')}${from ? '+' : ''}`

/** 45 → "45 min", 60 → "1 hr", 75 → "1 hr 15 min" */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h ? `${h} hr` : '', m ? `${m} min` : ''].filter(Boolean).join(' ')
}

export const fallbackShop: ShopInfo = {
  phone: site.phone,
  address: site.address,
  hours: site.hours,
  directionsUrl: directionsUrl(site.location, site.location.placeId),
  mapsUrl: pinUrl(site.location, site.location.placeId),
  mapEmbedUrl: embedUrl(site.location),
  tripadvisor: { ...site.tripadvisor },
  socials: fallbackSocials.filter((s) => s.href && s.href !== '#').map((s) => ({ ...s })),
}

const fail = (error: { message: string }): never => {
  throw new Error(error.message)
}

export async function fetchShop(): Promise<ShopInfo> {
  const { data: row, error } = await requireSupabase().from('shop_settings').select('*').eq('id', 1).maybeSingle()
  if (error) fail(error)
  if (!row) return fallbackShop
  const socials: ShopInfo['socials'] = [
    { label: 'Instagram', icon: 'instagram' as const, href: row.instagram_url },
    { label: 'Facebook', icon: 'facebook' as const, href: row.facebook_url },
    { label: 'TikTok', icon: 'tiktok' as const, href: row.tiktok_url },
  ].filter((s) => s.href)
  const pin = row.latitude != null && row.longitude != null ? { lat: row.latitude, lng: row.longitude } : null
  return {
    phone: { display: row.phone, href: telHref(row.phone) },
    address: { line1: row.address_line1, line2: row.address_line2 },
    hours: { time: row.hours_time, days: row.hours_days },
    directionsUrl: pin
      ? directionsUrl(pin, row.maps_place_id || undefined)
      : row.maps_url || directionsToQuery(site.locationQuery),
    mapsUrl: pin ? pinUrl(pin, row.maps_place_id || undefined) : row.maps_url || searchUrl(site.locationQuery),
    mapEmbedUrl: pin ? embedUrl(pin) : null,
    tripadvisor: row.tripadvisor_url
      ? {
          url: row.tripadvisor_url,
          rating: Number(row.tripadvisor_rating ?? 5),
          count: row.tripadvisor_review_count,
        }
      : undefined,
    socials,
  }
}

export const toService = (row: Tables<'services'>): Service => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: formatPrice(row.price_etb, false),
  priceFrom: row.price_is_from,
  // Before the duration migration runs the column is absent (undefined), so nothing is shown
  duration: row.duration_minutes ? formatDuration(row.duration_minutes) : undefined,
  image: mediaUrl(row.image_path) ?? '/images/service-haircut.jpg',
  alt: row.title,
})

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await requireSupabase().from('services').select('*').eq('is_active', true).order('sort_order')
  if (error) fail(error)
  return (data ?? []).map(toService)
}

export async function fetchGallery(): Promise<GalleryImage[]> {
  const { data, error } = await requireSupabase()
    .from('gallery_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) fail(error)
  return (data ?? [])
    .map((row) => {
      const isVideo = row.kind === 'video'
      return {
        image: mediaUrl(isVideo ? row.poster_path : row.path) ?? '',
        video: isVideo ? mediaUrl(row.path) : undefined,
        alt: row.alt,
        category: row.category && isGalleryCategory(row.category) ? row.category : undefined,
      }
    })
    .filter((g) => g.image)
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await requireSupabase()
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
  if (error) fail(error)
  return (data ?? []).map((row) => ({
    id: row.id,
    quote: row.quote,
    name: row.name,
    caption: [row.source, row.review_date].filter(Boolean).join(' · '),
    rating: row.rating,
  }))
}

type BarberRow = Tables<'barbers'> & { barber_media: Tables<'barber_media'>[] }

const toWorkItem = (m: Tables<'barber_media'>): WorkItem | null => {
  const src = mediaUrl(m.path)
  if (!src) return null
  if (m.kind === 'video') return { type: 'video', src, poster: mediaUrl(m.poster_path) ?? '', alt: m.alt }
  return { type: 'photo', src, alt: m.alt }
}

/** Published barbers only: profiles still marked "Sample profile" in /admin stay off the website. */
export async function fetchBarbers(): Promise<Barber[]> {
  const { data, error } = await requireSupabase()
    .from('barbers')
    .select('*, barber_media(*)')
    .eq('is_active', true)
    .eq('is_sample', false)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'barber_media' })
  if (error) fail(error)
  return ((data ?? []) as BarberRow[]).map((row) => ({
    id: row.slug,
    uuid: row.id,
    name: row.name,
    role: row.role,
    photo: mediaUrl(row.photo_path),
    bio: row.bio,
    specialties: row.specialties,
    experience: row.experience || undefined,
    languages: row.languages.length ? row.languages : undefined,
    // Validated where the links are built (src/booking/contact.ts): an empty or malformed value shows no button
    phoneNumber: row.phone.trim() || undefined,
    whatsappNumber: row.whatsapp.trim() || undefined,
    telegramUsername: row.telegram.trim() || undefined,
    active: row.is_active,
    work: row.barber_media.map(toWorkItem).filter((w): w is WorkItem => w !== null),
  }))
}
