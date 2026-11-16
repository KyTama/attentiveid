import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import type { QrCodeDto, TrafficDayRow, UserDto } from '@attentiveid/shared'
import { createTokenService } from '../security/token-service'
import { buildSharePreviewHtml, createAdminToolsRoutes } from './admin-tools.routes'
import type { AdminToolsRepository } from '../repositories/admin-tools.repository'

const secret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security'
const tokenService = createTokenService({ jwtSecret: secret })

const user = (role: UserDto['role'], id: string, email: string): UserDto => ({
  id, email, name: id, role, status: 'active', psychologistId: null, lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
})
const owner = user('admin', 'owner', 'nico.alex.ha@gmail.com')
const otherAdmin = user('admin', 'other', 'admin@attentive.id')
const otherSuper = user('superadmin', 'super', 'super@attentive.id')
const users = new Map([owner, otherAdmin, otherSuper].map((u) => [u.id, u]))
const userRepository = { findById: async (id: string) => users.get(id) ?? null }

const bearer = (u: UserDto) => ({
  authorization: `Bearer ${tokenService.issueAccessToken(u).accessToken}`,
})

const NOW = new Date('2026-12-05T00:00:00Z')

const makeRepository = () => {
  const views: Array<{ path: string; newSession: boolean }> = []
  const qr: QrCodeDto[] = []
  const rows: TrafficDayRow[] = [{ path: '/', day: '2026-12-05', views: 4, sessions: 2, lastVisitAt: '2026-12-05T01:00:00Z' }]
  const repository = {
    listActiveFeatured: async () => [{ id: '1', slug: 'ltbl', title: { id: 'LTBL', en: 'LTBL' }, description: { id: '', en: '' }, theme: 'blue', icon: 'sparkles', badge: { id: '', en: '' }, cta: { id: '', en: '' }, url: '/let-there-be-light' }],
    getSharePreview: async (path: string) => (path === '/free-session' ? { id: 'p', path, title: 'Sesi "Gratis"', description: 'Isi', imageUrl: '/media/x.jpg', updatedAt: 'x' } : null),
    recordPageView: async (path: string, newSession: boolean) => { views.push({ path, newSession }) },
    listTrafficRows: async () => rows,
    listQrCodes: async () => qr,
    createQrCode: async (input: any) => { const dto = { ...input, id: 'qr1', createdAt: 'x', updatedAt: 'x' }; qr.push(dto); return dto },
  } as unknown as AdminToolsRepository
  return { repository, views, qr }
}

const makeApp = (repository: AdminToolsRepository) =>
  new Elysia().use(createAdminToolsRoutes({ tokenService, userRepository, repository, siteOrigin: 'https://attentiveid.com', now: () => NOW }))

describe('public endpoints', () => {
  it('lists active featured products', async () => {
    const { repository } = makeRepository()
    const response = await makeApp(repository).handle(new Request('http://localhost/api/content/featured-products'))
    const json = await response.json()
    expect(json.products[0].url).toBe('/let-there-be-light')
    expect(JSON.stringify(json)).not.toContain('startAt')
  })

  it('counts main pages only and ignores bots and sub pages', async () => {
    const { repository, views } = makeRepository()
    const app = makeApp(repository)
    const post = (body: unknown, agent: string) =>
      app.handle(new Request('http://localhost/api/content/track', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': agent }, body: JSON.stringify(body) }))
    await post({ path: '/psychologists', newSession: true }, 'Mozilla/5.0 Chrome')
    await post({ path: '/psychologists/ella' }, 'Mozilla/5.0 Chrome')
    await post({ path: '/' }, 'Googlebot/2.1')
    expect(views).toEqual([{ path: '/psychologists', newSession: true }])
  })

  it('renders escaped meta tags for the page, with the default image as fallback', async () => {
    const { repository } = makeRepository()
    const app = makeApp(repository)
    const custom = await (await app.handle(new Request('http://localhost/api/content/share-html?path=/free-session'))).text()
    expect(custom).toContain('og:title" content="Sesi &quot;Gratis&quot;"')
    expect(custom).toContain('og:image" content="https://attentiveid.com/media/x.jpg"')
    const fallback = buildSharePreviewHtml('https://attentiveid.com/', '/faq', null)
    expect(fallback).toContain('https://attentiveid.com/images/og-attentive-logo.jpg')
  })
})

describe('owner-only tools', () => {
  it('serves traffic and QR codes only to the owner account', async () => {
    const { repository } = makeRepository()
    const app = makeApp(repository)
    const get = (path: string, headers: Record<string, string> = {}) => app.handle(new Request(`http://localhost${path}`, { headers }))

    expect((await get('/api/admin/traffic')).status).toBe(401)
    expect((await get('/api/admin/traffic', bearer(otherAdmin))).status).toBe(403)
    expect((await get('/api/admin/traffic', bearer(otherSuper))).status).toBe(403)
    expect((await get('/api/admin/qr-codes', bearer(otherAdmin))).status).toBe(403)

    const ok = await get('/api/admin/traffic', bearer(owner))
    expect(ok.status).toBe(200)
    const json = await ok.json()
    expect(json.rows.find((row: any) => row.path === '/').today).toBe(4)
  })

  it('lets the owner save a valid QR code and rejects an invalid one', async () => {
    const { repository } = makeRepository()
    const app = makeApp(repository)
    const post = (body: unknown) =>
      app.handle(new Request('http://localhost/api/admin/qr-codes', { method: 'POST', headers: { ...bearer(owner), 'content-type': 'application/json' }, body: JSON.stringify(body) }))
    expect((await post({ name: 'Poster', targetUrl: 'https://attentiveid.com/free-session' })).status).toBe(201)
    expect((await post({ name: 'P', targetUrl: 'nope' })).status).toBe(400)
  })
})

import { detectShareImageType } from './admin-tools.routes'

describe('share image detection', () => {
  const pad = (bytes: number[]) => Uint8Array.from([...bytes, ...new Array(20).fill(0)])
  it('recognises jpeg/png/webp by content and rejects anything else', () => {
    expect(detectShareImageType(pad([0xff, 0xd8, 0xff, 0xe0]))?.ext).toBe('jpg')
    expect(detectShareImageType(pad([0x89, 0x50, 0x4e, 0x47]))?.ext).toBe('png')
    expect(detectShareImageType(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0, 0]))?.ext).toBe('webp')
    expect(detectShareImageType(pad([0x3c, 0x73, 0x76, 0x67]))).toBeNull()
  })
})
