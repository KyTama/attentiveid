import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { FeaturedProductPublicDto, TrafficRow } from '@attentiveid/shared'
import '@/i18n'
import { FeaturedMenu } from '@/components/landing/FeaturedMenu'
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

describe('Featured menu', () => {
  const products: FeaturedProductPublicDto[] = [
    { id: '1', slug: 'ltbl', title: { id: 'Let There Be Light', en: 'Let There Be Light' }, description: { id: '', en: '' }, url: '/let-there-be-light' },
    { id: '2', slug: 'sw', title: { id: 'Your Social World', en: 'Your Social World' }, description: { id: '', en: '' }, url: null },
  ]

  it('lists products, linking live ones and marking the unfinished one as coming soon', () => {
    render(
      <MemoryRouter>
        <FeaturedMenu products={products} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /unggulan|featured/i }))
    expect(screen.getByRole('link', { name: 'Let There Be Light' })).toHaveAttribute('href', '/let-there-be-light')
    expect(screen.queryByRole('link', { name: /your social world/i })).not.toBeInTheDocument()
    expect(screen.getByText('Your Social World')).toBeInTheDocument()
    expect(screen.getByText(/segera hadir|coming soon/i)).toBeInTheDocument()
  })

  it('renders nothing when no product is featured right now', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedMenu products={[]} />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
