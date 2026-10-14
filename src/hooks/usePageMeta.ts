import { useEffect } from 'react'

/**
 * Title, canonical link and og:url for a page other than the homepage (index.html holds the homepage's);
 * restored when the visitor leaves the page.
 */
export function usePageMeta(title: string, path: string) {
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    const previous = { title: document.title, canonical: canonical?.href, ogUrl: ogUrl?.content }
    // Same site address as the homepage's canonical (production domain), so local previews don't leak into it
    const url = new URL(path, canonical?.href ?? window.location.origin).href

    document.title = title
    if (canonical) canonical.href = url
    if (ogUrl) ogUrl.content = url
    return () => {
      document.title = previous.title
      if (canonical && previous.canonical) canonical.href = previous.canonical
      if (ogUrl && previous.ogUrl) ogUrl.content = previous.ogUrl
    }
  }, [title, path])
}
