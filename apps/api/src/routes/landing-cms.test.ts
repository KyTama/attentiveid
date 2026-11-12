import { afterAll, describe, expect, it } from 'bun:test'
import fs from 'fs'
import path from 'path'
import { Elysia } from 'elysia'
import type { UserDto } from '@attentiveid/shared'
import { createTokenService } from '../security/token-service'
import { createLandingCmsRoutes } from './landing-cms'

const testJwtSecret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security'

const adminUser: UserDto = {
  id: 'user-admin-001',
  email: 'admin@attentive.id',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: '2026-09-10T10:00:00Z',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-10T10:00:00Z',
}

const psychologistUser: UserDto = {
  id: 'user-psych-001',
  email: 'psychologist@attentive.id',
  name: 'Dr. Syazka',
  role: 'psychologist',
  status: 'active',
  psychologistId: 'syazka-001',
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

const usersDb = new Map<string, UserDto>([
  [adminUser.id, adminUser],
  [psychologistUser.id, psychologistUser],
])

const tokenService = createTokenService({ jwtSecret: testJwtSecret })
const userRepository = {
  findById: async (id: string) => usersDb.get(id) ?? null,
}

describe('landing CMS API routes (/api/admin/landing)', () => {
  const mockDb: any = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => []
        })
      })
    }),
    insert: () => ({
      values: () => ({
        returning: async () => [{ id: 'mock-media-id-1' }]
      })
    }),
    update: () => ({
      set: () => ({
        where: async () => []
      })
    })
  }

  const app = new Elysia().use(
    createLandingCmsRoutes({
      tokenService,
      userRepository,
      db: mockDb,
    })
  )

  it('GET /api/admin/landing denies unauthenticated request with 401', async () => {
    const res = await app.handle(new Request('http://localhost/api/admin/landing'))
    expect(res.status).toBe(401)
  })

  it('GET /api/admin/landing denies psychologist role with 403 Forbidden', async () => {
    const { accessToken } = tokenService.issueAccessToken(psychologistUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/landing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
    expect(res.status).toBe(403)
  })

  it('GET /api/admin/landing allows admin user', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/landing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
  })

  it('POST /api/admin/landing/publish requires admin role', async () => {
    const { accessToken: psychToken } = tokenService.issueAccessToken(psychologistUser)
    const psychRes = await app.handle(
      new Request('http://localhost/api/admin/landing/publish', {
        method: 'POST',
        headers: { Authorization: `Bearer ${psychToken}` },
      })
    )
    expect(psychRes.status).toBe(403)

    const { accessToken: adminToken } = tokenService.issueAccessToken(adminUser)
    const adminRes = await app.handle(
      new Request('http://localhost/api/admin/landing/publish', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    )
    expect(adminRes.status).toBe(200)
  })

  it('POST /api/admin/landing/publish invokes contentTransitions.publishLandingDraft or publishLandingRevision', async () => {
    let publishCalled = false
    let draftCreated = false

    const appWithTransitions = new Elysia().use(
      createLandingCmsRoutes({
        tokenService,
        userRepository,
        db: mockDb,
        contentTransitions: {
          createLandingDraft: async () => {
            draftCreated = true
            return { id: 'draft-uuid-1' }
          },
          publishLandingDraft: async (_cap: any, revisionId?: string) => {
            publishCalled = true
            expect(revisionId).toBe('draft-uuid-1')
          }
        }
      })
    )

    const localized = (value: string) => ({ id: `${value} ID`, en: `${value} EN` });
    const repeater = (prefix: string) => Array.from({ length: 3 }, (_, position) => ({
      id: `${prefix}-${position}`,
      position,
      title: localized(`${prefix} title ${position}`),
      description: localized(`${prefix} description ${position}`)
    }));
    const validLandingContent = {
      sections: [
        { key: 'hero', visible: true, headline: localized('Hero'), description: localized('Hero description'), primaryCta: localized('Start'), secondaryCta: localized('Explore'), items: repeater('metric') },
        { key: 'supportExplorer', visible: true, headline: localized('Support'), description: localized('Support description'), items: repeater('support') },
        { key: 'carePromise', visible: true, headline: localized('Promise'), description: localized('Promise description'), items: repeater('promise') },
        { key: 'featuredPsychologists', visible: true, headline: localized('Featured'), description: localized('Featured description') },
        { key: 'careJourney', visible: true, headline: localized('Journey'), description: localized('Journey description'), items: repeater('journey') },
        { key: 'clientStories', visible: true, headline: localized('Stories'), description: localized('Stories description'), items: repeater('stories') },
        { key: 'consultationReassurance', visible: true, headline: localized('Reassurance'), description: localized('Reassurance description'), sessionLabel: localized('Session label'), price: localized('Price'), priceUnit: localized('Price unit'), primaryCta: localized('Ask about pricing') },
        { key: 'frequentlyAskedQuestions', visible: true, headline: localized('FAQ'), description: localized('FAQ description'), items: repeater('faq') },
        { key: 'closingInvitation', visible: true, headline: localized('Closing'), description: localized('Closing description'), primaryCta: localized('Contact'), contact: localized('WhatsApp') }
      ]
    };

    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await appWithTransitions.handle(
      new Request('http://localhost/api/admin/landing/publish', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validLandingContent)
      })
    )
    expect(res.status).toBe(200)
    expect(draftCreated).toBe(true)
    expect(publishCalled).toBe(true)
  })

  it('PUT /api/admin/landing/draft saves draft revision and handles consecutive saves', async () => {
    let draftCallCount = 0
    const appWithDraft = new Elysia().use(
      createLandingCmsRoutes({
        tokenService,
        userRepository,
        db: mockDb,
        contentTransitions: {
          createLandingDraft: async (_cap: any, content: any) => {
            draftCallCount++
            return { id: `draft-rev-${draftCallCount}`, revisionNumber: draftCallCount + 1 }
          }
        }
      })
    )

    const localized = (value: string) => ({ id: `${value} ID`, en: `${value} EN` });
    const repeater = (prefix: string) => Array.from({ length: 3 }, (_, position) => ({
      id: `${prefix}-${position}`,
      position,
      title: localized(`${prefix} title ${position}`),
      description: localized(`${prefix} description ${position}`)
    }));
    const payload = {
      sections: [
        { key: 'hero', visible: true, headline: localized('Hero'), description: localized('Hero description'), primaryCta: localized('Start'), secondaryCta: localized('Explore'), items: repeater('metric') },
        { key: 'supportExplorer', visible: true, headline: localized('Support'), description: localized('Support description'), items: repeater('support') },
        { key: 'carePromise', visible: true, headline: localized('Promise'), description: localized('Promise description'), items: repeater('promise') },
        { key: 'featuredPsychologists', visible: true, headline: localized('Featured'), description: localized('Featured description') },
        { key: 'careJourney', visible: true, headline: localized('Journey'), description: localized('Journey description'), items: repeater('journey') },
        { key: 'clientStories', visible: true, headline: localized('Stories'), description: localized('Stories description'), items: repeater('stories') },
        { key: 'consultationReassurance', visible: true, headline: localized('Reassurance'), description: localized('Reassurance description'), sessionLabel: localized('Session label'), price: localized('Price'), priceUnit: localized('Price unit'), primaryCta: localized('Ask about pricing') },
        { key: 'frequentlyAskedQuestions', visible: true, headline: localized('FAQ'), description: localized('FAQ description'), items: repeater('faq') },
        { key: 'closingInvitation', visible: true, headline: localized('Closing'), description: localized('Closing description'), primaryCta: localized('Contact'), contact: localized('WhatsApp') }
      ]
    };

    const { accessToken } = tokenService.issueAccessToken(adminUser)

    // First save
    const res1 = await appWithDraft.handle(
      new Request('http://localhost/api/admin/landing/draft', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    )
    expect(res1.status).toBe(200)
    const json1 = await res1.json()
    expect(json1.status).toBe('success')
    expect(json1.revision.id).toBe('draft-rev-1')

    // Second save (simulates consecutive edit without publishing)
    const res2 = await appWithDraft.handle(
      new Request('http://localhost/api/admin/landing/draft', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    )
    expect(res2.status).toBe(200)
    const json2 = await res2.json()
    expect(json2.status).toBe('success')
    expect(json2.revision.id).toBe('draft-rev-2')
    expect(draftCallCount).toBe(2)
  })

  it('POST /api/admin/landing/upload-image uploads image and returns media reference', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const formData = new FormData()
    const mockFile = new File(['fake webp content for landing'], 'hero.webp', { type: 'image/webp' })
    formData.append('file', mockFile)
    formData.append('sectionKey', 'hero')
    formData.append('slug', 'consultation-hero')
    formData.append('width', '1600')
    formData.append('height', '900')

    const res = await app.handle(
      new Request('http://localhost/api/admin/landing/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.media.reference).toBe('media/landing/consultation-hero.webp')
    expect(json.media.width).toBe(1600)
    expect(json.media.height).toBe(900)
  })

  it('POST /api/admin/landing/upload-image rejects file larger than 5 MB with 413', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const formData = new FormData()
    const largeBuffer = new Uint8Array(6 * 1024 * 1024)
    const largeFile = new File([largeBuffer], 'giant-hero.webp', { type: 'image/webp' })
    formData.append('file', largeFile)

    const res = await app.handle(
      new Request('http://localhost/api/admin/landing/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
    )
    expect(res.status).toBe(413)
    const json = await res.json()
    expect(json.message).toContain('5 MB')
  })

  afterAll(() => {
    const testFile = path.resolve(process.cwd(), 'apps/web/public/media/landing/consultation-hero.webp')
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile)
    }
    const distTestFile = path.resolve(process.cwd(), 'apps/web/dist/media/landing/consultation-hero.webp')
    if (fs.existsSync(distTestFile)) {
      fs.unlinkSync(distTestFile)
    }
  })
})
