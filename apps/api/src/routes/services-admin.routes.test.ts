import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { Value } from '@sinclair/typebox/value'
import {
  SuperadminPreviewCatalogResponseSchema,
  type ServicesAdminOverviewResponse,
  type SuperadminPreviewCatalogResponse,
  type UserDto,
} from '@attentiveid/shared'
import type { ServicesInternalRepository } from '../repositories/services-internal.repository'
import { createTokenService } from '../security/token-service'
import { createServicesAdminRoutes } from './services-admin.routes'

const testJwtSecret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security'

const adminUser: UserDto = {
  id: 'user-admin-001',
  email: 'admin@attentive.id',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

const superadminUser: UserDto = {
  id: 'user-super-001',
  email: 'kytama@attentiveid.com',
  name: 'KyTama',
  role: 'superadmin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

const psychologistUser: UserDto = {
  id: 'user-psych-001',
  email: 'psychologist@attentive.id',
  name: 'Dr. Syazka',
  role: 'psychologist',
  status: 'active',
  psychologistId: 'psy-1',
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

const usersDb = new Map<string, UserDto>([
  [adminUser.id, adminUser],
  [superadminUser.id, superadminUser],
  [psychologistUser.id, psychologistUser],
])

const mockOverview: ServicesAdminOverviewResponse = {
  status: 'success',
  settings: {
    marginThreshold: 30,
    assumptions: {
      feePsikologPerJam: 500000,
      gatewayPct: 3,
      iklanTesPct: 20,
      iklanExpertPct: 10,
      feeHaykal: 0,
    },
  },
  stats: {
    totalServices: 53,
    byStatus: { published: 26, draft: 5, inactive: 21, archived: 1 },
    internalVisibilityCount: 9,
    lowMarginCount: 2,
    openIssuesCount: 38,
    avgCompletenessPct: 84,
  },
  categories: [],
  subgroups: [],
  services: [],
  ledgerRows: [],
  costRecords: [],
  programs: [],
  issues: [],
  psychologists: [],
  auditLogs: [],
}

const mockPreviewCatalog: SuperadminPreviewCatalogResponse = {
  locale: 'id',
  marginThreshold: 30,
  categories: [{ id: 'cat-1', slug: 'asesmen', position: 1, isFree: false, name: 'Asesmen Psikologi' }],
  subgroups: [],
  activePrograms: [],
  services: [
    {
      id: 'svc-draft-1',
      slug: 'aaa50',
      categoryId: 'cat-1',
      categorySlug: 'asesmen',
      categoryName: 'Asesmen Psikologi',
      subgroupId: null,
      subgroupSlug: null,
      subgroupName: null,
      serviceType: 'layanan',
      pricingModel: 'fixed_variant',
      appliesNewClientFee: false,
      isAssessment: true,
      isFeaturedSpotlight: false,
      position: 50,
      name: 'AAA-50 + ACT',
      badge: 'Draft',
      shortSummary: 'Internal preview item',
      benefit: 'Evaluasi fungsi eksekutif',
      audiences: ['Dewasa'],
      modalities: ['online'],
      hasMalangBranch: false,
      priceRange: {
        minAmount: 1500000,
        maxAmount: 1500000,
        isRange: false,
        variesByProvider: false,
        promoAmount: null,
        promoBadge: null,
        promoNote: null,
        programSlug: null,
      },
      cardMedia: null,
      variants: [],
      bookingPreset: {
        bookable: true,
        bookingPath: '/booking?service=aaa50',
        externalUrl: null,
        defaultConcernId: null,
        defaultClientCategory: null,
        requiresInitialCounseling: false,
      },
      demo: null,
      internalMeta: {
        status: 'draft',
        visibility: 'internal',
        completenessPct: 75,
        openIssuesCount: 1,
        lowestFeeAmount: 500000,
        directCostAmount: 50000,
        lowestMarginPct: 63.3,
      },
    },
  ],
}

const setupTestApp = () => {
  const tokenService = createTokenService({ jwtSecret: testJwtSecret })
  const calls: string[] = []
  const fakeRepo: ServicesInternalRepository = {
    getOverviewAndCatalog: async () => {
      calls.push('overview')
      return mockOverview
    },
    listSuperadminPreviewCatalog: async (locale) => {
      calls.push(`preview:${locale}`)
      return mockPreviewCatalog
    },
    getSuperadminPreviewBySlug: async (slug) => {
      calls.push(`previewDetail:${slug}`)
      return null
    },
    upsertService: async (actor, payload) => {
      calls.push(`upsert:${actor.email}:${payload.slug}`)
      return { id: 'svc-new-1', slug: payload.slug }
    },
    duplicateService: async (actor, id) => {
      calls.push(`dup:${actor.email}:${id}`)
      return { id: 'svc-copy-1', slug: 'tes-iq-copy' }
    },
    upsertInternalCost: async (actor, payload) => {
      calls.push(`cost:${actor.email}:${payload.recordKind}:${payload.recordStatus}`)
      return { id: 'cost-1' }
    },
    saveProgram: async (actor, payload) => {
      calls.push(`prog:${actor.email}:${payload.slug}`)
      return { id: 'prog-1' }
    },
    updateProgramStatus: async () => true,
    updatePsychologistMatrix: async () => true,
    updateIssueStatus: async () => true,
    exportLedgerCsv: async () => '\uFEFFProduk,Slug\r\nTes IQ,tes-iq',
  }

  const app = new Elysia().use(
    createServicesAdminRoutes({
      tokenService,
      userRepository: { findById: async (id) => usersDb.get(id) ?? null },
      servicesInternalRepository: fakeRepo,
    }),
  )

  return { app, tokenService, calls }
}

describe('services-admin strict superadmin routes', () => {
  it('blocks unauthenticated (401), admin (403), and psychologist (403) callers across internal endpoints', async () => {
    const { app, tokenService } = setupTestApp()
    const { accessToken: adminToken } = tokenService.issueAccessToken(adminUser)
    const { accessToken: psychToken } = tokenService.issueAccessToken(psychologistUser)

    const endpoints = [
      { method: 'GET', path: '/api/admin/services/overview' },
      { method: 'GET', path: '/api/admin/services/preview-catalog' },
      { method: 'GET', path: '/api/admin/services/export.csv' },
      { method: 'PUT', path: '/api/admin/services/svc-1/costs', body: { recordKind: 'fee', recordStatus: 'berlaku', amount: 500000 } },
    ]

    for (const ep of endpoints) {
      const initBase = (token?: string): RequestInit => ({
        method: ep.method,
        headers: {
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...(ep.body ? { 'content-type': 'application/json' } : {}),
        },
        ...(ep.body ? { body: JSON.stringify(ep.body) } : {}),
      })

      const unauthRes = await app.handle(new Request(`http://localhost${ep.path}`, initBase()))
      expect(unauthRes.status).toBe(401)

      const adminRes = await app.handle(new Request(`http://localhost${ep.path}`, initBase(adminToken)))
      expect(adminRes.status).toBe(403)

      const psychRes = await app.handle(new Request(`http://localhost${ep.path}`, initBase(psychToken)))
      expect(psychRes.status).toBe(403)
    }
  })

  it('allows superadmin full overview, preview catalog, internal cost updates, and no-store CSV export', async () => {
    const { app, tokenService, calls } = setupTestApp()
    const { accessToken: superToken } = tokenService.issueAccessToken(superadminUser)

    const overviewRes = await app.handle(
      new Request('http://localhost/api/admin/services/overview', {
        headers: { authorization: `Bearer ${superToken}` },
      }),
    )
    expect(overviewRes.status).toBe(200)
    expect(overviewRes.headers.get('cache-control')).toBe('no-store')
    const overviewJson = (await overviewRes.json()) as ServicesAdminOverviewResponse
    expect(overviewJson.stats.totalServices).toBe(53)

    const previewRes = await app.handle(
      new Request('http://localhost/api/admin/services/preview-catalog?locale=id', {
        headers: { authorization: `Bearer ${superToken}` },
      }),
    )
    expect(previewRes.status).toBe(200)
    const previewJson = (await previewRes.json()) as SuperadminPreviewCatalogResponse
    expect(Value.Check(SuperadminPreviewCatalogResponseSchema, previewJson)).toBe(true)
    expect(previewJson.services[0]!.internalMeta.lowestMarginPct).toBe(63.3)

    const costRes = await app.handle(
      new Request('http://localhost/api/admin/services/svc-1/costs', {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${superToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          variantId: 'var-1',
          recordKind: 'fee',
          recordStatus: 'berlaku',
          amount: 500000,
          promoteToBerlaku: true,
        }),
      }),
    )
    expect(costRes.status).toBe(200)
    expect(calls).toContain('cost:kytama@attentiveid.com:fee:berlaku')

    const csvRes = await app.handle(
      new Request('http://localhost/api/admin/services/export.csv', {
        headers: { authorization: `Bearer ${superToken}` },
      }),
    )
    expect(csvRes.status).toBe(200)
    expect(csvRes.headers.get('content-type')).toContain('text/csv')
    expect(csvRes.headers.get('cache-control')).toBe('no-store')
    expect(await csvRes.text()).toContain('Produk,Slug')
  })
})
