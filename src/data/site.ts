// Business details — the single source of truth for contact info, links and navigation.

export const site = {
  name: 'Noah Barbershop',
  phone: {
    display: '+251 94 668 8207',
    href: 'tel:+251946688207',
  },
  address: {
    line1: 'Near Edna Mall, Bole',
    line2: 'Addis Ababa, Ethiopia',
  },
  hours: {
    time: '8:00 AM – 9:00 PM',
    days: 'Mon – Sun (Including Public Holidays)',
  },
  /** Used for map links only if no exact location is known (name as listed on Tripadvisor) */
  locationQuery: 'Noah barber shop, Ednamoll street, Addis Ababa',
  /** Exact pin of the shop's Google Maps listing (https://maps.app.goo.gl/S3BcF635NtPdo7qL8) */
  location: { lat: 8.993932, lng: 38.78472, placeId: 'ChIJfcHfGEGFSxYRQznllYj100Q' },
  tripadvisor: {
    url: 'https://www.tripadvisor.com/Attraction_Review-g293791-d34039775-Reviews-Noah_barber_shop-Addis_Ababa.html',
    rating: 5,
    count: 11,
  },
} as const

// TODO: replace '#' with the shop's real profile URLs.
export const socials = [
  { label: 'Instagram', icon: 'instagram', href: '#' },
  { label: 'Facebook', icon: 'facebook', href: '#' },
  { label: 'TikTok', icon: 'tiktok', href: '#' },
] as const

/** Homepage sections in the navbar and footer (the logo links to #home; "Book Now" to #booking). */
export const navLinks = [
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Our Work' },
  { id: 'barbers', label: 'Barbers' },
  { id: 'about', label: 'About' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
] as const
