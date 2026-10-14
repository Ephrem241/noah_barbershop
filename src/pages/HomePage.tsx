import { About } from '../sections/About'
import { Barbers } from '../sections/Barbers'
import { Gallery } from '../sections/Gallery'
import { Hero } from '../sections/Hero'
import { Services } from '../sections/Services'
import { Testimonials } from '../sections/Testimonials'
import { Trust } from '../sections/Trust'
import { VisitUs } from '../sections/VisitUs'

/** The homepage sections; the navbar, footer and booking bar come from SiteLayout. */
export function HomePage() {
  return (
    <>
      <Hero />
      <Trust />
      <Services />
      <Gallery />
      <Barbers />
      <About />
      <Testimonials />
      <VisitUs />
    </>
  )
}
