import { describe, expect, it } from 'bun:test'
import {
  buildFreeSessionWhatsAppUrl,
  dedupeFreeSessionRecords,
  freeSessionRecordsToCsv,
  validateFreeSessionSubmission,
  type FreeSessionRecord,
} from './free-session'

const validInput = {
  eligible: 'baru',
  name: '  Nico   Testerson ',
  age: '24',
  gender: 'laki-laki',
  phone: '0812-3456-7890',
  email: 'nico@example.com',
  keluhan: 'cemas',
  keluhanDetail: ' Sulit tidur ',
  agreed: true,
}

describe('validateFreeSessionSubmission', () => {
  it('accepts a complete submission and normalizes it', () => {
    const result = validateFreeSessionSubmission(validInput)
    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Nico   Testerson',
        age: 24,
        gender: 'laki-laki',
        phone: '081234567890',
        email: 'nico@example.com',
        keluhan: 'cemas',
        keluhanDetail: 'Sulit tidur',
      },
    })
  })

  it('treats gender, email and detail as optional', () => {
    const result = validateFreeSessionSubmission({
      ...validInput,
      gender: '',
      email: '',
      keluhanDetail: '',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.gender).toBeNull()
      expect(result.value.email).toBeNull()
      expect(result.value.keluhanDetail).toBeNull()
    }
  })

  it('rejects returning users', () => {
    const result = validateFreeSessionSubmission({ ...validInput, eligible: 'lama' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(['eligible'])
  })

  it('reports every invalid field', () => {
    const result = validateFreeSessionSubmission({
      eligible: 'baru',
      name: 'A',
      age: '14',
      gender: 'x',
      phone: '123',
      email: 'not-an-email',
      keluhan: 'unknown',
      keluhanDetail: 'a'.repeat(501),
      agreed: false,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ['age', 'agreed', 'email', 'gender', 'keluhan', 'keluhanDetail', 'name', 'phone'].sort(),
      )
    }
  })

  it('rejects non-object input and non-boolean consent', () => {
    expect(validateFreeSessionSubmission(null).ok).toBe(false)
    expect(validateFreeSessionSubmission({ ...validInput, agreed: 'true' }).ok).toBe(false)
  })

  it('enforces the age bounds', () => {
    expect(validateFreeSessionSubmission({ ...validInput, age: 15 }).ok).toBe(true)
    expect(validateFreeSessionSubmission({ ...validInput, age: 99 }).ok).toBe(true)
    expect(validateFreeSessionSubmission({ ...validInput, age: 100 }).ok).toBe(false)
    expect(validateFreeSessionSubmission({ ...validInput, age: '24.5' }).ok).toBe(false)
  })
})

describe('buildFreeSessionWhatsAppUrl', () => {
  it('encodes name and complaint into the wa.me message', () => {
    const url = buildFreeSessionWhatsAppUrl('+62 851-5641-0912', {
      name: 'Nico',
      keluhan: 'cemas',
      keluhanDetail: 'Sulit tidur',
    })
    expect(url.startsWith('https://wa.me/6285156410912?text=')).toBe(true)
    const message = decodeURIComponent(url.split('?text=')[1])
    expect(message).toContain('saya Nico')
    expect(message).toContain('Keluhan: Cemas / panik — Sulit tidur')
  })

  it('omits the dash when there is no detail', () => {
    const url = buildFreeSessionWhatsAppUrl('6285156410912', { name: 'Nico', keluhan: 'tidur', keluhanDetail: null })
    expect(decodeURIComponent(url.split('?text=')[1])).toContain('Keluhan: Sulit tidur')
  })
})

const record = (overrides: Partial<FreeSessionRecord>): FreeSessionRecord => ({
  id: 'id',
  createdAt: '2026-10-01T00:00:00.000Z',
  name: 'Nico Testerson',
  age: 24,
  gender: null,
  phone: '081234567890',
  email: null,
  keluhan: 'stres',
  keluhanDetail: null,
  ...overrides,
})

describe('dedupeFreeSessionRecords', () => {
  it('keeps the latest of duplicates by normalized name + phone, newest first', () => {
    const list = [
      record({ id: 'old', createdAt: '2026-10-01T00:00:00.000Z' }),
      record({ id: 'new', createdAt: '2026-10-03T00:00:00.000Z', name: ' NICO  testerson ', phone: '0812-3456-7890' }),
      record({ id: 'other', createdAt: '2026-10-02T00:00:00.000Z', name: 'Someone Else', phone: '089999999999' }),
    ]
    expect(dedupeFreeSessionRecords(list).map((r) => r.id)).toEqual(['new', 'other'])
  })

  it('does not mutate the input', () => {
    const list = [record({ id: 'a' }), record({ id: 'b', createdAt: '2026-10-02T00:00:00.000Z' })]
    dedupeFreeSessionRecords(list)
    expect(list.map((r) => r.id)).toEqual(['a', 'b'])
  })
})

describe('freeSessionRecordsToCsv', () => {
  it('writes a BOM, header and escaped rows', () => {
    const csv = freeSessionRecordsToCsv([record({ name: 'Nico "N" Test', keluhanDetail: 'a, b' })])
    expect(csv.startsWith('﻿"ID","Timestamp","Nama"')).toBe(true)
    expect(csv).toContain('"Nico ""N"" Test"')
    expect(csv).toContain('"a, b"')
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('neutralizes spreadsheet formula injection', () => {
    const csv = freeSessionRecordsToCsv([record({ name: '=HYPERLINK("http://evil")', keluhanDetail: '+1+1' })])
    expect(csv).toContain(`"'=HYPERLINK(""http://evil"")"`)
    expect(csv).toContain(`"'+1+1"`)
  })
})
