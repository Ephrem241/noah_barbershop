import { useMemo } from 'react'
import { useGallery, useTestimonials } from '../content/hooks'
import { navLinks } from '../data/site'

/**
 * The homepage sections in the navbar and footer, minus any section that isn't on the page: "Our Work" appears once
 * the gallery has loaded with real photos (so it never flashes in and out), and "Reviews" goes if none are published.
 */
export function useNavLinks() {
  const gallery = useGallery()
  const testimonials = useTestimonials()
  const hasGallery = !gallery.isLoading && gallery.data.length > 0
  const noReviews = !testimonials.isLoading && testimonials.data.length === 0

  return useMemo(
    () =>
      navLinks.filter((link) => {
        if (link.id === 'gallery') return hasGallery
        if (link.id === 'reviews') return !noReviews
        return true
      }),
    [hasGallery, noReviews],
  )
}
