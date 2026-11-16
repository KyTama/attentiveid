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

import { dailySeries, jakartaDay, summarizeTraffic } from './index'

describe('dailySeries', () => {
  const now = new Date('2026-11-20T10:00:00Z')
  const rows = [
    { path: '/', day: '2026-11-20', views: 5, sessions: 3, lastVisitAt: '2026-11-20T09:00:00Z' },
    { path: '/faq', day: '2026-11-20', views: 2, sessions: 1, lastVisitAt: '2026-11-20T09:00:00Z' },
    { path: '/', day: '2026-11-18', views: 4, sessions: 2, lastVisitAt: '2026-11-18T09:00:00Z' },
    { path: '/', day: '2026-01-01', views: 9, sessions: 9, lastVisitAt: '2026-01-01T09:00:00Z' },
    { path: '/not-tracked', day: '2026-11-20', views: 99, sessions: 9, lastVisitAt: '2026-11-20T09:00:00Z' },
  ]

  it('gives one point per day, oldest first, with empty days at zero and old history outside the window', () => {
    const points = dailySeries(rows, 4, now)
    expect(points.map((point) => point.day)).toEqual(['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'])
    expect(points.map((point) => point.views)).toEqual([0, 4, 0, 7])
  })

  it('can look at a single page', () => {
    expect(dailySeries(rows, 2, now, '/faq').map((point) => point.views)).toEqual([0, 2])
  })
})

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

import { DEFAULT_FLOATING_BAR, mergeSiteSettings, validateBrowserTab, validateFloatingBar } from './index'

describe('site settings', () => {
  it('accepts the default floating bar and keeps three buttons with the lights logo on top', () => {
    const result = validateFloatingBar(DEFAULT_FLOATING_BAR)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.items.map((item) => item.id)).toEqual(['free-session', 'booking', 'personality-test'])
      expect(result.value.top.mode).toBe('image')
    }
  })

  it('supports a text link with an icon on top and rejects bad links, too many buttons and missing text', () => {
    const link = validateFloatingBar({ ...DEFAULT_FLOATING_BAR, top: { ...DEFAULT_FLOATING_BAR.top, mode: 'link', label: { id: 'Coba Attend', en: 'Try Attend' }, icon: 'sun' } })
    expect(link.ok && link.value.top).toMatchObject({ mode: 'link', icon: 'sun' })
    const bad = validateFloatingBar({
      visible: true,
      top: { mode: 'link', label: { id: '' }, url: 'javascript:x' },
      items: [{ label: { id: '' }, url: 'ftp://x' }, ...new Array(4).fill({ label: { id: 'ok' } })],
    })
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(Object.keys(bad.errors).sort()).toEqual(['items', 'items.0.label', 'items.0.url', 'top.label', 'top.url'])
  })

  it('validates the browser tab and falls back to defaults for missing/invalid stored data', () => {
    expect(validateBrowserTab({ titleId: 'A' }).ok).toBe(false)
    const ok = validateBrowserTab({ titleId: 'Attentive.id', faviconUrl: '/media/share/x.png' })
    expect(ok.ok && ok.value.titleEn).toBe('Attentive.id')
    expect(mergeSiteSettings(null).floatingBar.items).toHaveLength(3)
    expect(mergeSiteSettings({ floatingBar: { items: 'nope', top: { mode: 'link', label: {} } } }).floatingBar).toEqual(DEFAULT_FLOATING_BAR)
  })
})
