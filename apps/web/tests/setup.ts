import '@testing-library/jest-dom/vitest'
import '../src/i18n'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import i18n from '../src/i18n'

vi.mock('../src/lib/api', async () => {
  const { psychologists } = await import('../src/data/psychologists')
  const rows = psychologists.map((psychologist, index) => ({
    id: `psychologist-${psychologist.id}`,
    slug: psychologist.id,
    name: psychologist.name,
    nickname: psychologist.nickname,
    credential: psychologist.title,
    supportArea: psychologist.category,
    supportAreas: [psychologist.category],
    specializations: psychologist.specializations,
    experienceYears: Number.parseInt(psychologist.experience, 10) || 1,
    licenseNumber: psychologist.sipp,
    bookingUrl: psychologist.reservationLink,
    premiumBookingUrl: psychologist.premiumLink,
    featured: true,
    featuredOrder: index,
    biography: `${psychologist.nickname} provides professional psychological support.`,
    availabilityMessage: 'Contact admin for availability.',
    media: {
      url: psychologist.image,
      width: 600,
      height: 750,
      alt: { id: `Foto profil ${psychologist.name}`, en: `Profile photo of ${psychologist.name}` },
    },
  }))

  return {
    psychologistApi: {
      list: async (query: {
        search?: string
        supportArea?: string
        minimumExperienceYears?: number
      }) => {
        const search = query.search?.toLocaleLowerCase()
        const filtered = rows.filter((psychologist) => (
          (!search || [psychologist.name, psychologist.nickname, ...psychologist.specializations]
            .some((value) => value.toLocaleLowerCase().includes(search)))
          && (!query.supportArea || psychologist.supportArea === query.supportArea)
          && (query.minimumExperienceYears === undefined || psychologist.experienceYears >= query.minimumExperienceYears)
        ))
        return { data: { status: 'found', psychologists: filtered }, error: null }
      },
      featured: async () => ({ data: { status: 'found', psychologists: rows }, error: null }),
      getBySlug: async (slug: string) => {
        const psychologist = rows.find((candidate) => candidate.slug === slug)
        return {
          data: psychologist
            ? { status: 'found', psychologist }
            : { status: 'notFound' },
          error: null,
        }
      },
    },
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
    writable: true,
  })
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  })
  vi.stubGlobal('IntersectionObserver', class {
    disconnect = vi.fn()
    observe = vi.fn()
    root = null
    rootMargin = ''
    takeRecords = vi.fn(() => [])
    thresholds = []
    unobserve = vi.fn()
  })
  vi.stubGlobal('ResizeObserver', class {
    disconnect = vi.fn()
    observe = vi.fn()
    unobserve = vi.fn()
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
