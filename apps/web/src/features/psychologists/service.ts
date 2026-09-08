import { psychologists, type Psychologist } from '@/data/psychologists'
import type {
  PsychologistExperienceLevel,
  PsychologistListQuery,
  PsychologistListResult,
  PsychologistLookupResult,
  PsychologistProfile,
  PsychologistSummary,
} from './types'

const normalizeSearchValue = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('id-ID')

const parseExperienceYears = (experience: string) => {
  const years = Number.parseInt(experience.match(/\d+/)?.[0] ?? '0', 10)
  return Number.isNaN(years) ? 0 : years
}

const getExperienceLevel = (years: number): PsychologistExperienceLevel => {
  if (years >= 10) return 'principalLevel'
  if (years >= 7) return 'seniorLevel'
  if (years >= 3) return 'midLevel'
  return 'earlyCareer'
}

const mapPsychologistProfile = (fixture: Psychologist): PsychologistProfile => ({
  slug: fixture.id,
  name: fixture.name,
  nickname: fixture.nickname,
  credential: fixture.title,
  supportArea: fixture.category,
  imageUrl: fixture.image,
  specializations: [...fixture.specializations],
  experienceYears: parseExperienceYears(fixture.experience),
  experienceLabel: fixture.experience,
  bookingUrl: fixture.reservationLink,
  licenseNumber: fixture.sipp,
  premiumBookingUrl: fixture.premiumLink,
})

const mapPsychologistSummary = (fixture: Psychologist): PsychologistSummary => ({
  slug: fixture.id,
  name: fixture.name,
  nickname: fixture.nickname,
  credential: fixture.title,
  supportArea: fixture.category,
  imageUrl: fixture.image,
  specializations: [...fixture.specializations],
  experienceYears: parseExperienceYears(fixture.experience),
  experienceLabel: fixture.experience,
  bookingUrl: fixture.reservationLink,
  licenseNumber: fixture.sipp === '-' ? undefined : fixture.sipp,
})

const matchesQuery = (psychologist: PsychologistSummary, query: PsychologistListQuery) => {
  const search = normalizeSearchValue(query.search ?? '')
  const searchableText = normalizeSearchValue([
    psychologist.name,
    psychologist.nickname,
    ...psychologist.specializations,
  ].join(' '))

  const matchesSearch = search.length === 0 || searchableText.includes(search)
  const matchesSupportArea = !query.supportArea
    || query.supportArea === 'all'
    || psychologist.supportArea === query.supportArea
  const matchesExperience = !query.experienceLevel
    || query.experienceLevel === 'all'
    || getExperienceLevel(psychologist.experienceYears) === query.experienceLevel

  return matchesSearch && matchesSupportArea && matchesExperience
}

export async function listPsychologists(
  query: PsychologistListQuery = {},
): Promise<PsychologistListResult> {
  const matchedPsychologists = psychologists
    .map(mapPsychologistSummary)
    .filter((psychologist) => matchesQuery(psychologist, query))

  if (matchedPsychologists.length === 0) {
    return { status: 'empty', psychologists: [] }
  }

  return { status: 'success', psychologists: matchedPsychologists }
}

export async function getPsychologistBySlug(slug: string): Promise<PsychologistLookupResult> {
  const normalizedSlug = normalizeSearchValue(slug)
  const fixture = psychologists.find(
    (psychologist) => normalizeSearchValue(psychologist.id) === normalizedSlug,
  )

  if (!fixture) {
    return { status: 'not-found' }
  }

  return { status: 'found', psychologist: mapPsychologistProfile(fixture) }
}

export async function listRelatedPsychologists(
  slug: string,
  limit = 3,
): Promise<PsychologistSummary[]> {
  const lookup = await getPsychologistBySlug(slug)

  if (lookup.status === 'not-found') {
    return []
  }

  const candidates = psychologists
    .map(mapPsychologistSummary)
    .filter((psychologist) => psychologist.slug !== lookup.psychologist.slug)
    .sort((first, second) => {
      const firstMatches = first.supportArea === lookup.psychologist.supportArea ? 1 : 0
      const secondMatches = second.supportArea === lookup.psychologist.supportArea ? 1 : 0
      return secondMatches - firstMatches
    })

  return candidates.slice(0, Math.max(0, limit))
}
