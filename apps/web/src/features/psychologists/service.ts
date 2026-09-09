import { psychologistApi } from '@/lib/api'
import type {
  PsychologistExperienceLevel,
  PsychologistListQuery,
  PsychologistListResult,
  PsychologistLocale,
  PsychologistLookupResult,
  PsychologistProfile,
  PsychologistSummary,
  PsychologistSupportArea,
} from './types'

export interface PsychologistApiRecord {
  id: string
  slug: string
  name: string
  nickname: string
  credential: string
  supportArea: PsychologistSupportArea
  supportAreas: PsychologistSupportArea[]
  specializations: string[]
  experienceYears: number
  licenseNumber: string
  bookingUrl: string
  premiumBookingUrl: string | null
  featured: boolean
  featuredOrder: number | null
  biography: string
  availabilityMessage: string
  media?: {
    url: string
    width: number
    height: number
    alt: { id: string; en: string }
  }
}

interface ApiResult<Data> {
  data: Data | null
  error: unknown
}

interface PsychologistListEnvelope {
  status: 'found'
  psychologists: PsychologistApiRecord[]
}

type PsychologistLookupEnvelope =
  | { status: 'found'; psychologist: PsychologistApiRecord }
  | { status: 'unavailable'; psychologist: { slug: string; name: string; nickname: string } }
  | { status: 'notFound' }

export interface PsychologistApiBoundary {
  list(query: {
    locale: PsychologistLocale
    search?: string
    supportArea?: PsychologistSupportArea
    minimumExperienceYears?: number
    limit: number
    offset: number
  }): Promise<ApiResult<PsychologistListEnvelope>>
  featured(locale: PsychologistLocale): Promise<ApiResult<PsychologistListEnvelope>>
  getBySlug(slug: string, locale: PsychologistLocale): Promise<ApiResult<PsychologistLookupEnvelope>>
}

const defaultBoundary: PsychologistApiBoundary = {
  async list(query) {
    const result = await psychologistApi.list(query)
    return { data: result.data as PsychologistListEnvelope | null, error: result.error }
  },
  async featured(locale) {
    const result = await psychologistApi.featured(locale)
    return { data: result.data as PsychologistListEnvelope | null, error: result.error }
  },
  async getBySlug(slug, locale) {
    const result = await psychologistApi.getBySlug(slug, locale)
    return { data: result.data as PsychologistLookupEnvelope | null, error: result.error }
  },
}

const experienceRange = (level: PsychologistExperienceLevel | 'all' | undefined) => {
  if (!level || level === 'all') return { minimum: undefined, maximum: undefined }
  if (level === 'earlyCareer') return { minimum: 0, maximum: 2 }
  if (level === 'midLevel') return { minimum: 3, maximum: 6 }
  if (level === 'seniorLevel') return { minimum: 7, maximum: 9 }
  return { minimum: 10, maximum: 80 }
}

const mapPsychologistSummary = (record: PsychologistApiRecord): PsychologistSummary => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  nickname: record.nickname,
  credential: record.credential,
  supportArea: record.supportArea,
  supportAreas: [...record.supportAreas],
  ...(record.media ? { imageUrl: record.media.url, media: { ...record.media, alt: { ...record.media.alt } } } : {}),
  specializations: [...record.specializations],
  experienceYears: record.experienceYears,
  experienceLabel: `${record.experienceYears} Years`,
  bookingUrl: record.bookingUrl,
  ...(record.licenseNumber ? { licenseNumber: record.licenseNumber } : {}),
  featured: record.featured,
  featuredOrder: record.featuredOrder,
})

const mapPsychologistProfile = (record: PsychologistApiRecord): PsychologistProfile => ({
  ...mapPsychologistSummary(record),
  biography: record.biography,
  availabilityMessage: record.availabilityMessage,
  ...(record.premiumBookingUrl ? { premiumBookingUrl: record.premiumBookingUrl } : {}),
})

const hasTransportFailure = (result: ApiResult<unknown>) => result.error !== null || result.data === null

export const createPsychologistService = (boundary: PsychologistApiBoundary = defaultBoundary) => {
  const listPsychologists = async (query: PsychologistListQuery = {}): Promise<PsychologistListResult> => {
    const locale = query.locale ?? 'en'
    const search = query.search?.trim()
    const range = experienceRange(query.experienceLevel)
    try {
      const result = await boundary.list({
        locale,
        ...(search ? { search } : {}),
        ...(query.supportArea && query.supportArea !== 'all' ? { supportArea: query.supportArea } : {}),
        ...(range.minimum === undefined ? {} : { minimumExperienceYears: range.minimum }),
        limit: 50,
        offset: 0,
      })
      if (hasTransportFailure(result)) return { status: 'error' }
      const psychologists = result.data!.psychologists
        .filter(({ experienceYears }) => range.maximum === undefined || experienceYears <= range.maximum)
        .map(mapPsychologistSummary)
      return psychologists.length > 0
        ? { status: 'success', psychologists }
        : { status: 'empty', psychologists: [] }
    } catch {
      return { status: 'error' }
    }
  }

  const listFeaturedPsychologists = async (locale: PsychologistLocale = 'en'): Promise<PsychologistListResult> => {
    try {
      const result = await boundary.featured(locale)
      if (hasTransportFailure(result)) return { status: 'error' }
      const psychologists = result.data!.psychologists
        .map(mapPsychologistSummary)
        .sort((left, right) => (left.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (right.featuredOrder ?? Number.MAX_SAFE_INTEGER))
      return psychologists.length > 0
        ? { status: 'success', psychologists }
        : { status: 'empty', psychologists: [] }
    } catch {
      return { status: 'error' }
    }
  }

  const getPsychologistBySlug = async (
    slug: string,
    locale: PsychologistLocale = 'en',
  ): Promise<PsychologistLookupResult> => {
    try {
      const result = await boundary.getBySlug(slug.trim(), locale)
      if (hasTransportFailure(result)) return { status: 'error' }
      if (result.data!.status === 'notFound') return { status: 'not-found' }
      if (result.data!.status === 'unavailable') {
        return { status: 'unavailable', psychologist: result.data!.psychologist }
      }
      return { status: 'found', psychologist: mapPsychologistProfile(result.data!.psychologist) }
    } catch {
      return { status: 'error' }
    }
  }

  const listRelatedPsychologists = async (
    slug: string,
    limit = 3,
    locale: PsychologistLocale = 'en',
  ): Promise<PsychologistSummary[]> => {
    const lookup = await getPsychologistBySlug(slug, locale)
    if (lookup.status !== 'found') return []
    const result = await listPsychologists({ locale })
    if (result.status !== 'success') return []
    return result.psychologists
      .filter((candidate) => candidate.id !== lookup.psychologist.id)
      .sort((first, second) => {
        const firstMatches = first.supportAreas.includes(lookup.psychologist.supportArea) ? 1 : 0
        const secondMatches = second.supportAreas.includes(lookup.psychologist.supportArea) ? 1 : 0
        return secondMatches - firstMatches
      })
      .slice(0, Math.max(0, limit))
  }

  return {
    listPsychologists,
    listFeaturedPsychologists,
    getPsychologistBySlug,
    listRelatedPsychologists,
  }
}

const service = createPsychologistService()

export const listPsychologists = service.listPsychologists
export const listFeaturedPsychologists = service.listFeaturedPsychologists
export const getPsychologistBySlug = service.getPsychologistBySlug
export const listRelatedPsychologists = service.listRelatedPsychologists
