import cet4Data from '../assets/wordbooks/cet4.json'
import cet6Data from '../assets/wordbooks/cet6.json'
import greData from '../assets/wordbooks/gre.json'
import ieltsData from '../assets/wordbooks/ielts.json'
import dailyData from '../assets/wordbooks/daily.json'
import businessData from '../assets/wordbooks/business.json'
import travelData from '../assets/wordbooks/travel.json'
import technologyData from '../assets/wordbooks/technology.json'

export type BookId = 'cet4' | 'cet6' | 'gre' | 'ielts' | 'daily' | 'business' | 'travel' | 'technology'
export type Word = { id: string; book: BookId; word: string; phonetic: string; partOfSpeech: string; meaning: string; example: string; translation: string }
export type WordBookData = { id: BookId; title: string; shortTitle: string; description: string; words: Word[] }

type RawWordBook = Omit<WordBookData, 'id' | 'words'> & { id: string; words: (Omit<Word, 'book'> & { book: string })[] }
const bookIds: BookId[] = ['cet4', 'cet6', 'gre', 'ielts', 'daily', 'business', 'travel', 'technology']
const isBookId = (id: string): id is BookId => bookIds.some(bookId => bookId === id)

function validateWordBook(data: RawWordBook): WordBookData {
  if (!isBookId(data.id)) throw new Error(`Unknown word book id: ${data.id}`)
  const words = data.words.map(word => {
    if (!isBookId(word.book) || word.book !== data.id) throw new Error(`Word ${word.id} has an invalid book id`)
    return { ...word, book: word.book }
  })
  return { ...data, id: data.id, words }
}

export const WORD_BOOKS: WordBookData[] = [cet4Data, cet6Data, greData, ieltsData, dailyData, businessData, travelData, technologyData].map(validateWordBook)
export const WORDS: Word[] = WORD_BOOKS.flatMap(book => book.words)
export const getWordBook = (id: BookId) => WORD_BOOKS.find(book => book.id === id)!
