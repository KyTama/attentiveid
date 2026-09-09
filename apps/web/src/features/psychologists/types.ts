export type PsychologistLocale = 'id' | 'en'

export type PsychologistSupportArea =
  | 'adultClinical'
  | 'childAdolescent'
  | 'educational'

export type PsychologistExperienceLevel =
  | 'earlyCareer'
  | 'midLevel'
  | 'seniorLevel'
  | 'principalLevel'

export interface PsychologistListQuery {
  locale?: PsychologistLocale
  search?: string
  supportArea?: PsychologistSupportArea | 'all'
  experienceLevel?: PsychologistExperienceLevel | 'all'
}

export interface PsychologistMedia {
  url: string
  width: number
  height: number
  alt: { id: string; en: string }
}

export interface PsychologistSummary {
  id: string
  slug: string
  name: string
  nickname: string
  credential: string
  supportArea: PsychologistSupportArea
  supportAreas: PsychologistSupportArea[]
  imageUrl?: string
  media?: PsychologistMedia
  specializations: string[]
  experienceYears: number
  experienceLabel: string
  bookingUrl: string
  licenseNumber?: string
  featured: boolean
  featuredOrder: number | null
}

export interface PsychologistProfile extends PsychologistSummary {
  biography: string
  availabilityMessage: string
  premiumBookingUrl?: string
}

export type PsychologistListResult =
  | { status: 'success'; psychologists: PsychologistSummary[] }
  | { status: 'empty'; psychologists: [] }
  | { status: 'error' }

export type PsychologistLookupResult =
  | { status: 'found'; psychologist: PsychologistProfile }
  | { status: 'unavailable'; psychologist: { slug: string; name: string; nickname: string } }
  | { status: 'not-found' }
  | { status: 'error' }

export type PsychologistListState =
  | { status: 'loading' }
  | PsychologistListResult

export type PsychologistProfileState =
  | { status: 'loading' }
  | { status: 'found'; psychologist: PsychologistProfile; related: PsychologistSummary[] }
  | { status: 'unavailable'; psychologist: { slug: string; name: string; nickname: string } }
  | { status: 'not-found' }
  | { status: 'error' }
