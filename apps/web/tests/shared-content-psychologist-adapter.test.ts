import { describe, expect, it } from 'vitest'
import { createPsychologistService, type PsychologistApiBoundary, type PsychologistApiRecord } from '../src/features/psychologists/service'

const canonical: PsychologistApiRecord = {
  id: 'canonical-psychologist-id',
  slug: 'same-slug-all-locales',
  name: 'Canonical Psychologist',
  nickname: 'Canonical',
  credential: 'M.Psi., Psikolog',
  supportArea: 'adultClinical',
  supportAreas: ['adultClinical'],
  specializations: ['Trauma-informed care'],
  experienceYears: 8,
  licenseNumber: 'SIPP-CANONICAL',
  bookingUrl: 'https://wa.me/6285156410912',
  premiumBookingUrl: null,
  featured: true,
  featuredOrder: 2,
  biography: 'Canonical biography.',
  availabilityMessage: 'Canonical availability.',
  media: {
    url: '/media/psychologists/canonical.webp',
    width: 800,
    height: 1000,
    alt: { id: 'Foto profil canonical', en: 'Canonical profile photo' },
  },
}

describe('shared content psychologist adapter', () => {
  it('keeps one API identity across featured, directory, profile, and related projections', async () => {
    const other = { ...canonical, id: 'other-id', slug: 'other', featured: false, featuredOrder: null }
    const boundary: PsychologistApiBoundary = {
      list: async () => ({ data: { status: 'found', psychologists: [canonical, other] }, error: null }),
      featured: async () => ({ data: { status: 'found', psychologists: [canonical] }, error: null }),
      getBySlug: async (slug) => ({
        data: { status: 'found', psychologist: slug === other.slug ? other : canonical },
        error: null,
      }),
    }
    const service = createPsychologistService(boundary)
    const featured = await service.listFeaturedPsychologists('id')
    const directory = await service.listPsychologists({ locale: 'en' })
    const profile = await service.getPsychologistBySlug(canonical.slug, 'id')
    const related = await service.listRelatedPsychologists('other', 3, 'en')

    expect(featured.status).toBe('success')
    expect(directory.status).toBe('success')
    expect(profile.status).toBe('found')
    if (featured.status === 'success' && directory.status === 'success' && profile.status === 'found') {
      expect(featured.psychologists[0]?.id).toBe(canonical.id)
      expect(directory.psychologists[0]?.id).toBe(canonical.id)
      expect(profile.psychologist.id).toBe(canonical.id)
    }
    expect(related[0]?.id).toBe(canonical.id)
  })

  it('has no runtime dependency on the legacy psychologist fixture module', async () => {
    const source = await import('../src/features/psychologists/service.ts?raw')
    expect(source.default).not.toContain('@/data/psychologists')
    expect(source.default).not.toContain('src/data/psychologists')
    expect(source.default).toContain("from '@/lib/api'")
  })

  it('uses the browser origin when no API URL is configured for the deployment', async () => {
    const source = await import('../src/lib/api.ts?raw')

    expect(source.default).toContain('window.location.origin')
    expect(source.default).not.toContain("'http://localhost:3000'")
  })

  it('passes adversarial slugs to the encoding boundary and exposes allowlisted fields only', async () => {
    const slugs: string[] = []
    const boundary: PsychologistApiBoundary = {
      list: async () => ({ data: { status: 'found', psychologists: [] }, error: null }),
      featured: async () => ({ data: { status: 'found', psychologists: [] }, error: null }),
      getBySlug: async (slug) => {
        slugs.push(slug)
        return { data: { status: 'notFound' }, error: null }
      },
    }
    const service = createPsychologistService(boundary)
    await service.getPsychologistBySlug("safe' OR 1=1 --", 'en')
    expect(slugs).toEqual(["safe' OR 1=1 --"])
    expect(Object.keys(canonical).sort()).not.toContain('password')
    expect(Object.keys(canonical).sort()).not.toContain('status')
  })
})
