import type { PsychologistCategory } from '@/data/psychologists'

export type PsychologistSupportArea = PsychologistCategory

export type PsychologistExperienceLevel =
  | 'earlyCareer'
  | 'midLevel'
  | 'seniorLevel'
  | 'principalLevel'

export interface PsychologistListQuery {
  search?: string
  supportArea?: PsychologistSupportArea | 'all'
  experienceLevel?: PsychologistExperienceLevel | 'all'
}

export interface PsychologistSummary {
  slug: string
  name: string
  nickname: string
  credential: string
  supportArea: PsychologistSupportArea
  imageUrl: string
  specializations: string[]
  experienceYears: number
  experienceLabel: string
  bookingUrl: string
}

export interface PsychologistProfile extends PsychologistSummary {
  licenseNumber?: string
  premiumBookingUrl?: string
}

export type PsychologistListResult =
  | { status: 'success'; psychologists: PsychologistSummary[] }
  | { status: 'empty'; psychologists: [] }

export type PsychologistLookupResult =
  | { status: 'found'; psychologist: PsychologistProfile }
  | { status: 'not-found' }

export type PsychologistListState =
  | { status: 'loading' }
  | PsychologistListResult
  | { status: 'error' }

export type PsychologistProfileState =
  | { status: 'loading' }
  | { status: 'found'; psychologist: PsychologistProfile; related: PsychologistSummary[] }
  | { status: 'not-found' }
  | { status: 'error' }
