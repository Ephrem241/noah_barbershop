/** "Skin Fade / Taper Fade" → "skin-fade-taper-fade": URL-safe, accents dropped, at most 40 characters. */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
