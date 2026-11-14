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

const superadminUser: UserDto = {
  id: 'user-super-001',
  email: 'kytama@attentiveid.com',
  name: 'KyTama Superadmin',
  role: 'superadmin',
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
  [superadminUser.id, superadminUser],
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
    if (input.slug === 'duplicate-slug') {
      const err: any = new Error('duplicate key value violates unique constraint "psychologists_slug_unique"')
      err.code = '23505'
      throw err
    }
    if (input.featured && input.featuredOrder === 99) {
      const err: any = new Error('duplicate key value violates unique constraint "psychologists_featured_order_unique"')
      err.code = '23505'
      throw err
    }
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
  reorderFeaturedAdmin: async (orderedIds: string[]) => {
    if (orderedIds.join(',') !== 'psych-001') return { status: 'mismatch' as const }
    return { status: 'success' as const, order: [{ id: 'psych-001', featuredOrder: 1 }] }
  },
  updateStatusAdmin: async (id: string, status: any) => {
    const existing = mockPsychologistsDb.get(id)
    if (!existing) return null
    const updated = { ...existing, status }
    mockPsychologistsDb.set(id, updated)
    return updated
  },
}

const mockDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => []
      })
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => [{ id: 'mock-media-id-123' }]
    })
  }),
  update: () => ({
    set: () => ({
      where: () => []
    })
  })
}

describe('Psychologists CMS API routes (/api/admin/psychologists)', () => {
  const app = new Elysia().use(
    createPsychologistsCmsRoutes({
      tokenService,
      userRepository,
      psychologistsRepository,
      db: mockDb as any,
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

  it('PUT /api/admin/psychologists/:id updates existing psychologist with 200', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const updatePayload: FullPsychologistMutation = {
      slug: 'syazka-updated',
      status: 'active',
      name: 'Syazka Kirani Narindra, M.Psi.',
      nickname: 'Syazka',
      credential: 'M.Psi., Psikolog Klinis',
      licenseNumber: '12345678-REV',
      experienceYears: 6,
      bookingUrl: 'https://attentive.id/book/syazka-rev',
      featured: true,
      featuredOrder: 2,
      supportAreas: [{ supportArea: 'adultClinical', primary: true }],
      specializations: [{ label: { id: 'Trauma Dewasa', en: 'Adult Trauma' } }],
      biography: { id: 'Bio ID Baru', en: 'New Bio EN' },
      availabilityMessage: { id: 'Jadwal Baru', en: 'New Schedule' },
    }

    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/psych-001', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(json.psychologist.name).toBe('Syazka Kirani Narindra, M.Psi.')
    expect(json.psychologist.experienceYears).toBe(6)
  })

  it('POST /api/admin/psychologists returns 400 when duplicate featured order occurs', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const payload: FullPsychologistMutation = {
      slug: 'new-featured-psych',
      status: 'active',
      name: 'New Featured Doctor',
      nickname: 'Doctor',
      credential: 'M.Psi.',
      licenseNumber: '11223344',
      experienceYears: 3,
      bookingUrl: 'https://attentive.id/book/doc',
      featured: true,
      featuredOrder: 99,
      supportAreas: [{ supportArea: 'adultClinical', primary: true }],
      specializations: [{ label: { id: 'Tag', en: 'Tag' } }],
      biography: { id: 'Bio ID', en: 'Bio EN' },
      availabilityMessage: { id: 'Jadwal', en: 'Schedule' },
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
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.status).toBe('badRequest')
    expect(json.message).toContain('Nomor urutan Featured (99) sudah digunakan')
  })

  it('POST /api/admin/psychologists returns 400 when duplicate slug occurs', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const payload: FullPsychologistMutation = {
      slug: 'duplicate-slug',
      status: 'active',
      name: 'Duplicate Slug Doc',
      nickname: 'Dupe',
      credential: 'M.Psi.',
      licenseNumber: '11223344',
      experienceYears: 3,
      bookingUrl: 'https://attentive.id/book/doc',
      featured: false,
      featuredOrder: null,
      supportAreas: [{ supportArea: 'adultClinical', primary: true }],
      specializations: [{ label: { id: 'Tag', en: 'Tag' } }],
      biography: { id: 'Bio ID', en: 'Bio EN' },
      availabilityMessage: { id: 'Jadwal', en: 'Schedule' },
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
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.status).toBe('badRequest')
    expect(json.message).toContain('Slug URL "duplicate-slug" sudah digunakan')
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

  it('GET /api/admin/psychologists allows superadmin user with whole access', async () => {
    const { accessToken } = tokenService.issueAccessToken(superadminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(Array.isArray(json.psychologists)).toBe(true)
  })

  it('POST /api/admin/psychologists/upload-photo uploads photo and returns media reference', async () => {
    const { accessToken } = tokenService.issueAccessToken(superadminUser)
    const formData = new FormData()
    // Create a 1x1 valid webp or mock file
    const mockFile = new File(['mock content here'], 'test-photo.webp', { type: 'image/webp' })
    formData.append('file', mockFile)
    formData.append('slug', 'test-doc')
    formData.append('name', 'Dr. Test')
    formData.append('width', '600')
    formData.append('height', '750')

    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/upload-photo', {
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
    expect(json.media.reference).toBe('media/psychologists/test-doc.webp')
    expect(json.media.width).toBe(600)
    expect(json.media.height).toBe(750)
  })

  it('POST /api/admin/psychologists/upload-photo rejects file larger than 5 MB with 413', async () => {
    const { accessToken } = tokenService.issueAccessToken(superadminUser)
    const formData = new FormData()
    // Create an oversized 6 MB buffer/file
    const largeBuffer = new Uint8Array(6 * 1024 * 1024)
    const largeFile = new File([largeBuffer], 'giant.webp', { type: 'image/webp' })
    formData.append('file', largeFile)

    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/upload-photo', {
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

  it('PUT /api/admin/psychologists/featured-order saves the new order', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/featured-order', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ['psych-001'] }),
      })
    )
    expect(res.status).toBe(200)
    expect((await res.json()).order).toEqual([{ id: 'psych-001', featuredOrder: 1 }])
  })

  it('PUT /api/admin/psychologists/featured-order answers 409 when the featured list changed', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/featured-order', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ['psych-001', 'someone-else'] }),
      })
    )
    expect(res.status).toBe(409)
  })

  it('PUT /api/admin/psychologists/featured-order denies psychologists', async () => {
    const { accessToken } = tokenService.issueAccessToken(psychologistUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/featured-order', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      })
    )
    expect(res.status).toBe(403)
  })

  it('PUT /api/admin/psychologists/:id keeps a custom conversation quote', async () => {
    const { accessToken } = tokenService.issueAccessToken(adminUser)
    const res = await app.handle(
      new Request('http://localhost/api/admin/psychologists/psych-001', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'syazka-adira',
          status: 'active',
          name: 'Syazka Adira',
          nickname: 'Syazka',
          credential: 'M.Psi., Psikolog',
          licenseNumber: '12345678',
          experienceYears: 6,
          bookingUrl: 'https://attentive.id/book/syazka',
          featured: false,
          supportAreas: [{ supportArea: 'adultClinical', primary: true }],
          specializations: [{ label: { id: 'Kecemasan', en: 'Anxiety' } }],
          biography: { id: 'Bio ID', en: 'Bio EN' },
          conversationQuote: { id: 'Kutipan saya', en: 'My quote' },
          availabilityMessage: { id: 'Jadwal ID', en: 'Schedule EN' },
        }),
      })
    )
    expect(res.status).toBe(200)
    expect((await res.json()).psychologist.conversationQuote).toEqual({ id: 'Kutipan saya', en: 'My quote' })
  })
})
