// Tidying of admin-entered text (src/content/tidy.ts). Run with `npm test`.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { formatExperience, splitList, tidyTitle } from '../src/content/tidy.ts'

describe('tidyTitle', () => {
  test('collapses spaces and capitalises the first letter only', () => {
    assert.equal(tidyTitle('hair cut'), 'Hair cut')
    assert.equal(tidyTitle('hair  Treatment '), 'Hair Treatment')
    assert.equal(tidyTitle('  color'), 'Color')
    assert.equal(tidyTitle('Nose And Ear Hair waxing'), 'Nose And Ear Hair waxing')
    assert.equal(tidyTitle(''), '')
  })
})

describe('splitList', () => {
  test('splits comma-joined entries into separate items', () => {
    assert.deepEqual(splitList(['Scissors, fades']), ['Scissors', 'fades'])
    assert.deepEqual(splitList(['Haircut,beard grooming, razor cut']), ['Haircut', 'beard grooming', 'razor cut'])
    assert.deepEqual(splitList(['Amharic, English, somali, afan oromo', 'Tigrigna']), [
      'Amharic',
      'English',
      'somali',
      'afan oromo',
      'Tigrigna',
    ])
  })

  test('drops blanks and repeats, keeping the first spelling', () => {
    assert.deepEqual(splitList(['Amharic , English', 'english', ' ', 'Fades,,']), ['Amharic', 'English', 'Fades'])
    assert.deepEqual(splitList([]), [])
  })
})

describe('formatExperience', () => {
  test('words bare numbers as years', () => {
    assert.equal(formatExperience('>10'), '10+ years')
    assert.equal(formatExperience('> 3'), '3+ years')
    assert.equal(formatExperience('8+'), '8+ years')
    assert.equal(formatExperience('6'), '6 years')
    assert.equal(formatExperience('1'), '1 year')
  })

  test('keeps experience that is already worded', () => {
    assert.equal(formatExperience('6 years'), '6 years')
    assert.equal(formatExperience('6 years experience'), '6 years experience')
    assert.equal(formatExperience(' Since 2015 '), 'Since 2015')
  })
})
