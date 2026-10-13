/** "+251 94 668 8207" → "+251946688207" */
const compact = (phone: string) => phone.replace(/[^\d+]/g, '')

export const telHref = (phone: string) => `tel:${compact(phone)}`

export function whatsappHref(phone: string, message: string) {
  return `https://wa.me/${compact(phone).replace('+', '')}?text=${encodeURIComponent(message)}`
}

/** Accepts a username ("noahbarber", "@noahbarber") or a phone number ("+251911223344"). */
export function telegramHref(value: string) {
  const v = value.trim()
  if (/^\+?[\d\s()-]+$/.test(v)) return `https://t.me/+${compact(v).replace('+', '')}`
  return `https://t.me/${v.replace(/^@/, '')}`
}

export const bookingMessage = (barberName: string) =>
  `Hi ${barberName}, I'd like to book an appointment at Noah Barbershop.`
