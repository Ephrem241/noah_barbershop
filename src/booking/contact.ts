/*
 * Contact links for barbers (Call, WhatsApp, Telegram), built only from values that pass validation:
 * every helper returns null for a missing or malformed value, so the site never renders a broken link.
 * No imports on purpose: the tests run this file directly (`npm test`).
 */

const ETHIOPIA = '251'

/**
 * Any common way of writing a phone number → E.164, or null if it isn't a callable number.
 * "+251 94 668 8207", "0946688207", "946688207", "251946688207", "00251…" → "+251946688207".
 * Numbers from other countries need their "+" (or "00") prefix.
 */
export function normalizePhone(raw?: string | null): string | null {
  const value = raw?.trim() ?? ''
  if (!/^\+?[\d\s().-]+$/.test(value)) return null
  let digits = value.replace(/\D/g, '')
  let international = value.startsWith('+')
  if (!international && digits.startsWith('00')) {
    digits = digits.slice(2)
    international = true
  }
  if (!international) {
    if (/^0[1-9]\d{8}$/.test(digits)) digits = ETHIOPIA + digits.slice(1)
    else if (/^[79]\d{8}$/.test(digits)) digits = ETHIOPIA + digits
    else if (!/^251\d{9,10}$/.test(digits)) return null
  }
  // "+251 0946…": the local trunk 0 written after the country code
  if (/^2510\d{9}$/.test(digits)) digits = ETHIOPIA + digits.slice(4)
  if (digits.startsWith(ETHIOPIA)) return /^251[1-9]\d{8}$/.test(digits) ? `+${digits}` : null
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null
}

/** "+251946688207" → "+251 94 668 8207"; other countries stay in E.164. */
export function formatPhone(e164: string) {
  const m = /^\+251(\d{2})(\d{3})(\d{4})$/.exec(e164)
  return m ? `+251 ${m[1]} ${m[2]} ${m[3]}` : e164
}

/** Telegram usernames: 5–32 letters, digits or underscores, starting with a letter and not ending with "_". */
const TELEGRAM_USERNAME = /^[a-z][a-z0-9_]{3,30}[a-z0-9]$/i

/**
 * "noahbarber", "@noahbarber", "t.me/noahbarber", "https://t.me/noahbarber" → "noahbarber".
 * A phone number ("+251 9…", only reachable if the barber allows it in Telegram's privacy settings) → "+2519…".
 */
export function normalizeTelegram(raw?: string | null): string | null {
  const value = (raw?.trim() ?? '')
    .replace(/^(?:https?:\/\/)?(?:www\.)?(?:t|telegram)\.me\//i, '')
    .replace(/^@/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
  // Empty, or a deeper link such as t.me/joinchat/… (group invites aren't a barber's account)
  if (!value || value.includes('/')) return null
  if (/^\+?[\d\s().-]+$/.test(value)) return normalizePhone(value)
  return TELEGRAM_USERNAME.test(value) ? value : null
}

export function telHref(raw?: string | null) {
  const phone = normalizePhone(raw)
  return phone ? `tel:${phone}` : null
}

/** wa.me wants the international number as digits only */
export function whatsappHref(raw: string | null | undefined, message: string) {
  const phone = normalizePhone(raw)
  return phone ? `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(message)}` : null
}

/**
 * https://t.me/<username> is Telegram's universal link: it opens the app on phones that have it, and otherwise a
 * Telegram page offering the app or Telegram Web.
 */
export function telegramHref(raw?: string | null) {
  const contact = normalizeTelegram(raw)
  return contact ? `https://t.me/${contact}` : null
}

/** The WhatsApp opening message; mentions the service picked on the website, if any. */
export function bookingMessage(serviceTitle?: string) {
  const title = serviceTitle?.trim()
  const what = title ? `${/^[aeiou]/i.test(title) ? 'an' : 'a'} ${title}` : 'a haircut'
  return `Hello, I found you on the Noah Barbershop website. I'd like to book ${what}. What dates and times are available?`
}

export type ContactDetails = {
  phoneNumber?: string
  whatsappNumber?: string
  telegramUsername?: string
}

export type ContactLinks = {
  call: { href: string; number: string } | null
  whatsapp: { href: string; number: string } | null
  /** `handle` is "@username", or the formatted number for a phone contact */
  telegram: { href: string; handle: string } | null
}

/** A barber's contact buttons; a method is null when its value is missing or invalid. */
export function contactLinks(details: ContactDetails, serviceTitle?: string): ContactLinks {
  const phone = normalizePhone(details.phoneNumber)
  const whatsapp = normalizePhone(details.whatsappNumber)
  const telegram = normalizeTelegram(details.telegramUsername)
  return {
    call: phone ? { href: `tel:${phone}`, number: formatPhone(phone) } : null,
    whatsapp: whatsapp
      ? {
          href: `https://wa.me/${whatsapp.slice(1)}?text=${encodeURIComponent(bookingMessage(serviceTitle))}`,
          number: formatPhone(whatsapp),
        }
      : null,
    telegram: telegram
      ? { href: `https://t.me/${telegram}`, handle: telegram.startsWith('+') ? formatPhone(telegram) : `@${telegram}` }
      : null,
  }
}
