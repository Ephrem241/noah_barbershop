/** Up to two initials from a display name, Unicode-aware ("182abreham" → "A", "Yonatan A" → "YA"). */
export function initials(name: string, fallback = 'N') {
  const letters = name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0] ?? '')
    .join('')
  return (letters.slice(0, 2) || fallback).toUpperCase()
}
