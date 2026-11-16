/**
 * Traffic monitor: counts visits for the main page of each section only. A section with several
 * pages (an article, a profile, a Sci-Brief issue...) is counted once, on its first page.
 * No personal data is stored: only per-day counters.
 */

/** Pages that are counted. Anything else (including sub pages) is ignored. */
export const TRACKED_PAGES = [
  '/',
  '/psychologists',
  '/articles',
  '/sci-brief',
  '/free-session',
  '/booking',
  '/let-there-be-light',
  '/locations',
  '/faq',
] as const

export type TrackedPage = typeof TRACKED_PAGES[number]

export const isTrackedPage = (path: string): path is TrackedPage => (TRACKED_PAGES as readonly string[]).includes(path)

/** "/Psychologists/" -> "/psychologists"; returns null when the page is not tracked. */
export const normalizeTrackedPath = (value: unknown): TrackedPage | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  const path = trimmed === '' ? '/' : trimmed
  return isTrackedPage(path) ? path : null
}

export const BOT_USER_AGENT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|curl|wget|python|axios/i

export interface TrafficRow {
  path: string
  today: number
  last7Days: number
  last30Days: number
  total: number
  sessionsLast30Days: number
  lastVisitAt: string | null
}

export interface TrafficDayRow {
  path: string
  /** YYYY-MM-DD in Asia/Jakarta */
  day: string
  views: number
  sessions: number
  lastVisitAt: string
}

/** The calendar day (YYYY-MM-DD) in Jakarta time, used for the daily counters. */
export const jakartaDay = (now: Date = new Date()): string => new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10)

const shiftDay = (day: string, delta: number): string => {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

/** One row per tracked page (zero rows included) with today / 7 / 30 day / all-time counts. */
export const summarizeTraffic = (rows: readonly TrafficDayRow[], now: Date = new Date()): TrafficRow[] => {
  const today = jakartaDay(now)
  const from7 = shiftDay(today, -6)
  const from30 = shiftDay(today, -29)
  const result = new Map<string, TrafficRow>(
    TRACKED_PAGES.map((path) => [path, { path, today: 0, last7Days: 0, last30Days: 0, total: 0, sessionsLast30Days: 0, lastVisitAt: null }]),
  )
  for (const row of rows) {
    const entry = result.get(row.path)
    if (!entry) continue
    entry.total += row.views
    if (row.day === today) entry.today += row.views
    if (row.day >= from7 && row.day <= today) entry.last7Days += row.views
    if (row.day >= from30 && row.day <= today) {
      entry.last30Days += row.views
      entry.sessionsLast30Days += row.sessions
    }
    if (!entry.lastVisitAt || row.lastVisitAt > entry.lastVisitAt) entry.lastVisitAt = row.lastVisitAt
  }
  return [...result.values()]
}
