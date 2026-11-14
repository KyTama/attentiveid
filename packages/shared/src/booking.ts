import type { PracticeBranch } from './content'
import {
  detectCrisisKeywords,
  EMERGENCY_CRISIS_HOTLINES,
  INTAKE_CLIENT_CATEGORIES,
  INTAKE_CONCERN_IDS,
  INTAKE_CONCERNS,
  INTAKE_GENDER_PREFERENCES,
  matchPsychologists,
  type IntakeClientCategory,
  type IntakeConcernId,
  type IntakeGenderPreference,
} from './intake'

export {
  detectCrisisKeywords,
  EMERGENCY_CRISIS_HOTLINES,
  INTAKE_CLIENT_CATEGORIES,
  INTAKE_CONCERN_IDS,
  INTAKE_CONCERNS,
  INTAKE_GENDER_PREFERENCES,
  matchPsychologists,
  type IntakeClientCategory,
  type IntakeConcernId,
  type IntakeGenderPreference,
}

export const BOOKING_ASSESSMENT_FEE = 150_000
export const BOOKING_SESSION_BUFFER_MINUTES = 15

export const BOOKING_PHYSICAL_BRANCHES = ['tbi', 'bsd', 'malang'] as const satisfies readonly PracticeBranch[]
export type BookingPhysicalBranch = typeof BOOKING_PHYSICAL_BRANCHES[number]

export const BOOKING_CONSULTATION_MODES = ['online', 'offline'] as const
export type BookingConsultationMode = typeof BOOKING_CONSULTATION_MODES[number]

export const BOOKING_CLIENT_STATUSES = ['new', 'returning'] as const
export type BookingClientStatus = typeof BOOKING_CLIENT_STATUSES[number]

export const BOOKING_PSYCHOLOGIST_CHOICES = ['recommended', 'previous', 'self'] as const
export type BookingPsychologistChoice = typeof BOOKING_PSYCHOLOGIST_CHOICES[number]

export const BOOKING_STATUSES = ['pending', 'confirmed', 'in_session', 'completed', 'cancelled'] as const
export type BookingStatus = typeof BOOKING_STATUSES[number]

export const WEBHOOK_DELIVERY_STATUSES = ['pending', 'processing', 'delivered', 'failed', 'dead_letter'] as const
export type WebhookDeliveryStatus = typeof WEBHOOK_DELIVERY_STATUSES[number]

export const BOOKING_WHATSAPP_NUMBERS = {
  malang: '628212298880',
  pusat: '6285156410912',
} as const

export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_session', 'cancelled'],
  in_session: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function canTransitionBookingStatus(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to)
}

export const BOOKING_BRANCH_LABELS: Record<'id' | 'en', Record<BookingPhysicalBranch, string>> = {
  id: {
    tbi: 'Tanjung Barat (Jakarta Selatan)',
    bsd: 'BSD (Delrey BizTown)',
    malang: 'Malang (Singosari)',
  },
  en: {
    tbi: 'Tanjung Barat (South Jakarta)',
    bsd: 'BSD (Delrey BizTown)',
    malang: 'Malang (Singosari)',
  },
}

export const BOOKING_MARKETING_SOURCES = [
  'Instagram (@attentive.id)',
  'Google Search',
  'TikTok',
  'Rekomendasi Teman / Keluarga',
  'Iklan Meta / Instagram Ads',
  'LinkedIn / Artikel',
  'Klien Sebelumnya',
  'Lainnya',
] as const

export interface PsychologistScheduleDefaults {
  consultationDuration: string
  onlineRate: number
  offlineRate: number
  availableOnline: boolean
  availableTbi: boolean
  availableBsd: boolean
  availableMalang: boolean
  scheduleMon: string
  scheduleTue: string
  scheduleWed: string
  scheduleThu: string
  scheduleFri: string
  scheduleSat: string
  scheduleSun: string
}

/**
 * Snapshot pricing & schedule defaults migrated from booking.attentiveid.com
 * (18 active Zite booking practitioners). Used by initial Drizzle data backfill
 * and parity tests; runtime reads always come from PostgreSQL psychologist_profiles.
 */
export const ZITE_PSYCHOLOGIST_BOOKING_DEFAULTS: Record<string, PsychologistScheduleDefaults> = {
  syazka: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: '10.00 s/d 19.00',
    scheduleWed: '10.00 s/d 19.00',
    scheduleThu: '10.00 s/d 19.00',
    scheduleFri: '10.00 s/d 19.00',
    scheduleSat: '10.00 s/d 14.00',
    scheduleSun: 'OFF',
  },
  gita: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: 'OFF',
    scheduleWed: '10.00 s/d 18.00',
    scheduleThu: '10.00 s/d 18.00',
    scheduleFri: 'OFF',
    scheduleSat: 'OFF',
    scheduleSun: 'OFF',
  },
  mayda: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: '10.00 s/d 18.00',
    scheduleTue: '10.00 s/d 18.00',
    scheduleWed: '10.00 s/d 18.00',
    scheduleThu: '10.00 s/d 18.00',
    scheduleFri: '10.00 s/d 18.00',
    scheduleSat: '10.00 s/d 18.00',
    scheduleSun: 'OFF',
  },
  ilham: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: '19.00 s/d 21.00',
    scheduleWed: '19.00 s/d 21.00',
    scheduleThu: '19.00 s/d 21.00',
    scheduleFri: 'OFF',
    scheduleSat: '10.00 s/d 14.00',
    scheduleSun: 'OFF',
  },
  dinda: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: 'OFF',
    scheduleWed: 'OFF',
    scheduleThu: 'OFF',
    scheduleFri: 'OFF',
    scheduleSat: '11.00 s/d 14.00',
    scheduleSun: 'by Appointment',
  },
  dewinta: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: 'by Appointment',
    scheduleTue: 'by Appointment',
    scheduleWed: 'by Appointment',
    scheduleThu: 'by Appointment',
    scheduleFri: 'by Appointment',
    scheduleSat: 'OFF',
    scheduleSun: 'OFF',
  },
  andri: {
    consultationDuration: '60 menit',
    onlineRate: 500_000,
    offlineRate: 550_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: '16.00 s/d 19.00 (BSD)',
    scheduleWed: '11.00 s/d 17.00 (BSD)',
    scheduleThu: '11.00 s/d 17.00 (TBI)',
    scheduleFri: '10.00 s/d 17.30 (TBI)',
    scheduleSat: '11.00 s/d 14.00 (TBI)',
    scheduleSun: 'OFF',
  },
  audria: {
    consultationDuration: '60 menit',
    onlineRate: 500_000,
    offlineRate: 550_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: '19.30 s/d 20.00',
    scheduleTue: '19.30 s/d 20.00',
    scheduleWed: '19.30 s/d 20.00',
    scheduleThu: '19.30 s/d 20.00',
    scheduleFri: '19.30 s/d 20.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'OFF',
  },
  angelina: {
    consultationDuration: '60 menit',
    onlineRate: 500_000,
    offlineRate: 550_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: '10.00 s/d 19.00',
    scheduleTue: '10.00 s/d 19.00',
    scheduleWed: '10.00 s/d 19.00',
    scheduleThu: '10.00 s/d 19.00',
    scheduleFri: '10.00 s/d 19.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'by Appointment',
  },
  farahdilla: {
    consultationDuration: '60 menit',
    onlineRate: 500_000,
    offlineRate: 550_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: '10.00 s/d 19.00',
    scheduleTue: '10.00 s/d 19.00',
    scheduleWed: '10.00 s/d 19.00',
    scheduleThu: '10.00 s/d 19.00',
    scheduleFri: '10.00 s/d 19.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'OFF',
  },
  gisella: {
    consultationDuration: '60 menit',
    onlineRate: 950_000,
    offlineRate: 1_000_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: '09.00 s/d 12.00',
    scheduleWed: 'OFF',
    scheduleThu: 'OFF',
    scheduleFri: '11.00 s/d 19.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'OFF',
  },
  nichi: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: false,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: 'OFF',
    scheduleWed: 'OFF',
    scheduleThu: 'OFF',
    scheduleFri: 'OFF',
    scheduleSat: '10.00 s/d 17.00',
    scheduleSun: 'by Appointment',
  },
  jessica: {
    consultationDuration: '60 menit',
    onlineRate: 500_000,
    offlineRate: 550_000,
    availableOnline: true,
    availableTbi: false,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: 'OFF',
    scheduleTue: 'OFF',
    scheduleWed: 'OFF',
    scheduleThu: '09.00 s/d 20.00',
    scheduleFri: '09.00 s/d 20.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'OFF',
  },
  farhan: {
    consultationDuration: '60 menit',
    onlineRate: 500_000,
    offlineRate: 550_000,
    availableOnline: true,
    availableTbi: false,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: '17.00 s/d 19.00',
    scheduleTue: '17.00 s/d 19.00',
    scheduleWed: '17.00 s/d 19.00',
    scheduleThu: '17.00 s/d 19.00',
    scheduleFri: '17.00 s/d 19.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'by Appointment',
  },
  grace: {
    consultationDuration: '60 menit',
    onlineRate: 400_000,
    offlineRate: 450_000,
    availableOnline: true,
    availableTbi: false,
    availableBsd: false,
    availableMalang: true,
    scheduleMon: '12.00 s/d 19.00',
    scheduleTue: '12.00 s/d 19.00',
    scheduleWed: '12.00 s/d 19.00',
    scheduleThu: '12.00 s/d 19.00',
    scheduleFri: '12.00 s/d 19.00',
    scheduleSat: 'by Appointment',
    scheduleSun: 'by Appointment',
  },
  nuzul: {
    consultationDuration: '60 menit',
    onlineRate: 400_000,
    offlineRate: 450_000,
    availableOnline: true,
    availableTbi: false,
    availableBsd: false,
    availableMalang: true,
    scheduleMon: '10.00 s/d 12.00 & 15.00 s/d 19.00',
    scheduleTue: '10.00 s/d 12.00 & 15.00 s/d 19.00',
    scheduleWed: 'OFF',
    scheduleThu: '10.00 s/d 12.00 & 15.00 s/d 19.00',
    scheduleFri: 'OFF',
    scheduleSat: '10.00 s/d 19.00',
    scheduleSun: 'OFF',
  },
  dominika: {
    consultationDuration: '60 menit',
    onlineRate: 750_000,
    offlineRate: 800_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: '10.00 s/d 19.00',
    scheduleTue: '10.00 s/d 19.00',
    scheduleWed: '10.00 s/d 19.00',
    scheduleThu: '10.00 s/d 19.00',
    scheduleFri: '10.00 s/d 19.00',
    scheduleSat: '10.00 s/d 16.00',
    scheduleSun: 'OFF',
  },
  ratri: {
    consultationDuration: '60 menit',
    onlineRate: 550_000,
    offlineRate: 600_000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: '',
    scheduleTue: '',
    scheduleWed: '',
    scheduleThu: '',
    scheduleFri: '',
    scheduleSat: '',
    scheduleSun: '',
  },
}

// ============================================================================
// Normalization helpers (used by both submission & future client claim matching)
// ============================================================================

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeWhatsAppToE164(phone: string, defaultCountryCode = '62'): string {
  const trimmed = phone.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D+/g, '')
  if (!digits) return ''

  if (hasPlus) {
    return `+${digits}`
  }
  if (digits.startsWith('00') && digits.length > 4) {
    return `+${digits.slice(2)}`
  }
  if (digits.startsWith('0')) {
    return `+${defaultCountryCode}${digits.slice(1)}`
  }
  if (digits.startsWith(defaultCountryCode)) {
    return `+${digits}`
  }
  return `+${digits}`
}

export function normalizeBookingBranch(raw: string | null | undefined): BookingPhysicalBranch | null {
  if (!raw) return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'tbi' || normalized === 'tanjung-barat' || normalized === 'tanjung_barat') {
    return 'tbi'
  }
  if (normalized === 'bsd') return 'bsd'
  if (normalized === 'malang' || normalized === 'mlg') return 'malang'
  return null
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)
}

export function isValidPhoneDigits(phone: string): boolean {
  const digits = phone.replace(/\D+/g, '')
  return digits.length >= 9 && digits.length <= 15
}

// ============================================================================
// Schedule parser (ported cleanly from Attentive-Booking)
// ============================================================================

export interface TimeRange {
  start: number // decimal hours, e.g. 10.5 = 10:30
  end: number
}

export type DaySchedule =
  | { type: 'ranges'; ranges: TimeRange[]; branchNote?: string }
  | { type: 'appointment'; branchNote?: string }
  | { type: 'off' }
  | null

// Order: [Sun, Mon, Tue, Wed, Thu, Fri, Sat] matching JS Date.getDay()
export type WeekSchedule = [
  DaySchedule,
  DaySchedule,
  DaySchedule,
  DaySchedule,
  DaySchedule,
  DaySchedule,
  DaySchedule,
]

const DEFAULT_DAY: DaySchedule = { type: 'ranges', ranges: [{ start: 9, end: 20 }] }
const DEFAULT_SAT: DaySchedule = { type: 'ranges', ranges: [{ start: 9, end: 16 }] }
const DEFAULT_SUN: DaySchedule = { type: 'ranges', ranges: [{ start: 9, end: 13 }] }

export const DEFAULT_SCHEDULE: WeekSchedule = [
  DEFAULT_SUN,
  DEFAULT_DAY,
  DEFAULT_DAY,
  DEFAULT_DAY,
  DEFAULT_DAY,
  DEFAULT_DAY,
  DEFAULT_SAT,
]

function parseDecimalTime(rawTime: string): number {
  const cleaned = rawTime.trim().replace(',', '.').replace(':', '.')
  const parts = cleaned.split('.')
  const h = Number.parseInt(parts[0] ?? '0', 10)
  const m = parts.length > 1 ? Number.parseInt(parts[1] ?? '0', 10) : 0
  return h + (m >= 30 ? 0.5 : 0)
}

function extractBranchNote(raw: string): { cleaned: string; branchNote?: string } {
  const match = raw.match(/\(([^)]+)\)/)
  const branchNote = match ? match[1]?.trim() : undefined
  const cleaned = raw.replace(/\([^)]*\)/g, '').trim()
  return { cleaned, branchNote }
}

export function parseDaySchedule(raw: string | null | undefined): DaySchedule {
  if (!raw || !raw.trim()) return null

  const trimmed = raw.trim()
  const upper = trimmed.toUpperCase()

  if (upper === 'OFF' || upper.includes('ON LEAVE') || upper === 'LIBUR') {
    return { type: 'off' }
  }

  if (upper.includes('BY APPOINTMENT') || upper.includes('APPOINTMENT') || upper.includes('BY APPT')) {
    const { branchNote } = extractBranchNote(trimmed)
    return { type: 'appointment', branchNote }
  }

  const { cleaned, branchNote } = extractBranchNote(trimmed)
  const segments = cleaned.split('&').map((s) => s.trim()).filter(Boolean)
  const ranges: TimeRange[] = []

  for (const segment of segments) {
    const rangeMatch = segment.match(/(\d{1,2}[.:,]\d{2})\s*(?:s\/d|s\.d\.|sd|[-–—]|to|sampai)\s*(\d{1,2}[.:,]\d{2})/i)
    if (rangeMatch) {
      ranges.push({
        start: parseDecimalTime(rangeMatch[1]),
        end: parseDecimalTime(rangeMatch[2]),
      })
    }
  }

  if (ranges.length > 0) {
    return { type: 'ranges', ranges, branchNote }
  }

  return null
}

export function buildWeekSchedule(
  mon: string | null | undefined,
  tue: string | null | undefined,
  wed: string | null | undefined,
  thu: string | null | undefined,
  fri: string | null | undefined,
  sat: string | null | undefined,
  sun: string | null | undefined,
): WeekSchedule {
  return [
    parseDaySchedule(sun),
    parseDaySchedule(mon),
    parseDaySchedule(tue),
    parseDaySchedule(wed),
    parseDaySchedule(thu),
    parseDaySchedule(fri),
    parseDaySchedule(sat),
  ]
}

export function hasScheduleData(schedule: WeekSchedule): boolean {
  return schedule.some((entry) => entry !== null)
}

export function isDayOff(schedule: WeekSchedule, dayOfWeek: number): boolean {
  const entry = schedule[dayOfWeek]
  if (entry === null) return false
  return entry.type === 'off'
}

export function isDayAppointment(schedule: WeekSchedule, dayOfWeek: number): boolean {
  const entry = schedule[dayOfWeek]
  if (entry === null) return false
  return entry.type === 'appointment'
}

export function getDayTimeRanges(schedule: WeekSchedule, dayOfWeek: number): TimeRange[] | null {
  const entry = schedule[dayOfWeek]

  if (entry === null) {
    const def = DEFAULT_SCHEDULE[dayOfWeek]
    if (!def || def.type === 'off') return null
    if (def.type === 'appointment') return [{ start: 8, end: 20 }]
    return def.ranges
  }

  if (entry.type === 'off') return null
  if (entry.type === 'appointment') return [{ start: 8, end: 20 }]
  return entry.ranges
}

export function getDayBranchNote(schedule: WeekSchedule, dayOfWeek: number): string | undefined {
  const entry = schedule[dayOfWeek]
  if (!entry || entry.type === 'off') return undefined
  return entry.branchNote
}

const LOCATION_TAG_MAP: Record<BookingPhysicalBranch, readonly string[]> = {
  bsd: ['BSD'],
  tbi: ['TBI', 'TANJUNG'],
  malang: ['MLG', 'MALANG'],
}

export function filterScheduleByLocation(
  schedule: WeekSchedule,
  mode: BookingConsultationMode | '',
  location: string,
): WeekSchedule {
  if (mode === 'online' || !location) return schedule

  const normalized = normalizeBookingBranch(location)
  if (!normalized) return schedule

  const allowedTags = LOCATION_TAG_MAP[normalized]
  return schedule.map((entry) => {
    if (!entry || entry.type === 'off') return entry
    if (!entry.branchNote) return entry
    const tag = entry.branchNote.toUpperCase()
    if (allowedTags.some((t) => tag.includes(t))) return entry
    return { type: 'off' as const }
  }) as WeekSchedule
}

export function getAvailableHours(ranges: TimeRange[]): number[] {
  const hours = new Set<number>()
  for (const r of ranges) {
    const firstH = r.start % 1 === 0 ? r.start : Math.floor(r.start)
    const endH = Math.floor(r.end)
    for (let h = firstH; h <= endH; h++) {
      if (h >= r.start - 0.5 && h <= r.end) {
        hours.add(h)
      }
    }
  }
  return Array.from(hours).sort((a, b) => a - b)
}

export function getAvailableMinutes(ranges: TimeRange[], hour: number): number[] {
  const mins: number[] = []
  for (const r of ranges) {
    if (hour >= r.start && hour < r.end && !mins.includes(0)) {
      mins.push(0)
    }
    if (hour + 0.5 >= r.start && hour + 0.5 < r.end && !mins.includes(30)) {
      mins.push(30)
    }
  }
  return mins.sort((a, b) => a - b)
}

/**
 * 20:00 WIB booking cutoff rule:
 * - Before 20:00 WIB -> earliest selectable date is tomorrow (offset +1 day).
 * - At/after 20:00 WIB -> earliest selectable date is day after tomorrow (offset +2 days).
 * Returned format is YYYY-MM-DD in WIB (UTC+7).
 */
export function getEarliestBookingDateWib(now: Date = new Date()): string {
  const wibEpochMs = now.getTime() + 7 * 3_600_000
  const wibNow = new Date(wibEpochMs)
  const wibHour = wibNow.getUTCHours()
  const daysAhead = wibHour >= 20 ? 2 : 1
  const earliest = new Date(wibEpochMs + daysAhead * 86_400_000)
  const y = earliest.getUTCFullYear()
  const m = String(earliest.getUTCMonth() + 1).padStart(2, '0')
  const d = String(earliest.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ============================================================================
// WhatsApp routing & confirmation summary
// ============================================================================

export function resolveBookingWhatsAppRouting(input: {
  mode: BookingConsultationMode | ''
  location?: string | null
  psychChoice: BookingPsychologistChoice | string
  availableMalang?: boolean
  primaryBranch?: PracticeBranch | null
}): { target: 'malang' | 'pusat'; whatsappNumber: string } {
  const normalizedBranch = normalizeBookingBranch(input.location)

  if (input.mode === 'offline' && normalizedBranch === 'malang') {
    return { target: 'malang', whatsappNumber: BOOKING_WHATSAPP_NUMBERS.malang }
  }

  if (
    input.mode === 'online'
    && (input.psychChoice === 'self' || input.psychChoice === 'previous')
    && (input.availableMalang || input.primaryBranch === 'malang')
  ) {
    return { target: 'malang', whatsappNumber: BOOKING_WHATSAPP_NUMBERS.malang }
  }

  return { target: 'pusat', whatsappNumber: BOOKING_WHATSAPP_NUMBERS.pusat }
}

export interface BookingWhatsAppMessageInput {
  lang: 'id' | 'en'
  name: string
  whatsapp: string
  email: string
  clientStatus: BookingClientStatus
  concernLabel?: string | null
  consultationMode: BookingConsultationMode
  location?: BookingPhysicalBranch | null
  psychChoiceLabel: string
  selectedPsychologist?: string | null
  scheduleOption1: string
  scheduleOption2?: string | null
  scheduleOption3?: string | null
  baseRate?: number
  assessmentFee?: number
  totalRate?: number
  bookingCode?: string
}

export function buildBookingWhatsAppMessage(input: BookingWhatsAppMessageInput): string {
  const branchText = input.location ? BOOKING_BRANCH_LABELS[input.lang][input.location] : null
  const modeDisplay = input.consultationMode === 'online'
    ? 'Online'
    : `Offline${branchText ? ` — ${branchText}` : ''}`

  const lines = [
    input.lang === 'id'
      ? 'Halo Admin Attentive! Saya baru saja mengisi form booking konsultasi di website.'
      : 'Hello Attentive Admin! I just submitted a consultation booking on the website.',
    '',
    ...(input.bookingCode ? [`Kode Booking: ${input.bookingCode}`] : []),
    `${input.lang === 'id' ? 'Nama' : 'Name'}: ${input.name.trim()}`,
    `WhatsApp: ${input.whatsapp.trim()}`,
    `Email: ${input.email.trim()}`,
    `${input.lang === 'id' ? 'Status Klien' : 'Client Status'}: ${
      input.clientStatus === 'new'
        ? (input.lang === 'id' ? 'Klien Baru' : 'New Client')
        : (input.lang === 'id' ? 'Klien Lama' : 'Returning Client')
    }`,
    ...(input.concernLabel ? [`${input.lang === 'id' ? 'Kebutuhan' : 'Concern'}: ${input.concernLabel}`] : []),
    `${input.lang === 'id' ? 'Mode' : 'Mode'}: ${modeDisplay}`,
    `${input.lang === 'id' ? 'Pilihan Psikolog' : 'Psychologist Choice'}: ${input.psychChoiceLabel}`,
    ...(input.selectedPsychologist ? [`${input.lang === 'id' ? 'Psikolog' : 'Psychologist'}: ${input.selectedPsychologist}`] : []),
    `${input.lang === 'id' ? 'Jadwal 1' : 'Schedule 1'}: ${input.scheduleOption1}`,
    ...(input.scheduleOption2 ? [`${input.lang === 'id' ? 'Jadwal 2' : 'Schedule 2'}: ${input.scheduleOption2}`] : []),
    ...(input.scheduleOption3 ? [`${input.lang === 'id' ? 'Jadwal 3' : 'Schedule 3'}: ${input.scheduleOption3}`] : []),
    ...(input.baseRate
      ? [
          '',
          ...(input.assessmentFee
            ? [
                `${input.lang === 'id' ? 'Tarif Psikolog' : 'Psychologist Rate'}: Rp ${input.baseRate.toLocaleString('id-ID')}`,
                `${input.lang === 'id' ? 'Biaya Asesmen Awal' : 'Initial Assessment Fee'}: Rp ${input.assessmentFee.toLocaleString('id-ID')}`,
              ]
            : []),
          `${input.lang === 'id' ? 'Estimasi Total' : 'Estimated Total'}: Rp ${(input.totalRate ?? input.baseRate).toLocaleString('id-ID')}`,
        ]
      : []),
    '',
    input.lang === 'id' ? 'Mohon konfirmasinya ya, terima kasih!' : 'Please help confirm my schedule, thank you!',
  ]

  return lines.join('\n')
}

// ============================================================================
// Booking Catalog & Submission Contracts
// ============================================================================

export interface BookingPsychologistCatalogItem {
  id: string
  slug: string
  name: string
  nickname: string
  credential: string
  tier: string
  primaryBranch: PracticeBranch
  acceptingNewClients: boolean
  featured: boolean
  featuredOrder: number | null
  experienceYears: number
  supportArea: 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist'
  specializations: {
    id: string[]
    en: string[]
  }
  shortBio?: {
    id: string
    en: string
  }
  media?: {
    url: string
    width: number
    height: number
    alt: {
      id: string
      en: string
    }
  }
  consultationDuration: string
  onlineRate: number | null
  offlineRate: number | null
  availableOnline: boolean
  availableTbi: boolean
  availableBsd: boolean
  availableMalang: boolean
  scheduleMon: string | null
  scheduleTue: string | null
  scheduleWed: string | null
  scheduleThu: string | null
  scheduleFri: string | null
  scheduleSat: string | null
  scheduleSun: string | null
}

export interface BookingSubmissionInput {
  language?: 'id' | 'en'
  clientStatus: BookingClientStatus
  name: string
  whatsapp: string
  email: string
  countryRegion?: string
  age?: number | null
  gender?: string
  serviceType?: string
  concernId?: IntakeConcernId
  concernCategory?: string
  clientCategory?: IntakeClientCategory
  genderPreference?: IntakeGenderPreference
  concernNote?: string
  consultationMode: BookingConsultationMode
  location?: string | null
  psychologistChoice: BookingPsychologistChoice
  psychologistSlug?: string | null
  psychologistId?: string | null
  selectedPsychologistName?: string | null
  scheduleOption1: string
  scheduleOption2?: string
  scheduleOption3?: string
  marketingSource?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  campaignId?: string
  adsetId?: string
  adId?: string
  website?: string // honeypot
}

export interface NormalizedBookingSubmission {
  language: 'id' | 'en'
  clientStatus: BookingClientStatus
  name: string
  whatsapp: string
  whatsappE164: string
  email: string
  emailNormalized: string
  countryRegion: string | null
  age: number | null
  gender: string | null
  serviceType: string
  concernId: IntakeConcernId | null
  concernCategory: string | null
  clientCategory: IntakeClientCategory | null
  genderPreference: IntakeGenderPreference | null
  concernNote: string | null
  crisisFlagTriggered: boolean
  consultationMode: BookingConsultationMode
  location: BookingPhysicalBranch | null
  psychologistChoice: BookingPsychologistChoice
  psychologistSlug: string | null
  psychologistId: string | null
  selectedPsychologistName: string | null
  scheduleOption1: string
  scheduleOption2: string | null
  scheduleOption3: string | null
  marketingSource: string | null
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  campaignId: string | null
  adsetId: string | null
  adId: string | null
}

export interface BookingValidationFailure {
  ok: false
  errors: Partial<Record<string, string>> & { form?: string }
}

export interface BookingValidationSuccess {
  ok: true
  value: NormalizedBookingSubmission
}

const trimOrNull = (val: unknown, maxLen = 500): string | null => {
  if (typeof val !== 'string') return null
  const trimmed = val.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLen)
}

export function validateBookingSubmission(
  raw: unknown,
): BookingValidationSuccess | BookingValidationFailure {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: { form: 'Invalid booking payload.' } }
  }

  const input = raw as Record<string, unknown>
  const errors: Partial<Record<string, string>> = {}

  const language: 'id' | 'en' = input.language === 'en' ? 'en' : 'id'
  const clientStatus = input.clientStatus === 'new' || input.clientStatus === 'returning'
    ? input.clientStatus
    : null
  if (!clientStatus) {
    errors.clientStatus = 'Status klien wajib dipilih (new/returning).'
  }

  const name = trimOrNull(input.name, 160)
  if (!name || name.length < 2) {
    errors.name = 'Nama lengkap wajib diisi (minimal 2 karakter).'
  }

  const whatsapp = trimOrNull(input.whatsapp, 40)
  if (!whatsapp || !isValidPhoneDigits(whatsapp)) {
    errors.whatsapp = 'Nomor WhatsApp harus valid (9–15 digit).'
  }
  const whatsappE164 = whatsapp ? normalizeWhatsAppToE164(whatsapp) : ''
  if (!whatsappE164) {
    errors.whatsapp = 'Nomor WhatsApp tidak valid.'
  }

  const email = trimOrNull(input.email, 254)
  if (!email || !isValidEmail(email)) {
    errors.email = 'Format email tidak valid.'
  }
  const emailNormalized = email ? normalizeEmail(email) : ''

  let age: number | null = null
  if (input.age !== undefined && input.age !== null && input.age !== '') {
    const parsedAge = typeof input.age === 'number' ? input.age : Number(input.age)
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 100) {
      errors.age = 'Usia harus bilangan bulat antara 1 dan 100.'
    } else {
      age = parsedAge
    }
  } else if (clientStatus === 'new') {
    errors.age = 'Usia wajib diisi untuk klien baru.'
  }

  const gender = trimOrNull(input.gender, 40)
  if (clientStatus === 'new' && !gender) {
    errors.gender = 'Jenis kelamin wajib diisi untuk klien baru.'
  }

  const concernId = typeof input.concernId === 'string' && (INTAKE_CONCERN_IDS as readonly string[]).includes(input.concernId)
    ? (input.concernId as IntakeConcernId)
    : null
  const rawConcernCategory = trimOrNull(input.concernCategory, 160)
  const resolvedConcernCategory = rawConcernCategory
    ?? (concernId ? INTAKE_CONCERNS.find((c) => c.id === concernId)?.title[language] ?? null : null)

  if (clientStatus === 'new' && !concernId && !resolvedConcernCategory) {
    errors.concern = 'Kategori kebutuhan wajib dipilih untuk klien baru.'
  }

  const clientCategory = typeof input.clientCategory === 'string' && (INTAKE_CLIENT_CATEGORIES as readonly string[]).includes(input.clientCategory)
    ? (input.clientCategory as IntakeClientCategory)
    : null
  const genderPreference = typeof input.genderPreference === 'string' && (INTAKE_GENDER_PREFERENCES as readonly string[]).includes(input.genderPreference)
    ? (input.genderPreference as IntakeGenderPreference)
    : null

  const consultationMode = input.consultationMode === 'online' || input.consultationMode === 'offline'
    ? input.consultationMode
    : null
  if (!consultationMode) {
    errors.consultationMode = 'Mode konsultasi wajib dipilih (online/offline).'
  }

  const normalizedBranch = normalizeBookingBranch(typeof input.location === 'string' ? input.location : null)
  if (consultationMode === 'offline' && !normalizedBranch) {
    errors.location = 'Cabang offline wajib dipilih (tbi, bsd, atau malang).'
  }

  const psychologistChoice = typeof input.psychologistChoice === 'string'
    && (BOOKING_PSYCHOLOGIST_CHOICES as readonly string[]).includes(input.psychologistChoice)
    ? (input.psychologistChoice as BookingPsychologistChoice)
    : null
  if (!psychologistChoice) {
    errors.psychologistChoice = 'Preferensi pemilihan psikolog wajib dipilih.'
  }

  const psychologistSlug = trimOrNull(input.psychologistSlug, 160)
  const psychologistId = trimOrNull(input.psychologistId, 128)
  if ((psychologistChoice === 'self' || psychologistChoice === 'previous') && !psychologistSlug && !psychologistId) {
    errors.psychologist = 'Psikolog wajib dipilih untuk opsi ini.'
  }

  const scheduleOption1 = trimOrNull(input.scheduleOption1, 160)
  if (!scheduleOption1) {
    errors.scheduleOption1 = 'Minimal satu pilihan jadwal wajib diisi.'
  }

  if (Object.keys(errors).length > 0 || !clientStatus || !name || !whatsapp || !email || !consultationMode || !psychologistChoice || !scheduleOption1) {
    return { ok: false, errors }
  }

  const concernNote = trimOrNull(input.concernNote, 5_000)
  const crisisCheck = concernNote ? detectCrisisKeywords(concernNote) : { isCrisisDetected: false, matchedKeywords: [] }

  return {
    ok: true,
    value: {
      language,
      clientStatus,
      name,
      whatsapp,
      whatsappE164,
      email,
      emailNormalized,
      countryRegion: trimOrNull(input.countryRegion, 200),
      age,
      gender,
      serviceType: trimOrNull(input.serviceType, 80) ?? 'Personal',
      concernId,
      concernCategory: resolvedConcernCategory,
      clientCategory,
      genderPreference,
      concernNote,
      crisisFlagTriggered: crisisCheck.isCrisisDetected,
      consultationMode,
      location: consultationMode === 'offline' ? normalizedBranch : null,
      psychologistChoice,
      psychologistSlug,
      psychologistId,
      selectedPsychologistName: trimOrNull(input.selectedPsychologistName, 200),
      scheduleOption1,
      scheduleOption2: trimOrNull(input.scheduleOption2, 160),
      scheduleOption3: trimOrNull(input.scheduleOption3, 160),
      marketingSource: trimOrNull(input.marketingSource, 200),
      referrer: trimOrNull(input.referrer, 200),
      utmSource: trimOrNull(input.utmSource, 200),
      utmMedium: trimOrNull(input.utmMedium, 200),
      utmCampaign: trimOrNull(input.utmCampaign, 200),
      utmContent: trimOrNull(input.utmContent, 200),
      utmTerm: trimOrNull(input.utmTerm, 200),
      campaignId: trimOrNull(input.campaignId, 120),
      adsetId: trimOrNull(input.adsetId, 120),
      adId: trimOrNull(input.adId, 120),
    },
  }
}

// ============================================================================
// Admin Records & Operational CSV Export (Clinical Privacy Wall enforced)
// ============================================================================

export interface BookingAdminRecord {
  id: string
  bookingCode: string
  clientUserId: string | null
  status: BookingStatus
  language: 'id' | 'en'
  clientStatus: BookingClientStatus
  name: string
  whatsapp: string
  whatsappE164: string
  email: string
  countryRegion: string | null
  age: number | null
  gender: string | null
  serviceType: string
  concernId: string | null
  concernCategory: string | null
  clientCategory: string | null
  genderPreference: string | null
  hasClinicalNote: boolean
  crisisFlagTriggered: boolean
  consultationMode: BookingConsultationMode
  location: BookingPhysicalBranch | null
  psychologistChoice: BookingPsychologistChoice
  psychologistId: string | null
  psychologistSlug: string | null
  selectedPsychologistName: string | null
  scheduleOption1: string
  scheduleOption2: string | null
  scheduleOption3: string | null
  confirmedStartAt: string | null
  confirmedEndAt: string | null
  baseRate: number
  assessmentFee: number
  totalRate: number
  marketingSource: string | null
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  campaignId: string | null
  adsetId: string | null
  adId: string | null
  webhookStatus: WebhookDeliveryStatus | null
  webhookAttempts: number
  webhookLastError: string | null
  submittedAt: string
  updatedAt: string
}

export const neutralizeFormula = (value: string): string => (
  /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
)

const csvCell = (value: string | number | null | undefined): string => {
  const safe = value === null || value === undefined ? '' : String(value)
  return `"${neutralizeFormula(safe).replace(/"/g, '""')}"`
}

const BOOKING_CSV_HEADER = [
  'Booking Code',
  'Status',
  'Submitted At',
  'Client Status',
  'Name',
  'WhatsApp',
  'WhatsApp E164',
  'Email',
  'Country / Region',
  'Age',
  'Gender',
  'Concern Category',
  'Clinical Triage',
  'Consultation Mode',
  'Branch',
  'Psychologist Choice',
  'Selected Psychologist',
  'Schedule Option 1',
  'Schedule Option 2',
  'Schedule Option 3',
  'Confirmed Start',
  'Confirmed End',
  'Base Rate (IDR)',
  'Assessment Fee (IDR)',
  'Total Rate (IDR)',
  'Marketing Source',
  'Referrer',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'Campaign ID',
  'Ad Set ID',
  'Ad ID',
] as const

/**
 * Operational CSV export with UTF-8 BOM + spreadsheet formula neutralization.
 * Intentionally excludes raw clinical narrative (`concernNote`) to uphold the Clinical Privacy Wall.
 */
export function bookingsToCsv(records: readonly BookingAdminRecord[]): string {
  const lines = [BOOKING_CSV_HEADER.map(csvCell).join(',')]

  for (const record of records) {
    const clinicalBadge = record.crisisFlagTriggered
      ? 'CRISIS_FLAG'
      : record.hasClinicalNote
        ? 'NOTE_STORED_IN_PORTAL'
        : ''
    lines.push(
      [
        record.bookingCode,
        record.status,
        record.submittedAt,
        record.clientStatus,
        record.name,
        record.whatsapp,
        record.whatsappE164,
        record.email,
        record.countryRegion ?? '',
        record.age ?? '',
        record.gender ?? '',
        record.concernCategory ?? '',
        clinicalBadge,
        record.consultationMode,
        record.location ?? '',
        record.psychologistChoice,
        record.selectedPsychologistName ?? '',
        record.scheduleOption1,
        record.scheduleOption2 ?? '',
        record.scheduleOption3 ?? '',
        record.confirmedStartAt ?? '',
        record.confirmedEndAt ?? '',
        record.baseRate,
        record.assessmentFee,
        record.totalRate,
        record.marketingSource ?? '',
        record.referrer ?? '',
        record.utmSource ?? '',
        record.utmMedium ?? '',
        record.utmCampaign ?? '',
        record.campaignId ?? '',
        record.adsetId ?? '',
        record.adId ?? '',
      ]
        .map(csvCell)
        .join(','),
    )
  }

  return `\uFEFF${lines.join('\r\n')}\r\n`
}
