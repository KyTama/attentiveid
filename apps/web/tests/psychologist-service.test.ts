import { describe, expect, it } from 'vitest'
import {
  createPsychologistListSearchParams,
  parsePsychologistListQuery,
} from '../src/features/psychologists'
import {
  createPsychologistService,
  type PsychologistApiBoundary,
  type PsychologistApiRecord,
} from '../src/features/psychologists/service'

const psychologist = (overrides: Partial<PsychologistApiRecord> = {}): PsychologistApiRecord => ({
  id: 'psychologist-1',
  slug: 'syazka',
  name: 'Syazka Kirani Narindra',
  nickname: 'Syazka',
  credential: 'M.Psi., Psikolog',
  supportArea: 'adultClinical',
  supportAreas: ['adultClinical'],
  specializations: ['Trauma', 'Anxiety'],
  experienceYears: 6,
  licenseNumber: '20190974-2021-02-1552',
  bookingUrl: 'https://wa.me/6285156410912',
  premiumBookingUrl: 'https://wa.me/6285156410912?premium=1',
  featured: true,
  featuredOrder: 0,
  biography: 'Supportive clinical psychologist.',
  availabilityMessage: 'Contact admin for availability.',
  media: {
    url: '/media/psychologists/syazka.webp',
    width: 600,
    height: 750,
    alt: { id: 'Foto profil Syazka', en: 'Profile photo of Syazka' },
  },
  ...overrides,
})

const createBoundary = (rows: PsychologistApiRecord[] = [psychologist()]) => {
  const queries: unknown[] = []
  const boundary: PsychologistApiBoundary = {
    list: async (query) => {
      queries.push(query)
      return { data: { status: 'found', psychologists: rows }, error: null }
    },
    featured: async (locale) => {
      queries.push({ locale, featured: true })
      return { data: { status: 'found', psychologists: rows.filter(({ featured }) => featured) }, error: null }
    },
    getBySlug: async (slug) => ({
      data: slug === 'syazka'
        ? { status: 'found', psychologist: rows[0]! }
        : slug === 'inactive'
          ? { status: 'unavailable', psychologist: { slug, name: 'Inactive Psychologist', nickname: 'Inactive' } }
          : { status: 'notFound' },
      error: null,
    }),
  }
  return { boundary, queries }
}

describe('psychologist service', () => {
  it('passes normalized search and filter input through the API boundary', async () => {
    const harness = createBoundary()
    const service = createPsychologistService(harness.boundary)
    const result = await service.listPsychologists({
      locale: 'en',
      search: "  100%_match' OR 1=1--  ",
      supportArea: 'adultClinical',
      experienceLevel: 'midLevel',
    })

    expect(result.status).toBe('success')
    expect(harness.queries[0]).toEqual({
      locale: 'en',
      search: "100%_match' OR 1=1--",
      supportArea: 'adultClinical',
      minimumExperienceYears: 3,
      limit: 50,
      offset: 0,
    })
  })

  it('keeps canonical IDs, license, booking, localization, and media geometry', async () => {
    const service = createPsychologistService(createBoundary().boundary)
    const result = await service.getPsychologistBySlug('syazka', 'en')

    expect(result.status).toBe('found')
    if (result.status === 'found') {
      expect(result.psychologist.id).toBe('psychologist-1')
      expect(result.psychologist.slug).toBe('syazka')
      expect(result.psychologist.licenseNumber).toBe('20190974-2021-02-1552')
      expect(result.psychologist.bookingUrl).toContain('https://wa.me/')
      expect(result.psychologist.biography).toContain('Supportive')
      expect(result.psychologist.media).toMatchObject({ width: 600, height: 750 })
    }
  })

  it('preserves empty, unavailable, not-found, and transport-error states', async () => {
    const empty = createPsychologistService(createBoundary([]).boundary)
    await expect(empty.listPsychologists()).resolves.toEqual({ status: 'empty', psychologists: [] })

    const service = createPsychologistService(createBoundary().boundary)
    await expect(service.getPsychologistBySlug('inactive', 'id')).resolves.toMatchObject({ status: 'unavailable' })
    await expect(service.getPsychologistBySlug('missing', 'id')).resolves.toEqual({ status: 'not-found' })

    const failingBoundary: PsychologistApiBoundary = {
      list: async () => ({ data: null, error: { status: 503 } }),
      featured: async () => ({ data: null, error: { status: 503 } }),
      getBySlug: async () => ({ data: null, error: { status: 503 } }),
    }
    const failing = createPsychologistService(failingBoundary)
    await expect(failing.listPsychologists()).resolves.toEqual({ status: 'error' })
    await expect(failing.getPsychologistBySlug('syazka')).resolves.toEqual({ status: 'error' })
  })

  it('prioritizes related active psychologists from the same support area', async () => {
    const rows = [
      psychologist(),
      psychologist({ id: 'psychologist-2', slug: 'gita', featuredOrder: 1 }),
      psychologist({ id: 'psychologist-3', slug: 'sekar', supportArea: 'educational', supportAreas: ['educational'], featuredOrder: 2 }),
    ]
    const related = await createPsychologistService(createBoundary(rows).boundary)
      .listRelatedPsychologists('syazka', 2, 'en')

    expect(related.map(({ slug }) => slug)).toEqual(['gita', 'sekar'])
  })

  it('ignores invalid URL filters and writes canonical query parameters', () => {
    const parsed = parsePsychologistListQuery(new URLSearchParams('q=%20syazka%20&support=unknown&experience=midLevel'))

    expect(parsed).toEqual({
      search: 'syazka',
      supportArea: 'all',
      experienceLevel: 'midLevel',
    })
    expect(createPsychologistListSearchParams(parsed).toString()).toBe('q=syazka&experience=midLevel')
  })
})
