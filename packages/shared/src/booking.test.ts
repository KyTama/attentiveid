import { describe, expect, test } from 'bun:test'
import {
  BOOKING_ASSESSMENT_FEE,
  BOOKING_BRANCH_LABELS,
  BOOKING_CONCERNS,
  BOOKING_MARKETING_SOURCES,
  BOOKING_SHEET_LOCATION_VALUES,
  BOOKING_WHATSAPP_NUMBERS,
  ZITE_PSYCHOLOGIST_BOOKING_DEFAULTS,
  bookingsToCsv,
  buildBookingWhatsAppMessage,
  buildWeekSchedule,
  canTransitionBookingStatus,
  filterScheduleByLocation,
  getAvailableHours,
  getAvailableMinutes,
  getEarliestBookingDateWib,
  mapBookingConcernToIntakeConcern,
  normalizeBookingBranch,
  normalizeBookingConcernId,
  normalizeEmail,
  normalizeWhatsAppToE164,
  parseDaySchedule,
  resolveBookingWhatsAppRouting,
  validateBookingSubmission,
  type BookingAdminRecord,
} from './booking'
import { validateFullPsychologistMutation } from './content'

describe('Booking Domain Contract (packages/shared/src/booking.ts)', () => {
  test('all 18 Zite psychologist defaults preserve availability-rate invariants', () => {
    const entries = Object.entries(ZITE_PSYCHOLOGIST_BOOKING_DEFAULTS)
    expect(entries).toHaveLength(18)

    for (const [slug, cfg] of entries) {
      expect(slug.length).toBeGreaterThan(0)
      if (cfg.availableOnline) {
        expect(cfg.onlineRate).toBeGreaterThan(0)
      }
      if (cfg.availableTbi || cfg.availableBsd || cfg.availableMalang) {
        expect(cfg.offlineRate).toBeGreaterThan(0)
      }
    }
  })

  test('normalizes emails, WhatsApp numbers to E.164, and branch aliases', () => {
    expect(normalizeEmail('  Klien.Baru@Example.COM ')).toBe('klien.baru@example.com')
    expect(normalizeWhatsAppToE164('0812-3456-7890')).toBe('+6281234567890')
    expect(normalizeWhatsAppToE164('6281234567890')).toBe('+6281234567890')
    expect(normalizeWhatsAppToE164('+65 9123 4567')).toBe('+6591234567')

    expect(normalizeBookingBranch('tanjung-barat')).toBe('tbi')
    expect(normalizeBookingBranch('TBI')).toBe('tbi')
    expect(normalizeBookingBranch('bsd')).toBe('bsd')
    expect(normalizeBookingBranch('MLG')).toBe('malang')
    expect(normalizeBookingBranch('unknown')).toBeNull()
  })

  test('matches Zite 13 need categories, branch labels, sheet slugs, and 9 marketing sources', () => {
    expect(BOOKING_CONCERNS).toHaveLength(13)
    expect(BOOKING_CONCERNS[0]).toMatchObject({
      id: 'anxiety',
      title: { id: 'Kecemasan, stres, atau overthinking', en: 'Anxiety, stress, or overthinking' },
    })
    expect(normalizeBookingConcernId('career_burnout')).toBe('career')
    expect(normalizeBookingConcernId('emotionRegulation')).toBe('emotionRegulation')
    expect(mapBookingConcernToIntakeConcern('childDevelopment')).toBe('child_adolescent')

    expect(BOOKING_BRANCH_LABELS.id).toEqual({
      tbi: 'Attentive Pusat — Tanjung Barat',
      bsd: 'Attentive Cabang — BSD',
      malang: 'Attentive Cabang — Malang',
    })
    expect(BOOKING_SHEET_LOCATION_VALUES).toEqual({
      tbi: 'tanjung-barat',
      bsd: 'bsd',
      malang: 'malang',
    })
    expect(BOOKING_MARKETING_SOURCES).toHaveLength(9)
    expect(BOOKING_MARKETING_SOURCES).toContain('Facebook/Instagram Ads')
    expect(BOOKING_MARKETING_SOURCES).toContain('Teman / Kenalan')

    const ziteValid = validateBookingSubmission({
      language: 'en',
      clientStatus: 'new',
      name: 'Dian Lestari',
      whatsapp: '08123456789',
      email: 'dian@example.com',
      age: 29,
      gender: 'female',
      concernId: 'academic',
      consultationMode: 'offline',
      location: 'bsd',
      psychologistChoice: 'recommended',
      scheduleOption1: '20-11-2026 · 14.00 WIB',
    })
    expect(ziteValid.ok).toBe(true)
    if (ziteValid.ok) {
      expect(ziteValid.value.concernId).toBe('academic')
      expect(ziteValid.value.concernCategory).toBe('Permasalahan belajar, sekolah, kuliah, atau akademik')
    }
  })

  test('parses split ranges, appointments, OFF, and filters schedule by branch', () => {
    expect(parseDaySchedule('OFF')).toEqual({ type: 'off' })
    expect(parseDaySchedule('by Appointment')).toEqual({ type: 'appointment', branchNote: undefined })
    expect(parseDaySchedule('10.00 s/d 12.00 & 15.00 s/d 19.00')).toEqual({
      type: 'ranges',
      ranges: [
        { start: 10, end: 12 },
        { start: 15, end: 19 },
      ],
      branchNote: undefined,
    })

    const andriDefaults = ZITE_PSYCHOLOGIST_BOOKING_DEFAULTS.andri
    const andriWeek = buildWeekSchedule(
      andriDefaults.scheduleMon,
      andriDefaults.scheduleTue,
      andriDefaults.scheduleWed,
      andriDefaults.scheduleThu,
      andriDefaults.scheduleFri,
      andriDefaults.scheduleSat,
      andriDefaults.scheduleSun,
    )

    // Andri Tuesday is BSD only; Thursday is TBI only
    const tbiFiltered = filterScheduleByLocation(andriWeek, 'offline', 'tbi')
    expect(tbiFiltered[2]).toEqual({ type: 'off' }) // Tue BSD filtered out
    expect(tbiFiltered[4]).toMatchObject({ type: 'ranges', branchNote: 'TBI' }) // Thu TBI retained

    const fridaySlots = getAvailableHours([{ start: 10, end: 17.5 }])
    expect(fridaySlots[0]).toBe(10)
    expect(fridaySlots).toContain(17)
    expect(getAvailableMinutes([{ start: 10, end: 17.5 }], 17)).toEqual([0])
    expect(getAvailableMinutes([{ start: 10, end: 17.5 }], 16)).toEqual([0, 30])
  })

  test('applies 20:00 WIB cutoff for earliest selectable booking date', () => {
    // 19:59 WIB = 12:59 UTC on 2026-11-15 -> earliest is 2026-11-16
    const beforeCutoff = new Date('2026-11-15T12:59:00.000Z')
    expect(getEarliestBookingDateWib(beforeCutoff)).toBe('2026-11-16')

    // 20:00 WIB = 13:00 UTC on 2026-11-15 -> earliest is 2026-11-17
    const atCutoff = new Date('2026-11-15T13:00:00.000Z')
    expect(getEarliestBookingDateWib(atCutoff)).toBe('2026-11-17')
  })

  test('routes WhatsApp target to Malang branch or Pusat clinic number', () => {
    expect(resolveBookingWhatsAppRouting({
      mode: 'offline',
      location: 'malang',
      psychChoice: 'recommended',
    })).toEqual({ target: 'malang', whatsappNumber: BOOKING_WHATSAPP_NUMBERS.malang })

    expect(resolveBookingWhatsAppRouting({
      mode: 'online',
      location: null,
      psychChoice: 'self',
      availableMalang: true,
    })).toEqual({ target: 'malang', whatsappNumber: BOOKING_WHATSAPP_NUMBERS.malang })

    expect(resolveBookingWhatsAppRouting({
      mode: 'online',
      location: null,
      psychChoice: 'recommended',
      availableMalang: true,
    })).toEqual({ target: 'pusat', whatsappNumber: BOOKING_WHATSAPP_NUMBERS.pusat })
  })

  test('enforces strict booking status transition table', () => {
    expect(canTransitionBookingStatus('pending', 'confirmed')).toBe(true)
    expect(canTransitionBookingStatus('pending', 'cancelled')).toBe(true)
    expect(canTransitionBookingStatus('pending', 'completed')).toBe(false)
    expect(canTransitionBookingStatus('confirmed', 'in_session')).toBe(true)
    expect(canTransitionBookingStatus('in_session', 'completed')).toBe(true)
    expect(canTransitionBookingStatus('completed', 'cancelled')).toBe(false)
    expect(canTransitionBookingStatus('cancelled', 'confirmed')).toBe(false)
  })

  test('validates submission, detects crisis flag, and normalizes claim lookup fields', () => {
    const valid = validateBookingSubmission({
      language: 'id',
      clientStatus: 'new',
      name: '  Sinta Pratama ',
      whatsapp: '08123456789',
      email: ' Sinta@Example.com ',
      age: 26,
      gender: 'Perempuan',
      concernId: 'anxiety_mood',
      concernNote: 'Saya merasa cemas berat dan sempat ingin mengakhiri hidup',
      consultationMode: 'offline',
      location: 'tanjung-barat',
      psychologistChoice: 'self',
      psychologistSlug: 'syazka',
      scheduleOption1: '18-11-2026 · 14.00 WIB',
    })

    expect(valid.ok).toBe(true)
    if (valid.ok) {
      expect(valid.value.emailNormalized).toBe('sinta@example.com')
      expect(valid.value.whatsappE164).toBe('+628123456789')
      expect(valid.value.location).toBe('tbi')
      expect(valid.value.crisisFlagTriggered).toBe(true)
    }

    const invalid = validateBookingSubmission({
      clientStatus: 'new',
      name: 'A',
      whatsapp: '123',
      email: 'bad-email',
      consultationMode: 'offline',
      psychologistChoice: 'self',
      scheduleOption1: '',
    })

    expect(invalid.ok).toBe(false)
    if (!invalid.ok) {
      expect(invalid.errors.name).toBeDefined()
      expect(invalid.errors.whatsapp).toBeDefined()
      expect(invalid.errors.email).toBeDefined()
      expect(invalid.errors.location).toBeDefined()
      expect(invalid.errors.psychologist).toBeDefined()
      expect(invalid.errors.scheduleOption1).toBeDefined()
    }
  })

  test('exports operational CSV with formula neutralization and omits raw clinical note', () => {
    const record: BookingAdminRecord = {
      id: 'b-1',
      bookingCode: 'ATT-2611-ABCD',
      clientUserId: null,
      status: 'pending',
      language: 'id',
      clientStatus: 'new',
      name: '=cmd|calc',
      whatsapp: '08123456789',
      whatsappE164: '+628123456789',
      email: 'client@example.com',
      countryRegion: 'Indonesia / Jakarta',
      age: 27,
      gender: 'Perempuan',
      serviceType: 'Personal',
      concernId: 'anxiety_mood',
      concernCategory: 'Kecemasan, Overthinking & Mood',
      clientCategory: 'individual',
      genderPreference: 'female',
      hasClinicalNote: true,
      crisisFlagTriggered: true,
      consultationMode: 'online',
      location: null,
      psychologistChoice: 'recommended',
      psychologistId: null,
      psychologistSlug: null,
      selectedPsychologistName: null,
      scheduleOption1: '18-11-2026 · 10.00 WIB',
      scheduleOption2: null,
      scheduleOption3: null,
      confirmedStartAt: null,
      confirmedEndAt: null,
      baseRate: 750_000,
      assessmentFee: BOOKING_ASSESSMENT_FEE,
      totalRate: 900_000,
      marketingSource: 'Instagram',
      referrer: null,
      utmSource: 'meta',
      utmMedium: 'paid',
      utmCampaign: 'nov_campaign',
      utmContent: null,
      utmTerm: null,
      campaignId: 'cmp_1',
      adsetId: 'ads_1',
      adId: 'ad_1',
      webhookStatus: 'delivered',
      webhookAttempts: 1,
      webhookLastError: null,
      submittedAt: '2026-11-15T10:00:00.000Z',
      updatedAt: '2026-11-15T10:00:00.000Z',
    }

    const csv = bookingsToCsv([record])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain("\"'=cmd|calc\"")
    expect(csv).toContain("\"\'+628123456789\"") // + prefixed phone neutralized with '
    expect(csv).toContain('"CRISIS_FLAG"')

    const waText = buildBookingWhatsAppMessage({
      lang: 'id',
      name: 'Sinta',
      whatsapp: '08123456789',
      email: 'sinta@example.com',
      clientStatus: 'new',
      consultationMode: 'online',
      psychChoiceLabel: 'Rekomendasi Attentive',
      scheduleOption1: '18-11-2026 · 10.00 WIB',
      baseRate: 750_000,
      assessmentFee: BOOKING_ASSESSMENT_FEE,
      totalRate: 900_000,
      bookingCode: 'ATT-2611-ABCD',
    })
    expect(waText).toContain('ATT-2611-ABCD')
    expect(waText).toContain('900.000')
  })

  test('validateFullPsychologistMutation enforces mode-rate consistency when booking flags enabled', () => {
    const basePayload = {
      slug: 'syazka',
      status: 'active',
      name: 'Syazka',
      nickname: 'Syazka',
      credential: 'M.Psi., Psikolog',
      licenseNumber: 'SIPP-1',
      experienceYears: 5,
      bookingUrl: 'https://attentiveid.com/booking?psychologist=syazka',
      featured: false,
      featuredOrder: null,
      supportAreas: [{ supportArea: 'adultClinical', primary: true }],
      specializations: [{ label: { id: 'Kecemasan', en: 'Anxiety' } }],
      biography: { id: 'Bio', en: 'Bio' },
      availabilityMessage: { id: 'Tersedia', en: 'Available' },
    }

    expect(validateFullPsychologistMutation({
      ...basePayload,
      availableOnline: true,
      onlineRate: null,
    })).toBe(false)

    expect(validateFullPsychologistMutation({
      ...basePayload,
      availableTbi: true,
      offlineRate: null,
    })).toBe(false)

    expect(validateFullPsychologistMutation({
      ...basePayload,
      availableOnline: true,
      onlineRate: 750_000,
      availableTbi: true,
      offlineRate: 800_000,
    })).toBe(true)
  })
})
