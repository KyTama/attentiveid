import { afterEach, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import type { UserDto } from '@attentiveid/shared'
import { createApp } from '../app'
import { createTokenService } from './token-service'
import { createArticleRoutes } from '../routes/articles'

const baseDependencies = {
  frontendOrigin: 'http://localhost:5173',
  landingRepository: { getPublished: async () => null, getRevision: async () => null },
  psychologistsRepository: { list: async () => [], featured: async () => [], getBySlug: async () => ({ status: 'notFound' }) },
} as never

const original = process.env.NODE_ENV
afterEach(() => {
  if (original === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = original
})

describe('API hardening', () => {
  it('sends security headers on every response', async () => {
    const app = createApp(baseDependencies)
    const response = await app.handle(new Request('http://localhost/ready'))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('referrer-policy')).toBe('no-referrer')
    expect(response.headers.get('content-security-policy')).toContain("default-src 'none'")
    expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'")
    expect(response.headers.get('permissions-policy')).toContain('payment=()')
  })

  it('shows the API documentation on a developer machine but not in production', async () => {
    process.env.NODE_ENV = 'test'
    const dev = createApp(baseDependencies)
    expect((await dev.handle(new Request('http://localhost/swagger'))).status).toBe(200)

    process.env.NODE_ENV = 'production'
    const production = createApp(baseDependencies)
    expect((await production.handle(new Request('http://localhost/swagger'))).status).toBe(404)
    expect((await production.handle(new Request('http://localhost/swagger/json'))).status).toBe(404)
    // the rest of the API still works
    expect((await production.handle(new Request('http://localhost/ready'))).status).toBe(200)
  })
})

describe('a psychologist writes articles only as themselves', () => {
  const user = (id: string, role: UserDto['role'], psychologistId: string | null): UserDto => ({
    id, email: `${id}@attentive.id`, name: id, role, status: 'active', psychologistId, lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
  })
  const psychologist = user('psych-1', 'psychologist', 'psych-own')
  const admin = user('admin-1', 'admin', null)
  const users = new Map([[psychologist.id, psychologist], [admin.id, admin]])
  const tokenService = createTokenService({
    secret: 'attentive_test_secret_key_32bytes_minimum_length_required!',
    store: { insert: async () => {}, findByHash: async () => null, revokeByHash: async () => {}, revokeAllForUser: async () => {} } as never,
  })

  it('ignores a different ownerPsychologistId from a psychologist, but admins may choose', async () => {
    const authors: string[] = []
    const app = new Elysia().use(createArticleRoutes({
      tokenService,
      userRepository: { findById: async (id: string) => users.get(id) ?? null },
      articlesRepository: {} as never,
      contentTransitions: {
        createArticleDraft: async (capability: { psychologistId: string }) => {
          authors.push(capability.psychologistId)
          return { status: 'success', articleId: 'a1', slug: 'x' }
        },
      } as never,
    }))
    const post = (token: string, ownerPsychologistId: string) => app.handle(new Request('http://localhost/api/admin/articles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'artikel-uji', ownerPsychologistId,
        title: { id: 'Judul', en: 'Title' }, summary: { id: 'Ringkasan', en: 'Summary' }, body: { id: 'Isi artikel', en: 'Article body' },
      }),
    }))
    await post(tokenService.issueAccessToken(psychologist).accessToken, 'someone-else')
    await post(tokenService.issueAccessToken(admin).accessToken, 'chosen-by-admin')
    expect(authors).toEqual(['psych-own', 'chosen-by-admin'])
  })
})
