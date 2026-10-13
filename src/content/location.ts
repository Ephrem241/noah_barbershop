/** Exact-location helpers shared by the website (Visit Us) and the admin (Shop info preview). */
export type Coordinates = { lat: number; lng: number }

const fmt = (c: Coordinates) => `${c.lat},${c.lng}`

/**
 * Turn-by-turn directions from the visitor's current position to the pin. With the Google place ID, Maps
 * names the destination ("Noah barbershop") instead of showing raw coordinates.
 */
export const directionsUrl = (c: Coordinates, placeId?: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${fmt(c)}${placeId ? `&destination_place_id=${placeId}` : ''}`

/** The pin in Google Maps — with a place ID it opens the shop's business card (reviews, photos, hours). */
export const pinUrl = (c: Coordinates, placeId?: string) =>
  `https://www.google.com/maps/search/?api=1&query=${fmt(c)}${placeId ? `&query_place_id=${placeId}` : ''}`

/** Keyless Google Maps embed centered on the pin. */
export const embedUrl = (c: Coordinates, zoom = 17) => `https://www.google.com/maps?q=${fmt(c)}&z=${zoom}&hl=en&output=embed`

export const searchUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const directionsToQuery = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`

const valid = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180

/**
 * Reads coordinates from what Google Maps lets you copy:
 *   "8.99642, 38.78452"  ·  "8.99642 38.78452"
 *   a full maps URL containing "@8.99642,38.78452", "q=8.99642,38.78452" or "!3d8.99642!4d38.78452"
 */
export function parseCoordinates(text: string): Coordinates | null {
  const t = text.trim()
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // place data in long URLs (most precise)
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|destination|ll)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i,
    /^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/,
  ]
  for (const re of patterns) {
    const m = re.exec(t)
    if (m) {
      const lat = Number(m[1])
      const lng = Number(m[2])
      if (valid(lat, lng)) return { lat, lng }
    }
  }
  return null
}

export const formatCoordinates = (c: Coordinates) => `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`

/** Rough Addis Ababa bounding box — used only for a soft "is this the right place?" warning. */
export const isInAddisAbaba = (c: Coordinates) => c.lat > 8.75 && c.lat < 9.15 && c.lng > 38.6 && c.lng < 38.95
