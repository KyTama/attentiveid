import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { PDFDocument } from 'pdf-lib'
import type { SciBriefAdminDto, SciBriefInput, UserDto } from '@attentiveid/shared'
import { createTokenService } from '../security/token-service'
import { createSciBriefsRoutes } from './sci-briefs.routes'
import type { SciBriefsRepository } from '../repositories/sci-briefs.repository'
import { splitSciBriefPdf, SciBriefPdfError } from '../services/sci-brief-pdf'

const secret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security'
const tokenService = createTokenService({ jwtSecret: secret })

const user = (role: UserDto['role'], id: string): UserDto => ({
  id,
  email: `${id}@attentive.id`,
  name: id,
  role,
  status: 'active',
  psychologistId: null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})
const admin = user('admin', 'admin-1')
const psychologist = user('psychologist', 'psych-1')
const users = new Map([admin, psychologist].map((u) => [u.id, u]))
const userRepository = { findById: async (id: string) => users.get(id) ?? null }

const makePdf = async (pages: number) => {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pages; i++) doc.addPage([300, 400]).drawText(`Secret page ${i + 1}`)
  return Buffer.from(await doc.save())
}

const NOW = new Date('2026-10-15T00:00:00Z')

const memoryRepository = () => {
  const briefs = new Map<string, SciBriefAdminDto>()
  const files = new Map<string, { preview?: Buffer; full?: Buffer }>()
  let counter = 0
  const asPublic = (b: SciBriefAdminDto) => ({
    id: b.id, slug: b.slug, title: b.title, summary: b.summary, periodMonth: b.periodMonth,
    releaseAt: b.releaseAt, totalPages: b.totalPages, previewPages: b.previewPages,
    previewUrl: files.get(b.id)?.preview ? `/api/content/sci-briefs/${b.slug}/preview.pdf` : null,
  })
  const visible = (b: SciBriefAdminDto) => b.status === 'published' && Date.parse(b.releaseAt) <= NOW.getTime()
  const toDto = (id: string, input: SciBriefInput, previous?: SciBriefAdminDto): SciBriefAdminDto => ({
    id, slug: input.slug, title: { id: input.titleId, en: input.titleEn },
    summary: { id: input.summaryId, en: input.summaryEn }, periodMonth: input.periodMonth,
    releaseAt: input.releaseAt, totalPages: previous?.totalPages ?? null, previewPages: input.previewPages,
    status: input.status, documentName: previous?.documentName ?? null,
    hasDocument: Boolean(files.get(id)?.full), createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  })
  const repository: SciBriefsRepository = {
    listPublic: async () => [...briefs.values()].filter(visible).map(asPublic),
    getPublicBySlug: async (slug) => { const b = [...briefs.values()].find((x) => x.slug === slug && visible(x)); return b ? asPublic(b) : null },
    getPreviewBySlug: async (slug) => { const b = [...briefs.values()].find((x) => x.slug === slug && visible(x)); return (b && files.get(b.id)?.preview) || null },
    listAdmin: async () => [...briefs.values()],
    getAdminById: async (id) => briefs.get(id) ?? null,
    create: async (input) => {
      if ([...briefs.values()].some((b) => b.slug === input.slug)) throw Object.assign(new Error('dup'), { code: '23505' })
      const id = `brief-${++counter}`; const dto = toDto(id, input); briefs.set(id, dto); return dto
    },
    update: async (id, input) => { const prev = briefs.get(id); if (!prev) return null; const dto = toDto(id, input, prev); briefs.set(id, dto); return dto },
    remove: async (id) => briefs.delete(id),
    saveDocument: async (id, doc) => {
      const prev = briefs.get(id); if (!prev) return null
      files.set(id, { preview: doc.previewBytes, full: doc.fullBytes })
      const dto = { ...prev, documentName: doc.documentName, totalPages: doc.totalPages, previewPages: doc.previewPages, hasDocument: true }
      briefs.set(id, dto); return dto
    },
    savePreview: async (id, previewPages, bytes) => { files.set(id, { ...files.get(id), preview: bytes }); const prev = briefs.get(id); if (prev) briefs.set(id, { ...prev, previewPages }) },
    getFile: async (id, kind) => { const data = files.get(id)?.[kind]; return data ? { data, documentName: briefs.get(id)?.documentName ?? null } : null },
  }
  return repository
}

const input = (overrides: Record<string, unknown> = {}) => ({
  titleId: 'Menjadi Disukai', titleEn: 'Being Liked', summaryId: 'Ringkasan', summaryEn: 'Summary',
  periodMonth: '2026-09', releaseAt: '2026-09-01T00:00:00Z', status: 'published', ...overrides,
})

const setup = () => {
  const app = new Elysia().use(createSciBriefsRoutes({ tokenService, userRepository, sciBriefsRepository: memoryRepository(), now: () => NOW }))
  const bearer = (u: UserDto) => ({ Authorization: `Bearer ${tokenService.issueAccessToken(u).accessToken}`, 'Content-Type': 'application/json' })
  const post = (path: string, headers: Record<string, string>, body: unknown) =>
    app.handle(new Request(`http://localhost${path}`, { method: 'POST', headers, body: JSON.stringify(body) }))
  const upload = (id: string, pdf: Buffer, name = 'brief.pdf') => {
    const form = new FormData()
    form.append('file', new File([pdf], name, { type: 'application/pdf' }))
    return app.handle(new Request(`http://localhost/api/admin/sci-briefs/${id}/document`, {
      method: 'POST', headers: { Authorization: bearer(admin).Authorization }, body: form,
    }))
  }
  return { app, bearer, post, upload }
}

describe('splitSciBriefPdf', () => {
  it('keeps only the first pages in the preview', async () => {
    const result = await splitSciBriefPdf(await makePdf(5), 3)
    expect(result.totalPages).toBe(5)
    expect(result.previewPages).toBe(3)
    expect((await PDFDocument.load(result.previewBytes)).getPageCount()).toBe(3)
    expect(Buffer.from(result.previewBytes).toString('latin1')).not.toContain('Secret page 4')
  })

  it('rejects files that are not PDFs', async () => {
    await expect(splitSciBriefPdf(Buffer.from('hello'), 3)).rejects.toBeInstanceOf(SciBriefPdfError)
  })
})

describe('Sci-Brief routes', () => {
  it('keeps the admin endpoints closed to visitors and psychologists', async () => {
    const { app, bearer } = setup()
    expect((await app.handle(new Request('http://localhost/api/admin/sci-briefs'))).status).toBe(401)
    const res = await app.handle(new Request('http://localhost/api/admin/sci-briefs', { headers: bearer(psychologist) }))
    expect(res.status).toBe(403)
  })

  it('creates a brief, rejects bad data and duplicate slugs', async () => {
    const { bearer, post } = setup()
    const created = await post('/api/admin/sci-briefs', bearer(admin), input())
    expect(created.status).toBe(201)
    expect((await created.json()).brief.slug).toBe('being-liked')
    expect((await post('/api/admin/sci-briefs', bearer(admin), input({ periodMonth: 'nope' }))).status).toBe(400)
    expect((await post('/api/admin/sci-briefs', bearer(admin), input())).status).toBe(409)
  })

  it('serves only the preview pages publicly and only once released and published', async () => {
    const { app, bearer, post, upload } = setup()
    const released = (await (await post('/api/admin/sci-briefs', bearer(admin), input())).json()).brief
    const future = (await (await post('/api/admin/sci-briefs', bearer(admin), input({ titleId: 'Nanti', titleEn: 'Later', releaseAt: '2026-12-01T00:00:00Z' }))).json()).brief
    const draft = (await (await post('/api/admin/sci-briefs', bearer(admin), input({ titleId: 'Konsep', titleEn: 'Draft', status: 'draft' }))).json()).brief
    for (const brief of [released, future, draft]) expect((await upload(brief.id, await makePdf(6))).status).toBe(200)

    const list = await (await app.handle(new Request('http://localhost/api/content/sci-briefs'))).json()
    expect(list.briefs.map((b: { slug: string }) => b.slug)).toEqual(['being-liked'])
    expect(list.briefs[0].totalPages).toBe(6)

    const preview = await app.handle(new Request('http://localhost/api/content/sci-briefs/being-liked/preview.pdf'))
    expect(preview.status).toBe(200)
    expect(preview.headers.get('content-type')).toBe('application/pdf')
    expect((await PDFDocument.load(new Uint8Array(await preview.arrayBuffer()))).getPageCount()).toBe(3)

    expect((await app.handle(new Request('http://localhost/api/content/sci-briefs/later/preview.pdf'))).status).toBe(404)
    expect((await app.handle(new Request('http://localhost/api/content/sci-briefs/draft'))).status).toBe(404)
  })

  it('gives admins the full document and rebuilds the preview when its length changes', async () => {
    const { app, bearer, post, upload } = setup()
    const brief = (await (await post('/api/admin/sci-briefs', bearer(admin), input())).json()).brief
    await upload(brief.id, await makePdf(6))

    const full = await app.handle(new Request(`http://localhost/api/admin/sci-briefs/${brief.id}/document`, { headers: bearer(admin) }))
    expect((await PDFDocument.load(new Uint8Array(await full.arrayBuffer()))).getPageCount()).toBe(6)
    expect((await app.handle(new Request(`http://localhost/api/admin/sci-briefs/${brief.id}/document`))).status).toBe(401)

    const updated = await app.handle(new Request(`http://localhost/api/admin/sci-briefs/${brief.id}`, {
      method: 'PUT', headers: bearer(admin), body: JSON.stringify(input({ previewPages: 2 })),
    }))
    expect(updated.status).toBe(200)
    const preview = await app.handle(new Request('http://localhost/api/content/sci-briefs/being-liked/preview.pdf'))
    expect((await PDFDocument.load(new Uint8Array(await preview.arrayBuffer()))).getPageCount()).toBe(2)
  })

  it('rejects a document that is not a PDF', async () => {
    const { bearer, post, upload } = setup()
    const brief = (await (await post('/api/admin/sci-briefs', bearer(admin), input())).json()).brief
    expect((await upload(brief.id, Buffer.from('not a pdf'))).status).toBe(400)
  })
})
