import { describe, expect, it } from 'vitest'
import type { FeaturedProductPublicDto, TrafficRow } from '@attentiveid/shared'
import { featuredProductsToCards } from '@/features/featured/cards'
import { emptyTrafficFilters, filterAndSortTraffic } from '@/features/admin-tools/traffic-table'

const row = (path: string, today: number, total: number): TrafficRow => ({
  path,
  today,
  last7Days: today,
  last30Days: total,
  total,
  sessionsLast30Days: 0,
  lastVisitAt: null,
})

describe('traffic table', () => {
  const rows = [row('/', 5, 100), row('/psychologists', 20, 50), row('/faq', 0, 3)]

  it('sorts by a column in both directions', () => {
    const byTotal = filterAndSortTraffic(rows, emptyTrafficFilters(), 'total', 'desc').map((r) => r.path)
    expect(byTotal).toEqual(['/', '/psychologists', '/faq'])
    const byToday = filterAndSortTraffic(rows, emptyTrafficFilters(), 'today', 'asc').map((r) => r.path)
    expect(byToday).toEqual(['/faq', '/', '/psychologists'])
  })

  it('searches by page name or path and filters by header minimums', () => {
    expect(filterAndSortTraffic(rows, { ...emptyTrafficFilters(), search: 'psikolog' }, 'total', 'desc').map((r) => r.path)).toEqual(['/psychologists'])
    expect(filterAndSortTraffic(rows, { ...emptyTrafficFilters(), search: 'faq' }, 'total', 'desc')).toHaveLength(1)
    expect(filterAndSortTraffic(rows, { ...emptyTrafficFilters(), minToday: 5 }, 'total', 'desc').map((r) => r.path)).toEqual(['/', '/psychologists'])
    expect(filterAndSortTraffic(rows, { ...emptyTrafficFilters(), page: 'beranda', minTotal: 200 }, 'total', 'desc')).toEqual([])
  })
})

describe('Featured products in the campaign strip', () => {
  const products: FeaturedProductPublicDto[] = [
    { id: '1', slug: 'ltbl', title: { id: 'Let There Be Light', en: 'Let There Be Light' }, description: { id: 'Pengalaman', en: 'Experience' }, url: '/let-there-be-light' },
    { id: '2', slug: 'sw', title: { id: 'Your Social World', en: 'Your Social World' }, description: { id: '', en: '' }, url: null },
  ]
  const labels = { badge: 'New Product', open: 'Open', comingSoon: 'Coming Soon' }

  it('turns products into cards: live ones link, unfinished ones are Coming Soon', () => {
    const cards = featuredProductsToCards(products, false, labels)
    expect(cards).toHaveLength(2)
    expect(cards[0]).toMatchObject({ id: 'product-ltbl', url: '/let-there-be-light', cta: 'Open', comingSoon: false, description: 'Experience' })
    expect(cards[1]).toMatchObject({ id: 'product-sw', url: '', cta: 'Coming Soon', comingSoon: true })
  })

  it('uses the Indonesian text and skips a product whose page the strip already has', () => {
    expect(featuredProductsToCards(products, true, labels)[0].description).toBe('Pengalaman')
    const cards = featuredProductsToCards(products, false, labels, ['/let-there-be-light'])
    expect(cards.map((card) => card.id)).toEqual(['product-sw'])
  })
})
