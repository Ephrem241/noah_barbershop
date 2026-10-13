import { BookingProvider } from '../booking/BookingProvider'
import { StickyBookingBar } from '../components/StickyBookingBar'
import { About } from '../sections/About'
import { Barbers } from '../sections/Barbers'
import { Booking } from '../sections/Booking'
import { Footer } from '../sections/Footer'
import { Gallery } from '../sections/Gallery'
import { Hero } from '../sections/Hero'
import { Navbar } from '../sections/Navbar'
import { Services } from '../sections/Services'
import { Testimonials } from '../sections/Testimonials'
import { Trust } from '../sections/Trust'
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
        <Trust />
        <Services />
        <Gallery />
        <Barbers />
        <About />
        <Testimonials />
        <Booking />
        <VisitUs />
      </main>
      <Footer />
      <StickyBookingBar />
    </BookingProvider>
  )
}
