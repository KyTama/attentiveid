import { describe, expect, it } from 'vitest'
import type { MhcuListItem } from '../src/features/mhcu-dashboard/api'
import {
  NO_FILTERS,
  defaultRecommendation,
  filterItems,
  noteChanged,
  noteDraftOf,
  noteInputOf,
  parseAmount,
  releaseBlocker,
  summarize,
} from '../src/features/mhcu-dashboard/helpers'

const item = (over: Partial<MhcuListItem>): MhcuListItem => ({
  id: 'a',
  code: 'AT-MHCU-2026-001',
  instrument: 'mhcu',
  name: 'Nadia Putri',
  age: 27,
  email: 'nadia@example.com',
  phone: '081234567890',
  level: 2,
  status: 'new',
  researchConsent: true,
  psychologistId: null,
  paymentStatus: 'UNPAID',
  waveNo: 1,
  createdAt: '2026-11-20T09:00:00Z',
  ...over,
})

const items = [
  item({ id: '1' }),
  item({ id: '2', name: 'Dimas Hidayat', code: 'AT-MHCU-2026-002', email: 'dimas@example.com', level: 4, psychologistId: 'p1', paymentStatus: 'PAID', waveNo: 3, status: 'released' }),
  item({ id: '3', name: 'Sari Wulandari', code: 'AT-MHCU-2026-003', email: 'NADIA@example.com', level: 5, psychologistId: 'p2', paymentStatus: 'FREE', waveNo: 2, status: 'reviewed' }),
]

describe('filterItems', () => {
  it('searches name, code, e-mail and phone without caring about case', () => {
    expect(filterItems(items, { ...NO_FILTERS, q: 'dimas' }).map((i) => i.id)).toEqual(['2'])
    expect(filterItems(items, { ...NO_FILTERS, q: 'at-mhcu-2026-003' }).map((i) => i.id)).toEqual(['3'])
    expect(filterItems(items, { ...NO_FILTERS, q: 'nadia@' }).map((i) => i.id)).toEqual(['1', '3'])
    expect(filterItems(items, { ...NO_FILTERS, q: '08123' }).map((i) => i.id)).toEqual(['1', '2', '3'])
  })

  it('combines status, level, payment and psychologist', () => {
    expect(filterItems(items, { ...NO_FILTERS, status: 'released' }).map((i) => i.id)).toEqual(['2'])
    expect(filterItems(items, { ...NO_FILTERS, level: '5' }).map((i) => i.id)).toEqual(['3'])
    expect(filterItems(items, { ...NO_FILTERS, payment: 'UNPAID' }).map((i) => i.id)).toEqual(['1'])
    expect(filterItems(items, { ...NO_FILTERS, psychologist: 'p1' }).map((i) => i.id)).toEqual(['2'])
    expect(filterItems(items, { ...NO_FILTERS, psychologist: 'none' }).map((i) => i.id)).toEqual(['1'])
    expect(filterItems(items, { ...NO_FILTERS, level: '4', payment: 'UNPAID' })).toEqual([])
  })

  it('has to-do filters for what still needs doing', () => {
    expect(filterItems(items, { ...NO_FILTERS, todo: 'unreleased' }).map((i) => i.id)).toEqual(['1', '3'])
    expect(filterItems(items, { ...NO_FILTERS, todo: 'unassigned' }).map((i) => i.id)).toEqual(['1'])
    expect(filterItems(items, { ...NO_FILTERS, todo: 'return' }).map((i) => i.id)).toEqual(['2', '3'])
    expect(filterItems(items, { ...NO_FILTERS, todo: 'urgent' }).map((i) => i.id)).toEqual(['2', '3'])
  })

  it('treats a missing wave number as the first check-up', () => {
    expect(filterItems([item({ waveNo: null })], { ...NO_FILTERS, todo: 'return' })).toEqual([])
  })
})

describe('summarize', () => {
  it('counts results, people (by e-mail, case-insensitive), repeats and what is open', () => {
    const s = summarize(items)
    expect(s).toEqual({ results: 3, people: 2, returning: 2, unpaid: 1, unassigned: 1, unreleased: 2, levels: [0, 1, 0, 1, 1] })
  })

  it('is all zero for an empty list', () => {
    expect(summarize([]).levels).toEqual([0, 0, 0, 0, 0])
    expect(summarize([]).people).toBe(0)
  })
})

describe('the psychologist note', () => {
  const base = { level: 4, lang: 'id', noteTemplate: null, noteCustom: null, noteFinal: false }

  it('starts from the standard text of the level, in the language of the person', () => {
    expect(noteDraftOf(base).template).toBe(defaultRecommendation(4, 'id'))
    expect(defaultRecommendation(4, 'en')).not.toBe(defaultRecommendation(4, 'id'))
  })

  it('saves the unchanged standard text as "no edit"', () => {
    const draft = noteDraftOf(base)
    expect(noteInputOf(draft, base)).toEqual({ template: null, custom: null, final: false })
  })

  it('saves an edited text and the own addition, trimmed', () => {
    const draft = { template: '  Teks sendiri.  ', custom: '  Tambahan.  ', final: true }
    expect(noteInputOf(draft, base)).toEqual({ template: 'Teks sendiri.', custom: 'Tambahan.', final: true })
  })

  it('knows when there is something unsaved', () => {
    const saved = noteDraftOf(base)
    expect(noteChanged(saved, base)).toBe(false)
    expect(noteChanged({ ...saved, custom: 'x' }, base)).toBe(true)
    expect(noteChanged({ ...saved, final: true }, base)).toBe(true)
    expect(noteChanged({ ...saved, template: `${saved.template}  ` }, base)).toBe(false)
  })
})

describe('parseAmount', () => {
  it('reads whole rupiah, with or without separators or "Rp"', () => {
    expect(parseAmount('227000')).toBe(227000)
    expect(parseAmount('227.000')).toBe(227000)
    expect(parseAmount('Rp 1.250.000')).toBe(1250000)
    expect(parseAmount('rp227,000')).toBe(227000)
    expect(parseAmount('0')).toBe(0)
  })

  it('treats empty as no amount and rejects everything else', () => {
    expect(parseAmount('  ')).toBe('')
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('-5')).toBeNull()
    expect(parseAmount('227.5')).toBeNull()
    expect(parseAmount('1e6')).toBeNull()
    expect(parseAmount('100000001')).toBeNull()
  })
})

describe('releaseBlocker', () => {
  it('needs a final note and a confirmed payment, like the server', () => {
    expect(releaseBlocker({ noteFinal: false, paymentStatus: 'PAID', status: 'reviewed' })).toBe('note')
    expect(releaseBlocker({ noteFinal: true, paymentStatus: 'UNPAID', status: 'reviewed' })).toBe('payment')
    expect(releaseBlocker({ noteFinal: true, paymentStatus: 'PAID', status: 'reviewed' })).toBeNull()
    for (const paid of ['FREE', 'INCLUDED', 'LEGACY']) expect(releaseBlocker({ noteFinal: true, paymentStatus: paid, status: 'new' })).toBeNull()
  })

  it('says so when it is already released', () => {
    expect(releaseBlocker({ noteFinal: true, paymentStatus: 'PAID', status: 'released' })).toBe('released')
  })
})
