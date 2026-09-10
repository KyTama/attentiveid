import { describe, expect, it, vi } from 'bun:test'
import { Elysia } from 'elysia'
import type { UserDto } from '@attentiveid/shared'
import { createTokenService } from '../security/token-service'
import { createArticleRoutes } from './articles'

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
  psychologistId: 'syazka-uuid-001',
  lastLoginAt: '2026-09-10T11:00:00Z',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-10T11:00:00Z',
}

const usersDb = new Map<string, UserDto>([
  [adminUser.id, adminUser],
  [psychologistUser.id, psychologistUser],
])

const tokenService = createTokenService({ jwtSecret: testJwtSecret })
const userRepository = {
  findById: async (id: string) => usersDb.get(id) ?? null,
}

const mockPublishedArticle = {
  id: 'article-001',
  slug: 'memahami-kecemasan-dan-cara-mengatasinya',
  title: { id: 'Memahami Kecemasan', en: 'Understanding Anxiety' },
  summary: { id: 'Ringkasan artikel kecemasan', en: 'Anxiety article summary' },
  body: { id: 'Isi lengkap artikel kecemasan...', en: 'Full article body on anxiety...' },
  publishedAt: '2026-09-01T12:00:00Z',
}

const articlesRepository = {
  getPublishedBySlug: async (slug: string) => {
    if (slug === mockPublishedArticle.slug) {
      return { status: 'found' as const, article: mockPublishedArticle }
    }
    return { status: 'notFound' as const }
  },
  listPublishedArticles: async () => ({
    articles: [mockPublishedArticle],
    total: 1,
  }),
  listManageableArticles: async () => [mockPublishedArticle],
}

describe('article API routes (/api/content/articles & /api/admin/articles)', () => {
  const app = new Elysia().use(
    createArticleRoutes({
      tokenService,
      userRepository,
      articlesRepository,
    })
  )

  it('GET /api/content/articles returns published articles list', async () => {
    const res = await app.handle(new Request('http://localhost/api/content/articles'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.articles.length).toBe(1)
    expect(json.articles[0].slug).toBe(mockPublishedArticle.slug)
  })

  it('GET /api/content/articles/:slug returns article detail or 404', async () => {
    const foundRes = await app.handle(
      new Request(`http://localhost/api/content/articles/${mockPublishedArticle.slug}`)
    )
    expect(foundRes.status).toBe(200)
    const foundJson = await foundRes.json()
    expect(foundJson.status).toBe('success')
    expect(foundJson.article.id).toBe(mockPublishedArticle.id)

    const notFoundRes = await app.handle(
      new Request('http://localhost/api/content/articles/non-existent-slug')
    )
    expect(notFoundRes.status).toBe(404)
  })

  it('GET /api/admin/articles denies unauthenticated request with 401', async () => {
    const res = await app.handle(new Request('http://localhost/api/admin/articles'))
    expect(res.status).toBe(401)
  })

  it('GET /api/admin/articles allows authenticated admin user', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/articles', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.articles.length).toBe(1)
  })

  it('POST /api/admin/articles creates new draft for authenticated psychologist', async () => {
    const { accessToken } = tokenService.issueAccessToken(psychologistUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/articles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: 'artikel-baru-psikologi',
          title: { id: 'Judul Baru', en: 'New Title' },
          summary: { id: 'Ringkasan Baru', en: 'New Summary' },
          body: { id: 'Isi artikel...', en: 'Article body...' },
        }),
      })
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.status).toBe('success')
  })

  it('POST /api/admin/articles/:id/approve requires admin role and returns 403 for psychologist', async () => {
    const { accessToken: psychToken } = tokenService.issueAccessToken(psychologistUser)
    const psychRes = await app.handle(
      new Request('http://localhost/api/admin/articles/revision-001/approve', {
        method: 'POST',
        headers: { Authorization: `Bearer ${psychToken}` },
      })
    )
    expect(psychRes.status).toBe(403)

    const { accessToken: adminToken } = tokenService.issueAccessToken(adminUser)
    const adminRes = await app.handle(
      new Request('http://localhost/api/admin/articles/revision-001/approve', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    )
    expect(adminRes.status).toBe(200)
  })
})
