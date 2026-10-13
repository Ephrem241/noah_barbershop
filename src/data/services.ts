export type Service = {
  /** Database id (absent in the built-in fallback content) */
  id?: string
  title: string
  description: string
  price: string
  image: string
  alt: string
}

// Built-in fallback content — the live site reads services from Supabase (managed in /admin).
export const services: Service[] = [
  {
    title: 'Premium Men’s Haircut',
    description: 'Consultation, custom cut, precision razor line finish & hair wash.',
    price: 'ETB 350+',
    image: '/images/service-haircut.jpg',
    alt: 'Client in profile with a fresh, sharply lined haircut',
  },
  {
    title: 'Skin Fade / Taper Fade',
    description: 'High-precision seamless fades crafted by our master barbers.',
    price: 'ETB 300+',
    image: '/images/service-fade.jpg',
    alt: 'Close-up of a seamless skin fade',
  },
  {
    title: 'Beard Design & Line-up',
    description: 'Shaping, trimming, hot towel conditioning & razor cleanup.',
    price: 'ETB 250+',
    image: '/images/service-beard.jpg',
    alt: 'Client with a shaped and lined-up full beard',
  },
  {
    title: 'Luxury Facial Treatment',
    description: 'Deep cleansing, exfoliating scrub, blackhead extraction & hydration.',
    price: 'ETB 600+',
    image: '/images/service-facial.jpg',
    alt: 'Client relaxing in the chair with a cleansing facial mask',
  },
  {
    title: 'Hot Towel Shave Experience',
    description: 'Traditional straight-razor shave with premium oils & soothing towels.',
    price: 'ETB 500+',
    image: '/images/service-shave.jpg',
    alt: 'Client reclined with a warm towel before a straight-razor shave',
  },
  {
    title: 'Scalp Treatment & Conditioning',
    description: 'Anti-dandruff treatment & nourishing massage for healthy hair growth.',
    price: 'ETB 400+',
    image: '/images/service-scalp.jpg',
    alt: 'Barber massaging a client’s scalp during a treatment',
  },
]
