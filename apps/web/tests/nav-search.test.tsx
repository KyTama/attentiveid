import { describe, expect, it } from 'vitest'
import { NAV_KEYWORDS, searchNav, type NavSearchItem } from '@/features/dashboard/nav-search'

const item = (to: string, label: string, trail: string[]): NavSearchItem => ({ to, label, trail, keywords: NAV_KEYWORDS[to] ?? '' })
const items = [
  item('/dashboard', 'Overview', []),
  item('/dashboard/landing', 'Landing Content', ['Konten Website']),
  item('/dashboard/share-previews', 'Thumbnail Link', ['Konten Website']),
  item('/dashboard/featured-products', 'Produk Featured', ['Konten Website']),
  item('/dashboard/bookings', 'Reservasi & Booking', ['Operasional']),
  item('/dashboard/articles', 'Articles Management', ['Riset & Publikasi']),
]

describe('searchNav', () => {
  it('finds a menu by its name, best match first', () => {
    expect(searchNav(items, 'book')[0].to).toBe('/dashboard/bookings')
    expect(searchNav(items, 'thumb')[0].to).toBe('/dashboard/share-previews')
  })

  it('finds a menu by words people would use instead of its name', () => {
    expect(searchNav(items, 'whatsapp')[0].to).toBe('/dashboard/share-previews')
    expect(searchNav(items, 'artikel')[0].to).toBe('/dashboard/articles')
    expect(searchNav(items, 'jadwal')[0].to).toBe('/dashboard/bookings')
  })

  it('matches the group name, ignores accents and case, and needs every word to match', () => {
    expect(searchNav(items, 'konten').map((i) => i.to)).toEqual(['/dashboard/landing', '/dashboard/share-previews', '/dashboard/featured-products'])
    expect(searchNav(items, 'BOOKING reservasi')).toHaveLength(1)
    expect(searchNav(items, 'booking zzz')).toEqual([])
    expect(searchNav(items, '   ')).toEqual([])
  })
})
