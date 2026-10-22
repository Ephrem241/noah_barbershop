// Supabase addresses built without the client (src/lib/supabaseUrls.ts). Run with `npm test`.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { isStoragePath, publicUrl, resizedSrcSetFor, resizedUrl, restUrl } from '../src/lib/supabaseUrls.ts'

const BASE = 'https://abc.supabase.co'

describe('storage media', () => {
  test('tells uploads from files that ship with the site', () => {
    assert.equal(isStoragePath('barbers/1/portrait.webp'), true)
    assert.equal(isStoragePath('/images/gallery-1.jpg'), false)
    assert.equal(isStoragePath('https://example.com/a.jpg'), false)
  })

  test('public address matches supabase-js getPublicUrl', () => {
    assert.equal(publicUrl(BASE, 'barbers/1/a b.jpg'), 'https://abc.supabase.co/storage/v1/object/public/media/barbers/1/a%20b.jpg')
  })

  test('resized copies go through the render endpoint', () => {
    assert.equal(
      resizedUrl(BASE, 'barbers/1/p.jpg', 640),
      'https://abc.supabase.co/storage/v1/render/image/public/media/barbers/1/p.jpg?width=640&quality=75',
    )
    assert.equal(
      resizedSrcSetFor(BASE, 'p.jpg', [400, 960]),
      `${BASE}/storage/v1/render/image/public/media/p.jpg?width=400&quality=75 400w, ` +
        `${BASE}/storage/v1/render/image/public/media/p.jpg?width=960&quality=75 960w`,
    )
  })
})

describe('restUrl', () => {
  test('puts the key in the query string (no headers, so no CORS preflight)', () => {
    assert.equal(
      restUrl(BASE, 'sb_publishable_x+y', 'services?select=*&is_active=eq.true'),
      `${BASE}/rest/v1/services?select=*&is_active=eq.true&apikey=sb_publishable_x%2By`,
    )
    assert.equal(restUrl(BASE, 'k', 'services'), `${BASE}/rest/v1/services?apikey=k`)
  })
})
