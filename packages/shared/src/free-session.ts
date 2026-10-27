/**
 * Free Session ("Sesi Gratis 60 Menit") lead form domain.
 *
 * Shared by the public form (apps/web) and the submission API (apps/api) so the
 * option lists and validation rules cannot drift apart.
 */

export const FREE_SESSION_KELUHAN_OPTIONS = [
  { id: 'stres', label: 'Stres / burnout' },
  { id: 'cemas', label: 'Cemas / panik' },
  { id: 'sedih', label: 'Sedih / mood turun' },
  { id: 'tidur', label: 'Sulit tidur' },
  { id: 'hubungan', label: 'Masalah hubungan / keluarga' },
  { id: 'pekerjaan', label: 'Pekerjaan' },
  { id: 'akademik', label: 'Akademik' },
  { id: 'trauma', label: 'Trauma / kehilangan' },
  { id: 'percaya', label: 'Kepercayaan diri' },
  { id: 'identitas', label: 'Isu identitas / jati diri' },
  { id: 'kecanduan', label: 'Kebiasaan / kecanduan' },
  { id: 'lainnya', label: 'Lainnya' },
] as const

export const FREE_SESSION_GENDER_OPTIONS = [
  { id: 'perempuan', label: 'Perempuan' },
  { id: 'laki-laki', label: 'Laki-laki' },
  { id: 'lainnya', label: 'Lainnya / Tidak ingin menjawab' },
] as const

export type FreeSessionKeluhanId = typeof FREE_SESSION_KELUHAN_OPTIONS[number]['id']
export type FreeSessionGenderId = typeof FREE_SESSION_GENDER_OPTIONS[number]['id']

export const FREE_SESSION_MAX_DETAIL_LENGTH = 500
export const FREE_SESSION_MIN_AGE = 15
export const FREE_SESSION_MAX_AGE = 99
export const FREE_SESSION_BOOKING_URL = 'https://booking.attentiveid.com'

/** A validated submission, ready to store. `phone` is digits only. */
export interface FreeSessionSubmission {
  name: string
  age: number
  gender: FreeSessionGenderId | null
  phone: string
  email: string | null
  keluhan: FreeSessionKeluhanId
  keluhanDetail: string | null
}

export type FreeSessionField =
  | 'eligible'
  | 'name'
  | 'age'
  | 'gender'
  | 'phone'
  | 'email'
  | 'keluhan'
  | 'keluhanDetail'
  | 'agreed'

export type FreeSessionValidationResult =
  | { ok: true; value: FreeSessionSubmission }
  | { ok: false; errors: Partial<Record<FreeSessionField, string>> }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const keluhanLabel = (id: string): string | undefined =>
  FREE_SESSION_KELUHAN_OPTIONS.find((option) => option.id === id)?.label

export const genderLabel = (id: string | null | undefined): string =>
  FREE_SESSION_GENDER_OPTIONS.find((option) => option.id === id)?.label ?? ''

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

/**
 * Validates raw form input. Mirrors the rules of the original PHP form:
 * new users only, name >= 2 chars, age 15-99, WhatsApp 9-15 digits, optional
 * email/gender, a closed list of complaints, and explicit consent.
 */
export const validateFreeSessionSubmission = (input: unknown): FreeSessionValidationResult => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Partial<Record<FreeSessionField, string>> = {}

  if (raw.eligible !== 'baru') {
    errors.eligible = 'Program ini khusus pengguna baru Attentive.'
  }

  const name = asString(raw.name).trim()
  if (name.length < 2 || name.length > 80) {
    errors.name = 'Mohon isi nama lengkap.'
  }

  const ageText = typeof raw.age === 'number' ? String(raw.age) : asString(raw.age).trim()
  const age = /^\d{1,3}$/.test(ageText) ? Number(ageText) : Number.NaN
  if (!Number.isInteger(age) || age < FREE_SESSION_MIN_AGE || age > FREE_SESSION_MAX_AGE) {
    errors.age = `Umur harus antara ${FREE_SESSION_MIN_AGE}–${FREE_SESSION_MAX_AGE}.`
  }

  const genderText = asString(raw.gender)
  const gender = genderText === '' ? null : genderText
  if (gender !== null && !FREE_SESSION_GENDER_OPTIONS.some((option) => option.id === gender)) {
    errors.gender = 'Pilihan tidak valid.'
  }

  const phone = asString(raw.phone).replace(/\D+/g, '')
  if (phone.length < 9 || phone.length > 15) {
    errors.phone = 'Nomor WhatsApp tidak valid.'
  }

  const email = asString(raw.email).trim()
  if (email !== '' && (email.length > 120 || !EMAIL_PATTERN.test(email))) {
    errors.email = 'Alamat email tidak valid.'
  }

  const keluhan = asString(raw.keluhan)
  if (!keluhanLabel(keluhan)) {
    errors.keluhan = 'Pilih salah satu keluhan.'
  }

  const keluhanDetail = asString(raw.keluhanDetail).trim()
  if (keluhanDetail.length > FREE_SESSION_MAX_DETAIL_LENGTH) {
    errors.keluhanDetail = `Maks ${FREE_SESSION_MAX_DETAIL_LENGTH} karakter.`
  }

  if (raw.agreed !== true) {
    errors.agreed = 'Persetujuan diperlukan agar kami bisa menghubungi kamu.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      name,
      age,
      gender: gender as FreeSessionGenderId | null,
      phone,
      email: email === '' ? null : email,
      keluhan: keluhan as FreeSessionKeluhanId,
      keluhanDetail: keluhanDetail === '' ? null : keluhanDetail,
    },
  }
}

/** Builds the pre-filled WhatsApp hand-off link shown after a successful submit. */
export const buildFreeSessionWhatsAppUrl = (
  whatsappNumber: string,
  submission: Pick<FreeSessionSubmission, 'name' | 'keluhan' | 'keluhanDetail'>,
): string => {
  const label = keluhanLabel(submission.keluhan) ?? submission.keluhan
  const complaint = submission.keluhanDetail ? `${label} — ${submission.keluhanDetail}` : label
  const message =
    `Halo kak, saya ${submission.name}, saya tertarik dengan produk anda terkait Sesi Gratis 60 Menit dengan Psikolog, boleh saya daftar kak?\n\n` +
    `Nama: ${submission.name}\nKeluhan: ${complaint}`
  return `https://wa.me/${whatsappNumber.replace(/\D+/g, '')}?text=${encodeURIComponent(message)}`
}

export interface FreeSessionRecord extends FreeSessionSubmission {
  id: string
  createdAt: string
}

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ')
const normalizePhone = (phone: string) => phone.replace(/\D+/g, '')

/**
 * Admin report cleaning: one row per (name + WhatsApp), keeping the latest
 * submission, newest first. The raw rows in the database are never touched.
 */
export const dedupeFreeSessionRecords = <T extends Pick<FreeSessionRecord, 'name' | 'phone' | 'createdAt'>>(
  records: readonly T[],
): T[] => {
  const latest = new Map<string, T>()
  for (const record of records) {
    const key = `${normalizeName(record.name)}|${normalizePhone(record.phone)}`
    const current = latest.get(key)
    if (!current || record.createdAt > current.createdAt) {
      latest.set(key, record)
    }
  }
  return [...latest.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
}

const CSV_HEADER = [
  'ID',
  'Timestamp',
  'Nama',
  'Umur',
  'Jenis Kelamin',
  'Nomor WhatsApp',
  'Email',
  'Keluhan (kode)',
  'Keluhan (label)',
  'Ceritakan lebih lanjut',
] as const

// Spreadsheet apps execute cells that start with these characters as formulas.
const neutralizeFormula = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value)
const csvCell = (value: string | number) => `"${neutralizeFormula(String(value)).replace(/"/g, '""')}"`

/** CSV (UTF-8 BOM so Excel reads Indonesian text correctly) for the admin report. */
export const freeSessionRecordsToCsv = (records: readonly FreeSessionRecord[]): string => {
  const lines = [CSV_HEADER.map(csvCell).join(',')]
  for (const record of records) {
    lines.push(
      [
        record.id,
        record.createdAt,
        record.name,
        record.age,
        genderLabel(record.gender),
        record.phone,
        record.email ?? '',
        record.keluhan,
        keluhanLabel(record.keluhan) ?? '',
        record.keluhanDetail ?? '',
      ]
        .map(csvCell)
        .join(','),
    )
  }
  return `﻿${lines.join('\r\n')}\r\n`
}
