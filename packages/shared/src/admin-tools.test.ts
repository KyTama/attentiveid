import { describe, expect, it } from 'bun:test'
import {
  featuredProductState,
  normalizeSharePath,
  normalizeTrackedPath,
  validateFeaturedProductInput,
  validateQrCodeInput,
  validateSharePreviewInput,
} from './index'

describe('featured products', () => {
  const valid = { titleId: 'Let there be light', descriptionId: 'Pengalaman', url: '/let-there-be-light' }

  it('accepts a product, derives the slug, and allows no URL (coming soon)', () => {
    const result = validateFeaturedProductInput(valid)
    expect(result.ok && result.value.slug).toBe('let-there-be-light')
    const soon = validateFeaturedProductInput({ titleId: 'Your Social World', url: '' })
    expect(soon.ok && soon.value.url).toBe('')
  })

  it('rejects bad URLs and an end date that is not after the start', () => {
    const result = validateFeaturedProductInput({
      ...valid,
      url: 'javascript:alert(1)',
      startAt: '2026-12-10T00:00:00Z',
      endAt: '2026-12-01T00:00:00Z',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['endAt', 'url'])
  })

  it('defaults the card look and accepts theme, icon, label and button text', () => {
    const plain = validateFeaturedProductInput(valid)
    expect(plain.ok && [plain.value.theme, plain.value.icon, plain.value.badgeId, plain.value.ctaId]).toEqual(['blue', 'sparkles', '', ''])
    const custom = validateFeaturedProductInput({ ...valid, theme: 'gold', icon: 'gift', badgeId: 'Promo Khusus', ctaId: 'Klaim' })
    expect(custom.ok && custom.value).toMatchObject({ theme: 'gold', icon: 'gift', badgeId: 'Promo Khusus', badgeEn: 'Promo Khusus', ctaEn: 'Klaim' })
    const bad = validateFeaturedProductInput({ ...valid, theme: 'pink', icon: 'rocket', badgeId: 'x'.repeat(31) })
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(Object.keys(bad.errors).sort()).toEqual(['badgeEn', 'badgeId', 'icon', 'theme'])
  })

  it('computes disabled / scheduled / active / ended', () => {
    const now = new Date('2026-12-05T00:00:00Z')
    const base = { enabled: true, startAt: null, endAt: null }
    expect(featuredProductState({ ...base, enabled: false }, now)).toBe('disabled')
    expect(featuredProductState({ ...base, startAt: '2026-12-10T00:00:00Z' }, now)).toBe('scheduled')
    expect(featuredProductState({ ...base, endAt: '2026-12-01T00:00:00Z' }, now)).toBe('ended')
    expect(featuredProductState({ ...base, startAt: '2026-12-01T00:00:00Z', endAt: '2026-12-31T00:00:00Z' }, now)).toBe('active')
    expect(featuredProductState(base, now)).toBe('active')
  })
})

describe('share previews', () => {
  it('normalises paths and refuses private areas', () => {
    expect(normalizeSharePath('/Free-Session/?x=1')).toBe('/free-session')
    expect(normalizeSharePath('/')).toBe('/')
    expect(normalizeSharePath('free-session')).toBeNull()
    expect(normalizeSharePath('/dashboard/users')).toBeNull()
    expect(normalizeSharePath('/api/x')).toBeNull()
  })

  it('needs something to show and a safe image URL', () => {
    expect(validateSharePreviewInput({ path: '/free-session' }).ok).toBe(false)
    expect(validateSharePreviewInput({ path: '/free-session', title: 'Sesi Gratis', imageUrl: 'http://x.com/a.jpg' }).ok).toBe(false)
    const ok = validateSharePreviewInput({ path: '/free-session', title: 'Sesi Gratis', imageUrl: '/media/a.jpg' })
    expect(ok.ok && ok.value.path).toBe('/free-session')
  })
})

describe('traffic paths', () => {
  it('counts only main pages', () => {
    expect(normalizeTrackedPath('/Psychologists/')).toBe('/psychologists')
    expect(normalizeTrackedPath('/psychologists/ella')).toBeNull()
    expect(normalizeTrackedPath('/articles/some-article')).toBeNull()
    expect(normalizeTrackedPath('/')).toBe('/')
    expect(normalizeTrackedPath(5)).toBeNull()
  })
})

describe('qr codes', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo='
  it('accepts a saved design and rejects a bad URL, colour or logo', () => {
    expect(validateQrCodeInput({ name: 'Poster', targetUrl: 'https://attentiveid.com/free-session', logoDataUrl: png }).ok).toBe(true)
    const bad = validateQrCodeInput({ name: 'P', targetUrl: 'ftp://x', foreground: 'red', logoDataUrl: 'data:text/html;base64,AAAA', logoScale: 0.9 })
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(Object.keys(bad.errors).sort()).toEqual(['foreground', 'logoDataUrl', 'logoScale', 'name', 'targetUrl'])
  })
})

import { jakartaDay, summarizeTraffic } from './index'

describe('summarizeTraffic', () => {
  it('sums today, 7, 30 days and total per tracked page, including zero rows', () => {
    const now = new Date('2026-11-20T10:00:00Z')
    expect(jakartaDay(new Date('2026-11-20T20:00:00Z'))).toBe('2026-11-21')
    const rows = [
      { path: '/', day: '2026-11-20', views: 5, sessions: 3, lastVisitAt: '2026-11-20T09:00:00Z' },
      { path: '/', day: '2026-11-15', views: 2, sessions: 1, lastVisitAt: '2026-11-15T09:00:00Z' },
      { path: '/', day: '2026-10-01', views: 10, sessions: 6, lastVisitAt: '2026-10-01T09:00:00Z' },
      { path: '/not-tracked', day: '2026-11-20', views: 99, sessions: 9, lastVisitAt: '2026-11-20T09:00:00Z' },
    ]
    const result = summarizeTraffic(rows, now)
    const home = result.find((row) => row.path === '/')!
    expect(home).toMatchObject({ today: 5, last7Days: 7, last30Days: 7, total: 17, sessionsLast30Days: 4, lastVisitAt: '2026-11-20T09:00:00Z' })
    expect(result.find((row) => row.path === '/faq')!.total).toBe(0)
    expect(result.some((row) => row.path === '/not-tracked')).toBe(false)
  })
})
