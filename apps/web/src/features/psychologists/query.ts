import type {
  PsychologistExperienceLevel,
  PsychologistListQuery,
  PsychologistSupportArea,
} from './types'

export const psychologistSupportAreaOptions = [
  'all',
  'adultClinical',
  'childAdolescent',
  'educational',
] as const satisfies readonly (PsychologistSupportArea | 'all')[]

export const psychologistExperienceOptions = [
  'all',
  'earlyCareer',
  'midLevel',
  'seniorLevel',
  'principalLevel',
] as const satisfies readonly (PsychologistExperienceLevel | 'all')[]

const isSupportArea = (
  value: string | null,
): value is PsychologistSupportArea | 'all' =>
  psychologistSupportAreaOptions.some((option) => option === value)

const isExperienceLevel = (
  value: string | null,
): value is PsychologistExperienceLevel | 'all' =>
  psychologistExperienceOptions.some((option) => option === value)

export function parsePsychologistListQuery(searchParams: URLSearchParams): PsychologistListQuery {
  const search = searchParams.get('q')?.trim()
  const supportArea = searchParams.get('support')
  const experienceLevel = searchParams.get('experience')

  return {
    search: search || undefined,
    supportArea: isSupportArea(supportArea) ? supportArea : 'all',
    experienceLevel: isExperienceLevel(experienceLevel) ? experienceLevel : 'all',
  }
}

export function createPsychologistListSearchParams(query: PsychologistListQuery) {
  const searchParams = new URLSearchParams()
  const search = query.search?.trim()

  if (search) searchParams.set('q', search)
  if (query.supportArea && query.supportArea !== 'all') {
    searchParams.set('support', query.supportArea)
  }
  if (query.experienceLevel && query.experienceLevel !== 'all') {
    searchParams.set('experience', query.experienceLevel)
  }

  return searchParams
}
