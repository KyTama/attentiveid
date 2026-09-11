import { describe, expect, it } from 'bun:test'
import {
  detectCrisisKeywords,
  matchPsychologists,
  generateIntakeWhatsAppMessage,
  type PsychologistCandidate,
} from './intake'

const mockPsychologists: PsychologistCandidate[] = [
  {
    id: 'syazka',
    name: 'Syazka Kirani Narindra',
    nickname: 'Syazka',
    title: 'M.Psi., Psikolog',
    category: 'adultClinical',
    gender: 'female',
    specializations: ['Gangguan kepribadian', 'Trauma', 'Gangguan mood', 'Gangguan kecemasan'],
    experience: '6 Tahun',
    sipp: '20190974-2021-02-1552',
  },
  {
    id: 'dewinta',
    name: 'Dewinta Harahap',
    nickname: 'Dewinta',
    title: 'M.Psi., Psikolog',
    category: 'adultClinical',
    gender: 'female',
    specializations: ['Gangguan kecemasan', 'Stres kerja / burnout', 'Pengembangan Diri'],
    experience: '5 Tahun',
    sipp: '20200812-2022-01-1401',
  },
  {
    id: 'ilham',
    name: 'Ilham Ramadhan',
    nickname: 'Ilham',
    title: 'M.Psi., Psikolog',
    category: 'childAdolescent',
    gender: 'male',
    specializations: ['Perkembangan anak', 'Tantangan remaja', 'Pola asuh keluarga', 'ADHD'],
    experience: '4 Tahun',
    sipp: '20210519-2023-03-1620',
  },
  {
    id: 'gita',
    name: 'Anggita Panjaitan',
    nickname: 'Gita',
    title: 'M.Psi., Psikolog',
    category: 'adultClinical',
    gender: 'female',
    specializations: ['Hubungan romantis', 'Konflik keluarga', 'Komunikasi pasangan'],
    experience: '7 Tahun',
    sipp: '20180411-2020-01-1299',
  },
]

describe('Intake Domain & Safeguards', () => {
  describe('Crisis Detection', () => {
    it('detects crisis keywords correctly', () => {
      const result = detectCrisisKeywords('Saya merasa sangat putus asa dan ada pikiran untuk melukai diri sendiri.')
      expect(result.isCrisisDetected).toBe(true)
      expect(result.matchedKeywords).toContain('melukai diri')
    })

    it('returns false for normal therapeutic concerns', () => {
      const result = detectCrisisKeywords('Saya sering overthinking soal deadline kerja dan susah tidur.')
      expect(result.isCrisisDetected).toBe(false)
      expect(result.matchedKeywords).toHaveLength(0)
    })
  })

  describe('Multi-Psychologist Matching Engine', () => {
    it('returns top curated options (>1 psychologists) sorted by score', () => {
      const matches = matchPsychologists(
        {
          concernId: 'anxiety_mood',
          genderPreference: 'any',
          clientCategory: 'individual',
        },
        mockPsychologists,
        { maxResults: 3 }
      )

      expect(matches.length).toBeGreaterThan(1)
      expect(matches.length).toBeLessThanOrEqual(3)
      // Highest match should be adult clinical with anxiety/mood
      expect(['syazka', 'dewinta']).toContain(matches[0].psychologist.id)
      expect(matches[0].score).toBeGreaterThan(matches[matches.length - 1].score)
      expect(matches[0].matchReasons.length).toBeGreaterThan(0)
    })

    it('respects child/adolescent concern and ranks child psychologist higher', () => {
      const matches = matchPsychologists(
        {
          concernId: 'child_adolescent',
          genderPreference: 'any',
          clientCategory: 'child_teen',
        },
        mockPsychologists
      )

      expect(matches[0].psychologist.id).toBe('ilham')
      expect(matches[0].psychologist.category).toBe('childAdolescent')
    })

    it('filters according to gender preferences when specified', () => {
      const matchesMale = matchPsychologists(
        {
          concernId: 'anxiety_mood',
          genderPreference: 'male',
          clientCategory: 'individual',
        },
        mockPsychologists
      )

      expect(matchesMale[0].psychologist.gender).toBe('male')
    })
  })

  describe('WhatsApp Message Generation', () => {
    it('generates structured WhatsApp message in Indonesian', () => {
      const text = generateIntakeWhatsAppMessage(
        {
          concernId: 'career_burnout',
          format: 'online',
          genderPreference: 'any',
          clientCategory: 'individual',
          name: 'Budi Santoso',
          whatsapp: '08123456789',
          preferredDate: '2026-09-20',
          problemDescription: 'Burnout berat karena lembur berkepanjangan.',
          selectedPsychologistName: 'Dewinta Harahap',
          consent: true,
        },
        'id'
      )

      expect(text).toContain('Halo admin Attentive')
      expect(text).toContain('Budi Santoso')
      expect(text).toContain('Dewinta Harahap')
      expect(text).toContain('Burnout berat')
      expect(text).toContain('Online (Video Call)')
    })

    it('generates structured WhatsApp message in English', () => {
      const text = generateIntakeWhatsAppMessage(
        {
          concernId: 'anxiety_mood',
          format: 'offline',
          genderPreference: 'female',
          clientCategory: 'individual',
          name: 'Jane Doe',
          whatsapp: '+628123456789',
          preferredDate: '2026-09-22',
          problemDescription: 'Experiencing frequent panic attacks.',
          selectedPsychologistName: 'Syazka Kirani Narindra',
          consent: true,
        },
        'en'
      )

      expect(text).toContain('Hello Admin Attentive')
      expect(text).toContain('Jane Doe')
      expect(text).toContain('Syazka Kirani Narindra')
      expect(text).toContain('In-person')
    })
  })
})
