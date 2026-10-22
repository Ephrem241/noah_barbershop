export type Service = {
  /** Database id (absent in the built-in fallback content) */
  id?: string
  title: string
  description: string
  /** e.g. "ETB 350" */
  price: string
  /** The price is a starting price ("from ETB 350") */
  priceFrom: boolean
  /** e.g. "45 min" — only shown once a duration is set in /admin */
  duration?: string
  /** Photo uploaded in /admin; without one the service is a text-only line of the menu */
  image?: string
  alt: string
}

// The live site reads services and prices from Supabase (managed in /admin → Services & prices). There is no built-in
// copy on purpose: prices change in /admin, and a stale copy would show wrong prices whenever Supabase can't be
// reached. The services section then asks visitors to call for prices instead.
export const services: Service[] = []
