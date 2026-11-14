import { describe, expect, it } from 'vitest'
import { toBookingPsychologist } from '@/features/psychologists/use-booking-psychologists'
import type { PsychologistSummary } from '@/features/psychologists/types'

const summary: PsychologistSummary = {
  id: 'uuid-1',
  slug: 'gisella',
  name: 'Gisella Tani Pratiwi',
  nickname: 'Ella',
  credential: 'M.Psi., Psikolog',
  supportArea: 'childAdolescent',
  supportAreas: ['childAdolescent'],
  imageUrl: '/media/ella.jpg',
  specializations: ['Trauma'],
  experienceYears: 15,
  experienceLabel: '15 Tahun',
  bookingUrl: 'https://wa.me/1?text=a',
  licenseNumber: 'STR-1',
  featured: true,
  featuredOrder: 1,
  shortBio: 'Bio',
}

describe('toBookingPsychologist', () => {
  it('maps portal data to the booking pop-up shape using the slug as id', () => {
    const result = toBookingPsychologist(summary)
    expect(result).toMatchObject({
      id: 'gisella',
      category: 'childAdolescent',
      image: '/media/ella.jpg',
      sipp: 'STR-1',
      experience: '15 Tahun',
      reservationLink: 'https://wa.me/1?text=a',
      premiumLink: 'https://wa.me/1?text=a',
    })
  })
})
