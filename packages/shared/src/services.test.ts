import { describe, expect, it } from 'bun:test'
import { Value } from '@sinclair/typebox/value'
import {
  buildBookingWhatsAppMessage,
  matchServicesForNeed,
  PublicServiceCatalogResponseSchema,
  scoreServiceAssistantQuery,
  validateBookingSubmission,
  type PublicServiceSummary,
} from './index'

const makeService = (overrides: Partial<PublicServiceSummary>): PublicServiceSummary => ({
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'konseling-dewasa',
  categoryId: 'cat-1',
  categorySlug: 'konseling',
  categoryName: 'Konseling/Terapi',
  subgroupId: null,
  subgroupSlug: null,
  subgroupName: null,
  serviceType: 'layanan',
  pricingModel: 'psychologist_rate',
  appliesNewClientFee: true,
  isAssessment: false,
  isFeaturedSpotlight: false,
  position: 1,
  name: 'Konseling Individu Dewasa',
  badge: null,
  shortSummary: 'Konseling individu bersama psikolog klinis dewasa.',
  benefit: 'Mendampingi kecemasan, stres, dan burnout.',
  audiences: ['Dewasa'],
  modalities: ['online', 'offline'],
  hasMalangBranch: false,
  priceRange: {
    minAmount: 400_000,
    maxAmount: 1_000_000,
    isRange: true,
    variesByProvider: true,
    promoAmount: null,
    promoBadge: null,
    promoNote: null,
    programSlug: null,
  },
  cardMedia: null,
  variants: [],
  bookingPreset: {
    bookable: true,
    bookingPath: '/booking?service=konseling-dewasa',
    externalUrl: null,
    defaultConcernId: 'anxiety',
    defaultClientCategory: 'individual',
    requiresInitialCounseling: false,
  },
  ...overrides,
})

describe('services shared contracts & recommender', () => {
  it('enforces additionalProperties: false on PublicServiceCatalogResponseSchema', () => {
    const validCatalog = {
      locale: 'id' as const,
      categories: [{ id: 'c1', slug: 'konseling', position: 1, isFree: false, name: 'Konseling' }],
      subgroups: [],
      activePrograms: [],
      services: [makeService({})],
    }

    expect(Value.Check(PublicServiceCatalogResponseSchema, validCatalog)).toBe(true)

    const withLeakedInternalField = {
      ...validCatalog,
      services: [
        {
          ...makeService({}),
          fee: 100_000,
        },
      ],
    }

    expect(Value.Check(PublicServiceCatalogResponseSchema, withLeakedInternalField)).toBe(false)
  })

  it('intercepts crisis keywords immediately and returns hotlines without recommendations', () => {
    const services = [makeService({}), makeService({ slug: 'rmhcu', name: 'Cek Kesehatan Mental (R-MHCU)', isAssessment: true })]
    const result = scoreServiceAssistantQuery('saya merasa ingin bunuh diri dan tidak kuat lagi', services, 'id')

    expect(result.crisisDetected).toBe(true)
    expect(result.hotlines.length).toBeGreaterThan(0)
    expect(result.matches).toEqual([])
  })

  it('matches services deterministically by need and excludes addons', () => {
    const services = [
      makeService({ slug: 'konseling-dewasa', serviceType: 'layanan' }),
      makeService({ slug: 'rmhcu', serviceType: 'layanan', modalities: ['online'], isAssessment: true }),
      makeService({ slug: 'addon-weekend', serviceType: 'addon' }),
    ]

    const needMatches = matchServicesForNeed(services, { needId: 'n-skrining', modality: 'online' })
    expect(needMatches.map((s) => s.slug)).toEqual(['rmhcu'])

    const textMatches = scoreServiceAssistantQuery('cek kesehatan mental skrining', services, 'id')
    expect(textMatches.crisisDetected).toBe(false)
    expect(textMatches.matches[0]?.slug).toBe('rmhcu')
  })

  it('validates optional serviceSlug/variantSlug and renders serviceLabel in WhatsApp messages', () => {
    const basePayload = {
      language: 'id',
      clientStatus: 'new',
      name: 'Budi Santoso',
      whatsapp: '081234567890',
      email: 'budi@example.com',
      age: 26,
      gender: 'male',
      concernId: 'attention',
      consultationMode: 'online',
      psychologistChoice: 'recommended',
      scheduleOption1: '20-11-2026 · 10:00 WIB',
    }

    const ok = validateBookingSubmission({
      ...basePayload,
      serviceSlug: '  Profil-Kognitif-Lengkap ',
      variantSlug: 'v-pkl',
    })
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.value.serviceSlug).toBe('profil-kognitif-lengkap')
      expect(ok.value.variantSlug).toBe('v-pkl')
    }

    const bad = validateBookingSubmission({
      ...basePayload,
      serviceSlug: '../etc/passwd',
    })
    expect(bad.ok).toBe(false)

    const msg = buildBookingWhatsAppMessage({
      lang: 'id',
      name: 'Budi Santoso',
      whatsapp: '081234567890',
      email: 'budi@example.com',
      clientStatus: 'new',
      serviceLabel: 'Profil Kognitif Lengkap',
      variantLabel: 'Paket Standar',
      concernLabel: 'Atensi / ADHD',
      consultationMode: 'online',
      psychChoiceLabel: 'Rekomendasi Attentive',
      scheduleOption1: '20-11-2026 · 10:00 WIB',
      baseRate: 1_650_000,
      assessmentFee: 0,
      totalRate: 1_650_000,
    })
    expect(msg).toContain('Layanan: Profil Kognitif Lengkap (Paket Standar)')
  })
})
