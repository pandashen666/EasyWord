const assert = require('node:assert/strict')
const { test } = require('node:test')

const books = [
  require('../assets/wordbooks/cet4.json'),
  require('../assets/wordbooks/cet6.json'),
  require('../assets/wordbooks/gre.json'),
  require('../assets/wordbooks/ielts.json'),
  require('../assets/wordbooks/daily.json'),
]

test('all five word books have stable ids and valid word records', () => {
  assert.deepEqual(books.map(book => book.id), ['cet4', 'cet6', 'gre', 'ielts', 'daily'])
  const ids = new Set()

  for (const book of books) {
    assert.ok(book.title)
    assert.ok(book.description)
    for (const word of book.words) {
      assert.equal(word.book, book.id)
      assert.ok(word.id.startsWith(`${book.id}-`))
      assert.ok(word.word)
      assert.ok(word.partOfSpeech)
      assert.ok(word.meaning)
      assert.ok(word.example)
      assert.ok(word.translation)
      assert.ok(!ids.has(word.id), `duplicate word id: ${word.id}`)
      ids.add(word.id)
    }
  }
})

test('existing sample word ids remain intact for saved progress', () => {
  const ids = new Set(books.flatMap(book => book.words.map(word => word.id)))
  for (const id of [
    'cet4-abandon', 'cet4-absorb', 'cet4-achieve', 'cet4-adapt', 'cet4-benefit',
    'cet4-challenge', 'cet4-complex', 'cet4-evidence', 'cet4-focus', 'cet4-improve',
    'cet6-abstract', 'cet6-advocate', 'cet6-consensus', 'cet6-diminish', 'cet6-inevitable',
    'cet6-integrity', 'cet6-notion', 'cet6-substantial', 'cet6-sustain', 'cet6-undermine',
  ]) assert.ok(ids.has(id), `missing existing word id: ${id}`)
})
