import { BookingProvider } from '../booking/BookingProvider'
import { About } from '../sections/About'
import { Features } from '../sections/Features'
import { Footer } from '../sections/Footer'
import { Gallery } from '../sections/Gallery'
import { Hero } from '../sections/Hero'
import { Navbar } from '../sections/Navbar'
import { Services } from '../sections/Services'
import { Testimonials } from '../sections/Testimonials'
import { VisitUs } from '../sections/VisitUs'

export function HomePage() {
  return (
    <BookingProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Features />
        <Services />
        <Gallery />
        <About />
        <Testimonials />
        <VisitUs />
      </main>
      <Footer />
    </BookingProvider>
  )
}
