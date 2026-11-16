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
  const base = {
    theme: 'blue' as const,
    icon: 'sparkles' as const,
    badge: { id: '', en: '' },
    cta: { id: '', en: '' },
  }
  const products: FeaturedProductPublicDto[] = [
    { ...base, id: '1', slug: 'ltbl', title: { id: 'Let There Be Light', en: 'Let There Be Light' }, description: { id: 'Pengalaman', en: 'Experience' }, url: '/let-there-be-light' },
    { ...base, id: '2', slug: 'sw', theme: 'navy', title: { id: 'Your Social World', en: 'Your Social World' }, description: { id: '', en: '' }, url: null },
    {
      id: '3',
      slug: 'free-session',
      theme: 'gold',
      icon: 'gift',
      badge: { id: 'Promo Khusus', en: 'Limited Offer' },
      cta: { id: 'Klaim Sesi Gratis', en: 'Claim Free Session' },
      title: { id: 'First Free Session Consultation', en: 'First Free Session Consultation' },
      description: { id: 'Klaim sesi privat.', en: 'Claim a private session.' },
      url: 'https://free-session.attentiveid.com',
    },
  ]
  const labels = { badge: 'New Product', open: 'Open', comingSoon: 'Coming Soon' }

  it('uses default label and button text when none are set; live cards link, unfinished ones are Coming Soon', () => {
    const cards = featuredProductsToCards(products, false, labels)
    expect(cards[0]).toMatchObject({ id: 'product-ltbl', url: '/let-there-be-light', badge: 'New Product', cta: 'Open', comingSoon: false, description: 'Experience' })
    expect(cards[1]).toMatchObject({ id: 'product-sw', url: '', cta: 'Coming Soon', comingSoon: true, theme: 'navy' })
  })

  it('takes theme, icon, label and button text from the portal, per language', () => {
    expect(featuredProductsToCards(products, false, labels)[2]).toMatchObject({ theme: 'gold', icon: 'gift', badge: 'Limited Offer', cta: 'Claim Free Session' })
    expect(featuredProductsToCards(products, true, labels)[2]).toMatchObject({ badge: 'Promo Khusus', cta: 'Klaim Sesi Gratis' })
    expect(featuredProductsToCards(products, true, labels)[0].description).toBe('Pengalaman')
  })
})
