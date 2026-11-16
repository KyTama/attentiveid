import type { TrafficRow } from '@attentiveid/shared'

export type TrafficSortKey = 'path' | 'today' | 'last7Days' | 'last30Days' | 'total' | 'sessionsLast30Days' | 'lastVisitAt'

export interface TrafficFilters {
  /** Global search over the page name and path. */
  search: string
  /** Per-column header filters: text for the page, minimum numbers for the counts. */
  page: string
  minToday: number | null
  minLast7Days: number | null
  minLast30Days: number | null
  minTotal: number | null
}

export const emptyTrafficFilters = (): TrafficFilters => ({
  search: '',
  page: '',
  minToday: null,
  minLast7Days: null,
  minLast30Days: null,
  minTotal: null,
})

export const PAGE_LABELS: Record<string, string> = {
  '/': 'Beranda',
  '/psychologists': 'Psikolog',
  '/articles': 'Artikel',
  '/sci-brief': 'Sci-Brief',
  '/free-session': 'Sesi Gratis',
  '/booking': 'Booking',
  '/let-there-be-light': 'Let There Be Light',
  '/locations': 'Lokasi',
  '/faq': 'Tanya Jawab',
}

export const PAGE_LABELS_EN: Record<string, string> = {
  '/': 'Home',
  '/psychologists': 'Psychologists',
  '/articles': 'Articles',
  '/sci-brief': 'Sci-Brief',
  '/free-session': 'Free Session',
  '/booking': 'Booking',
  '/let-there-be-light': 'Let There Be Light',
  '/locations': 'Locations',
  '/faq': 'FAQ',
}

export const pageLabel = (path: string, english = false) => (english ? PAGE_LABELS_EN : PAGE_LABELS)[path] ?? path

const matches = (row: TrafficRow, filters: TrafficFilters): boolean => {
  const haystack = `${pageLabel(row.path)} ${pageLabel(row.path, true)} ${row.path}`.toLowerCase()
  if (filters.search.trim() && !haystack.includes(filters.search.trim().toLowerCase())) return false
  if (filters.page.trim() && !haystack.includes(filters.page.trim().toLowerCase())) return false
  if (filters.minToday !== null && row.today < filters.minToday) return false
  if (filters.minLast7Days !== null && row.last7Days < filters.minLast7Days) return false
  if (filters.minLast30Days !== null && row.last30Days < filters.minLast30Days) return false
  if (filters.minTotal !== null && row.total < filters.minTotal) return false
  return true
}

export function filterAndSortTraffic(
  rows: readonly TrafficRow[],
  filters: TrafficFilters,
  sortKey: TrafficSortKey,
  direction: 'asc' | 'desc',
): TrafficRow[] {
  const factor = direction === 'asc' ? 1 : -1
  return rows
    .filter((row) => matches(row, filters))
    .sort((a, b) => {
      if (sortKey === 'path') return factor * pageLabel(a.path).localeCompare(pageLabel(b.path), 'id')
      if (sortKey === 'lastVisitAt') return factor * (a.lastVisitAt ?? '').localeCompare(b.lastVisitAt ?? '')
      return factor * (a[sortKey] - b[sortKey])
    })
}
