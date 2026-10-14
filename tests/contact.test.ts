// Barber contact links (src/booking/contact.ts) and service links (src/utils/slug.ts). Run with `npm test`.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  bookingMessage,
  contactLinks,
  formatPhone,
  normalizePhone,
  normalizeTelegram,
  telegramHref,
  telHref,
  whatsappHref,
} from '../src/booking/contact.ts'
import { slugify } from '../src/utils/slug.ts'

const DEFAULT_MESSAGE =
  "Hello, I found you on the Noah Barbershop website. I'd like to book a haircut. What dates and times are available?"

describe('normalizePhone', () => {
  test('accepts Ethiopian numbers written in any common way', () => {
    for (const raw of [
      '+251 94 668 8207',
      '+251946688207',
      '+251-94-668-8207',
      '+251 (94) 668 8207',
      '0946688207',
      '094 668 8207',
      '946688207',
      '251946688207',
      '00251946688207',
      '00 251 94 668 8207',
      '+251 0946688207',
      '  +251 94 668 8207  ',
    ]) {
      assert.equal(normalizePhone(raw), '+251946688207', raw)
    }
  })

  test('accepts Safaricom (07…) mobiles and Addis landlines', () => {
    assert.equal(normalizePhone('0711 223 344'), '+251711223344')
    assert.equal(normalizePhone('011 551 2345'), '+251115512345')
  })

  test('accepts other countries in international format', () => {
    assert.equal(normalizePhone('+1 415 555 2671'), '+14155552671')
    assert.equal(normalizePhone('0044 20 7946 0958'), '+442079460958')
  })

  test('rejects anything that is not a callable number', () => {
    for (const raw of [
      undefined,
      null,
      '',
      '   ',
      '12345',
      '+12345',
      '+251 94 668 820', // one digit short
      '+251 94 668 82071', // one digit too many
      '+251 04 668 8207', // no Ethiopian number starts with 0 after the code
      '0946 ABC 207',
      '094668820x',
      'call me',
      '4155552671', // a foreign number without its +country code
      '+0 123 456 789',
    ]) {
      assert.equal(normalizePhone(raw), null, String(raw))
    }
  })

  test('formatPhone groups Ethiopian numbers and leaves others in E.164', () => {
    assert.equal(formatPhone('+251946688207'), '+251 94 668 8207')
    assert.equal(formatPhone('+14155552671'), '+14155552671')
  })
})

describe('telHref', () => {
  test('builds tel:+COUNTRYCODEPHONENUMBER', () => {
    assert.equal(telHref('0946 688 207'), 'tel:+251946688207')
    assert.equal(telHref('+251 94 668 8207'), 'tel:+251946688207')
  })

  test('returns null instead of a broken link', () => {
    assert.equal(telHref(''), null)
    assert.equal(telHref(undefined), null)
    assert.equal(telHref('12'), null)
  })
})

describe('whatsappHref', () => {
  test('uses the international number as digits only, with the message encoded', () => {
    assert.equal(
      whatsappHref('+251 94 668 8207', 'Hi there'),
      'https://wa.me/251946688207?text=Hi%20there',
    )
    assert.equal(whatsappHref('0911 22 33 44', 'x'), 'https://wa.me/251911223344?text=x')
  })

  test('returns null instead of a broken link', () => {
    assert.equal(whatsappHref('', 'x'), null)
    assert.equal(whatsappHref('not a number', 'x'), null)
  })
})

describe('Telegram', () => {
  test('accepts a username typed in any common way', () => {
    for (const raw of [
      'noahbarber',
      '@noahbarber',
      ' @noahbarber ',
      't.me/noahbarber',
      'https://t.me/noahbarber',
      'http://t.me/noahbarber/',
      'https://telegram.me/noahbarber',
      'https://www.t.me/noahbarber?start=1',
    ]) {
      assert.equal(normalizeTelegram(raw), 'noahbarber', raw)
      assert.equal(telegramHref(raw), 'https://t.me/noahbarber', raw)
    }
    assert.equal(telegramHref('@Noah_Barber_1'), 'https://t.me/Noah_Barber_1')
  })

  test('accepts a phone number contact', () => {
    assert.equal(telegramHref('+251 94 668 8207'), 'https://t.me/+251946688207')
    assert.equal(telegramHref('https://t.me/+251946688207'), 'https://t.me/+251946688207')
  })

  test('rejects values that would not open a barber’s account', () => {
    for (const raw of [
      undefined,
      '',
      '@',
      'abcd', // too short
      'a'.repeat(33), // too long
      '1noah', // starts with a digit
      '_noah', // starts with an underscore
      'noahbarber_', // ends with an underscore
      'noah barber',
      'noah-barber',
      'noah.barber',
      't.me/joinchat/AbCdEf', // a group invite
      'https://t.me/+AbCdEf123', // a private invite link
      'https://t.me/',
      '+251 94', // not a full number
    ]) {
      assert.equal(normalizeTelegram(raw), null, String(raw))
      assert.equal(telegramHref(raw), null, String(raw))
    }
  })
})

describe('bookingMessage', () => {
  test('is the agreed opening message by default', () => {
    assert.equal(bookingMessage(), DEFAULT_MESSAGE)
    assert.equal(bookingMessage('  '), DEFAULT_MESSAGE)
  })

  test('names the service picked on the website', () => {
    assert.equal(
      bookingMessage('Skin Fade / Taper Fade'),
      "Hello, I found you on the Noah Barbershop website. I'd like to book a Skin Fade / Taper Fade. What dates and times are available?",
    )
    assert.match(bookingMessage('Eyebrow Shaping'), /book an Eyebrow Shaping\./)
  })
})

describe('contactLinks', () => {
  const all = { phoneNumber: '0946688207', whatsappNumber: '+251 91 122 3344', telegramUsername: '@noahbarber' }

  test('builds all three links from valid details', () => {
    const links = contactLinks(all)
    assert.deepEqual(links.call, { href: 'tel:+251946688207', number: '+251 94 668 8207' })
    assert.deepEqual(links.whatsapp, {
      href: `https://wa.me/251911223344?text=${encodeURIComponent(DEFAULT_MESSAGE)}`,
      number: '+251 91 122 3344',
    })
    assert.deepEqual(links.telegram, { href: 'https://t.me/noahbarber', handle: '@noahbarber' })
  })

  test('puts the selected service in the WhatsApp message only', () => {
    const links = contactLinks(all, 'Beard Design & Line-up')
    const text = new URL(links.whatsapp!.href).searchParams.get('text')
    assert.equal(
      text,
      "Hello, I found you on the Noah Barbershop website. I'd like to book a Beard Design & Line-up. What dates and times are available?",
    )
    assert.equal(links.call!.href, 'tel:+251946688207')
    assert.equal(links.telegram!.href, 'https://t.me/noahbarber')
  })

  test('leaves out every missing or invalid method', () => {
    const keys = ['phoneNumber', 'whatsappNumber', 'telegramUsername'] as const
    const methods = ['call', 'whatsapp', 'telegram'] as const
    // Every combination of present / missing / invalid values
    const variants = [undefined, '', 'invalid!'] as const
    for (let mask = 0; mask < 8; mask++) {
      for (const bad of variants) {
        const details = Object.fromEntries(keys.map((k, i) => [k, mask & (1 << i) ? all[k] : bad]))
        const links = contactLinks(details)
        methods.forEach((m, i) => {
          assert.equal(links[m] !== null, Boolean(mask & (1 << i)), `${m} with ${JSON.stringify(details)}`)
        })
      }
    }
  })

  test('shows a phone-number Telegram contact as a formatted number', () => {
    assert.deepEqual(contactLinks({ telegramUsername: '0946688207' }).telegram, {
      href: 'https://t.me/+251946688207',
      handle: '+251 94 668 8207',
    })
  })
})

describe('service links', () => {
  test('slugify makes readable, URL-safe service ids', () => {
    assert.equal(slugify('Skin Fade / Taper Fade'), 'skin-fade-taper-fade')
    assert.equal(slugify('Premium Men’s Haircut'), 'premium-men-s-haircut')
    assert.equal(slugify('Beard Design & Line-up'), 'beard-design-line-up')
    assert.equal(slugify('  Café Crème  '), 'cafe-creme')
  })
})
