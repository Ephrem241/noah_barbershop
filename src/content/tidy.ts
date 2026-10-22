/*
 * Light, lossless tidying of text typed in /admin, applied where the website reads it. Spelling isn't touched:
 * the owner fixes that in /admin.
 * No imports on purpose: the tests run this file directly (`npm test`).
 */

/** "hair  cut " → "Hair cut": spaces collapsed, first letter capitalised. */
export function tidyTitle(value: string) {
  const text = value.replace(/\s+/g, ' ').trim()
  return text.charAt(0).toLocaleUpperCase('en-US') + text.slice(1)
}

/** ["Scissors, fades", "Haircut"] → ["Scissors", "fades", "Haircut"]: comma-joined entries split, blanks and repeats dropped. */
export function splitList(values: readonly string[]) {
  const items = values.flatMap((v) => v.split(',')).map((v) => v.replace(/\s+/g, ' ').trim())
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.toLowerCase()
    if (!item || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** ">10" or "10+" → "10+ years", "6" → "6 years", "1" → "1 year"; anything already worded is kept as typed. */
export function formatExperience(value: string) {
  const text = value.trim()
  const atLeast = /^(?:>\s*(\d+)|(\d+)\s*\+)$/.exec(text)
  if (atLeast) return `${atLeast[1] ?? atLeast[2]}+ years`
  const exact = /^(\d+)$/.exec(text)
  if (exact) return `${exact[1]} ${exact[1] === '1' ? 'year' : 'years'}`
  return text
}
