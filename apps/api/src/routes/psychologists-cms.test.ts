import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import type { FullPsychologistMutation, UserDto } from '@attentiveid/shared'
import { createTokenService } from '../security/token-service'
import { createPsychologistsCmsRoutes } from './psychologists-cms'

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

const samplePsychologist = {
  id: 'psych-001',
  slug: 'syazka-adira',
  status: 'active',
  name: 'Syazka Adira, M.Psi., Psikolog',
  nickname: 'Syazka',
  credential: 'M.Psi., Psikolog',
  experienceYears: 6,
  licenseNumber: '12345678',
  bookingUrl: 'https://attentive.id/book/syazka',
  premiumBookingUrl: null,
  featured: true,
  featuredOrder: 1,
  biography: { id: 'Bio ID', en: 'Bio EN' },
  availabilityMessage: { id: 'Jadwal ID', en: 'Schedule EN' },
  supportAreas: [{ supportArea: 'adultClinical', primary: true, position: 0 }],
  specializations: [{ id: 'spec-1', position: 0, label: { id: 'Kecemasan', en: 'Anxiety' } }],
  media: {
    reference: 'media/psychologists/syazka.webp',
    width: 600,
    height: 600,
    alt: { id: 'Foto Syazka', en: 'Syazka photo' },
  },
}

const mockPsychologistsDb = new Map<string, any>([[samplePsychologist.id, samplePsychologist]])

const tokenService = createTokenService({ jwtSecret: testJwtSecret })
const userRepository = {
  findById: async (id: string) => usersDb.get(id) ?? null,
}
const psychologistsRepository = {
  listAdmin: async () => ({
    psychologists: Array.from(mockPsychologistsDb.values()),
    total: mockPsychologistsDb.size,
  }),
  getAdminById: async (id: string) => mockPsychologistsDb.get(id) ?? null,
  saveAdmin: async (id: string | undefined, input: FullPsychologistMutation) => {
    const savedId = id || `psych-${Date.now()}`
    const record = {
      id: savedId,
      ...input,
      supportAreas: input.supportAreas.map((sa, pos) => ({ ...sa, position: pos })),
      specializations: input.specializations.map((sp, pos) => ({ id: `spec-${pos}`, position: pos, label: sp.label })),
    }
    mockPsychologistsDb.set(savedId, record)
    return record
  },
  updateStatusAdmin: async (id: string, status: any) => {
    const existing = mockPsychologistsDb.get(id)
    if (!existing) return null
    const updated = { ...existing, status }
    mockPsychologistsDb.set(id, updated)
    return updated
  },
}

describe('Psychologists CMS API routes (/api/admin/psychologists)', () => {
  const app = new Elysia().use(
    createPsychologistsCmsRoutes({
      tokenService,
      userRepository,
      psychologistsRepository,
    })
  )

  it('GET /api/admin/psychologists denies unauthenticated request with 401', async () => {
    const res = await app.handle(new Request('http://localhost/api/admin/psychologists'))
    expect(res.status).toBe(401)
  })

  it('GET /api/admin/psychologists denies psychologist role with 403 Forbidden', async () => {
    const { accessToken } = tokenService.issueAccessToken(psychologistUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
    expect(res.status).toBe(403)
  })

  it('GET /api/admin/psychologists allows admin user and returns list', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.psychologists.length).toBeGreaterThan(0)
  })

  it('GET /api/admin/psychologists/:id returns 404 for unknown ID', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/unknown-id', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
    expect(res.status).toBe(404)
  })

  it('POST /api/admin/psychologists rejects invalid payload with 400', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'payload' }),
      })
    )
    expect(res.status).toBe(400)
  })

  it('POST /api/admin/psychologists creates new psychologist with 201', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const payload: FullPsychologistMutation = {
      slug: 'budi-santoso',
      status: 'draft',
      name: 'Budi Santoso, M.Psi., Psikolog',
      nickname: 'Budi',
      credential: 'M.Psi., Psikolog',
      licenseNumber: '87654321',
      experienceYears: 4,
      bookingUrl: 'https://attentive.id/book/budi',
      featured: false,
      featuredOrder: null,
      supportAreas: [{ supportArea: 'adultClinical', primary: true }],
      specializations: [{ label: { id: 'Depresi', en: 'Depression' } }],
      biography: { id: 'Bio Budi ID', en: 'Bio Budi EN' },
      availabilityMessage: { id: 'Jadwal Budi', en: 'Budi Schedule' },
    }

    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.psychologist.name).toBe('Budi Santoso, M.Psi., Psikolog')
  })

  it('PATCH /api/admin/psychologists/:id/status updates lifecycle status with 200', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/psych-001/status', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'inactive' }),
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.psychologist.status).toBe('inactive')
  })
})
