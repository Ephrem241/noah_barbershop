export type Testimonial = {
  id?: string
  quote: string
  name: string
  caption: string
  rating: number
  avatar?: string
}

// Built-in fallback content — the live site reads testimonials from Supabase (managed in /admin).
// Client reviews from Tripadvisor (December 2025). Quotes are verbatim apart from spacing lost when the
// page was copied; names are the reviewers' Tripadvisor display names (checked against the listing on 2026-10-14).
// Two reviews were left out: one reads like the shop's own copy and one isn't about a visit.
export const testimonials: Testimonial[] = [
  {
    quote:
      'Clean and welcoming barber shop with friendly, professional staff. The shop is very clean, they use high-quality products, and they genuinely care about their clients. Great service and attention to detail. Highly recommended!',
    name: 'Yonatan A',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      'I had a great experience with Ephrem at Noah Barbershop. His scissor technique is outstanding, very detailed, and professional. You can truly tell he’s one of the best barbers in Ethiopia. Highly recommended!',
    name: '182abreham',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      'I had a fantastic experience at Noah Barber. The barbers are highly skilled and the hospitality is top-notch. They truly listen to what you want and deliver with great precision. The place is clean, and the service is professional. Highly recommended for anyone looking for a fresh cut!',
    name: 'fekadu b',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      'It’s a very clean place, with professional barbers, and great service. recommend to anyone looking for a great haircut!',
    name: 'Daniel Mengistu D',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      "It's one of the best barbershop in the city. The interior looks very refreshing, Clean with experienced barber's. I guarantee everyone will have a good time here.",
    name: 'Bruce G',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      'Job well done! Great with beards! Excellent service and attention to detail. Highly recommend and it’s super cheap too.',
    name: 'Munir B',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      'I went there by seeing their banner from outside and I was curious about their service but they make feel as I know them for decade. They have clean environment with a professional staff. Enjoy their service',
    name: 'Tadesse G',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
  {
    quote:
      'It is winding the Best Barber Shop in the town! Try it, you will have best time and pleasant experience! I recommend for Professional and expat who come to Addis Ababa from different regions.',
    name: 'Yonas F',
    caption: 'Tripadvisor · Dec 2025',
    rating: 5,
  },
]
