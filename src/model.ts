import { BookId, WORDS } from './words'

export type Rating = 'forgot' | 'fuzzy' | 'known'
export type Progress = { repetitions: number; dueAt: number | null; mastered: boolean; lastReviewed?: number; reviews: number }
export type DailyStudyLog = { newWordIds: string[]; reviewWordIds: string[]; durationSeconds: number }
export type Settings = { book: BookId; newDaily: number; reviewDaily: number; accent: 'us' | 'uk'; theme: 'system' | 'light' | 'dark'; completedDate: string; completedIds: string[]; newCompletedIds: string[]; streak: number; lastStudyDate: string }
export type State = { settings: Settings; progress: Record<string, Progress>; starred: string[]; studyLogs: Record<string, DailyStudyLog> }
export const DEFAULT_SETTINGS: Settings = { book: 'cet4', newDaily: 15, reviewDaily: 20, accent: 'us', theme: 'system', completedDate: '', completedIds: [], newCompletedIds: [], streak: 0, lastStudyDate: '' }
export const initialState: State = { settings: DEFAULT_SETTINGS, progress: {}, starred: [], studyLogs: {} }
export const todayKey = () => new Date().toISOString().slice(0, 10)
export const getPlan = (state: State) => {
  const today = todayKey(); const { book, newDaily, reviewDaily } = state.settings
  const bookWords = WORDS.filter(w => w.book === book)
  const due = bookWords.filter(w => { const p = state.progress[w.id]; return p && !p.mastered && p.dueAt !== null && p.dueAt <= Date.now() }).sort((a, b) => (state.progress[a.id].dueAt || 0) - (state.progress[b.id].dueAt || 0))
  const done = new Set(state.settings.completedDate === today ? state.settings.completedIds : [])
  const reviews = due.filter(w => !done.has(w.id)).slice(0, reviewDaily)
  const completedNew = state.settings.completedDate === today ? state.settings.newCompletedIds || [] : []
  const hash = (value: string) => [...value].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7)
  const newWords = bookWords.filter(w => !state.progress[w.id] && !done.has(w.id))
    .sort((a, b) => hash(String(today) + String(book) + a.id) - hash(String(today) + String(book) + b.id))
    .slice(0, Math.max(0, newDaily - completedNew.length))
  return { reviews, newWords, dueCount: due.length }
}
export function rateWord(state: State, id: string, rating: Rating): State {
  const isNewWord = !state.progress[id]
  const previous = state.progress[id] || { repetitions: 0, dueAt: Date.now(), mastered: false, reviews: 0 }
  const repetitions = rating === 'forgot' ? 0 : previous.repetitions + 1
  const intervals = rating === 'known' ? [1, 3, 7, 14, 30, 60] : [0.08, 1, 2, 4, 7]
  const mastered = rating === 'known' && repetitions >= 6
  const hours = intervals[Math.min(repetitions, intervals.length - 1)] * 24
  const today = todayKey(); const s = state.settings
  const completedIds = s.completedDate === today ? [...s.completedIds, id] : [id]
  const newCompletedIds = s.completedDate === today ? (s.newCompletedIds || []) : []
  if (!state.progress[id] && !newCompletedIds.includes(id)) newCompletedIds.push(id)
  const log = state.studyLogs[today] || { newWordIds: [], reviewWordIds: [], durationSeconds: 0 }
  const newWordIds = isNewWord && !log.newWordIds.includes(id) ? [...log.newWordIds, id] : log.newWordIds
  const reviewWordIds = !isNewWord && !log.reviewWordIds.includes(id) ? [...log.reviewWordIds, id] : log.reviewWordIds
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const streak = s.lastStudyDate === today ? s.streak : s.lastStudyDate === yesterday.toISOString().slice(0, 10) ? s.streak + 1 : 1
  return { ...state, progress: { ...state.progress, [id]: { repetitions, dueAt: mastered ? null : Date.now() + hours * 3600000, mastered, reviews: previous.reviews + 1, lastReviewed: Date.now() } }, settings: { ...s, completedDate: today, completedIds, newCompletedIds, lastStudyDate: today, streak }, studyLogs: { ...state.studyLogs, [today]: { ...log, newWordIds, reviewWordIds } } }
}
