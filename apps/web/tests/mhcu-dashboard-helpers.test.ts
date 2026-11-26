import { describe, expect, it } from 'vitest'
import type { MhcuListItem, MhcuSettings } from '../src/features/mhcu-dashboard/api'
import {
  CHART,
  NO_FILTERS,
  chartPoints,
  deltaTone,
  formatThousands,
  markerPercent,
  monthLabel,
  regroupRupiah,
  rupiahValue,
  settingsEqual,
  settingsProblem,
  signed1,
  trackLabel,
  yOfScore,
  awaitsConfirmation,
  defaultRecommendation,
  filterItems,
  noteChanged,
  noteDraftOf,
  englishNoteMissing,
  indonesianNoteMissing,
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
  item({ id: '1', paymentSubmittedAt: '2026-11-21T03:00:00Z', paymentFor: 'single' }),
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

  it('finds the ones waiting for a payment check: proof sent, still unpaid', () => {
    expect(filterItems(items, { ...NO_FILTERS, todo: 'proof' }).map((i) => i.id)).toEqual(['1'])
    // proof sent but already confirmed, or unpaid without a proof, does not count
    const confirmed = item({ id: '9', paymentSubmittedAt: '2026-11-21T03:00:00Z', paymentStatus: 'PAID' })
    const noProof = item({ id: '8', paymentSubmittedAt: null })
    expect(filterItems([confirmed, noProof], { ...NO_FILTERS, todo: 'proof' })).toEqual([])
    expect(awaitsConfirmation(confirmed)).toBe(false)
    expect(awaitsConfirmation(noProof)).toBe(false)
    expect(awaitsConfirmation(item({}))).toBe(false)
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
    expect(s).toEqual({ results: 3, people: 2, returning: 2, awaiting: 1, unpaid: 1, unassigned: 1, unreleased: 2, levels: [0, 1, 0, 1, 1] })
  })

  it('is all zero for an empty list', () => {
    expect(summarize([]).levels).toEqual([0, 0, 0, 0, 0])
    expect(summarize([]).people).toBe(0)
  })
})

describe('the psychologist note', () => {
  const base = { level: 4, noteTemplate: null, noteCustom: null, noteTemplateEn: null, noteCustomEn: null, noteFinal: false }
  const nothing = { template: null, custom: null, templateEn: null, customEn: null }

  it('starts each language from its own standard text of the level', () => {
    expect(noteDraftOf(base).template).toBe(defaultRecommendation(4, 'id'))
    expect(noteDraftOf(base).templateEn).toBe(defaultRecommendation(4, 'en'))
    expect(defaultRecommendation(4, 'en')).not.toBe(defaultRecommendation(4, 'id'))
  })

  it('saves the unchanged standard text as "no edit"', () => {
    const draft = noteDraftOf(base)
    expect(noteInputOf(draft, base)).toEqual({ ...nothing, final: false })
  })

  it('saves an edited text and the own addition, trimmed', () => {
    const draft = { template: '  Teks sendiri.  ', custom: '  Tambahan.  ', templateEn: ' Own text. ', customEn: ' Extra. ', final: true }
    expect(noteInputOf(draft, base)).toEqual({ template: 'Teks sendiri.', custom: 'Tambahan.', templateEn: 'Own text.', customEn: 'Extra.', final: true })
  })

  it('warns when the psychologist wrote Indonesian text without an English version', () => {
    const draft = noteDraftOf(base)
    expect(englishNoteMissing(draft, base)).toBe(false)
    expect(englishNoteMissing({ ...draft, custom: 'Tambahan.' }, base)).toBe(true)
    expect(englishNoteMissing({ ...draft, custom: 'Tambahan.', customEn: 'Extra.' }, base)).toBe(false)
    expect(englishNoteMissing({ ...draft, template: 'Teks sendiri.' }, base)).toBe(true)
    expect(englishNoteMissing({ ...draft, template: 'Teks sendiri.', templateEn: 'Own text.' }, base)).toBe(false)
    expect(englishNoteMissing({ ...draft, customEn: 'Extra.' }, base)).toBe(false)
  })

  it('warns the other way round too: English text without an Indonesian version', () => {
    const draft = noteDraftOf(base)
    expect(indonesianNoteMissing(draft, base)).toBe(false)
    expect(indonesianNoteMissing({ ...draft, customEn: 'Extra.' }, base)).toBe(true)
    expect(indonesianNoteMissing({ ...draft, templateEn: 'Own text.' }, base)).toBe(true)
    expect(indonesianNoteMissing({ ...draft, customEn: 'Extra.', custom: 'Tambahan.' }, base)).toBe(false)
    expect(indonesianNoteMissing({ ...draft, custom: 'Tambahan.' }, base)).toBe(false)
  })

  it('knows when there is something unsaved', () => {
    const saved = noteDraftOf(base)
    expect(noteChanged(saved, base)).toBe(false)
    expect(noteChanged({ ...saved, custom: 'x' }, base)).toBe(true)
    expect(noteChanged({ ...saved, customEn: 'x' }, base)).toBe(true)
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

describe('history chart numbers', () => {
  const waves = [
    { id: 'a', waveNo: 1, date: '2026-07-31', mhi: 46.08, level: 3 },
    { id: 'b', waveNo: 2, date: '2026-08-28', mhi: null, level: 3 },
    { id: 'c', waveNo: 3, date: '2026-09-25', mhi: 76.1, level: 2 },
  ]

  it('leaves out waves without an MHI and spreads the rest over the width', () => {
    const points = chartPoints(waves, 'c')
    expect(points.map((p) => p.id)).toEqual(['a', 'c'])
    expect(points[0]!.x).toBe(CHART.left)
    expect(points[1]!.x).toBe(CHART.W - CHART.right)
    expect(points[0]!.caption).toBe('T1 07-31')
    expect(points[1]!.current).toBe(true)
    expect(points[0]!.current).toBe(false)
  })

  it('a higher MHI is drawn higher up, a lone point sits in the middle', () => {
    const [low, high] = chartPoints(waves, 'a')
    expect(high!.y).toBeLessThan(low!.y)
    const single = chartPoints([waves[0]!], 'a')
    expect(single[0]!.x).toBe(CHART.left + (CHART.W - CHART.left - CHART.right) / 2)
  })

  it('keeps out-of-range scores on the chart', () => {
    const [p] = chartPoints([{ id: 'x', waveNo: 1, date: '2026-01-01', mhi: 140, level: 1 }], 'x')
    expect(p!.y).toBe(yOfScore(100))
  })

  it('places the MHI marker on the 0-100 bar', () => {
    expect(markerPercent(54.2)).toBe(54.2)
    expect(markerPercent(-3)).toBe(0)
    expect(markerPercent(120)).toBe(100)
    expect(markerPercent(null)).toBeNull()
  })

  it('writes changes with a sign and a decimal comma', () => {
    expect(signed1(4.68)).toBe('+4,7')
    expect(signed1(-12.7)).toBe('-12,7')
    expect(signed1(0)).toBe('0,0')
    expect(signed1(null)).toBe('–')
    expect(deltaTone(4.7)).toContain('emerald')
    expect(deltaTone(-4.7)).toContain('rose')
    expect(deltaTone(null)).toContain('slate')
  })

  it('names months and tracks in both languages', () => {
    expect(monthLabel('2026-11', 'id')).toBe('Nov 26')
    expect(monthLabel('2026-08', 'id')).toBe('Agu 26')
    expect(monthLabel('2026-08', 'en')).toBe('Aug 26')
    expect(monthLabel('bad', 'id')).toBe('bad')
    expect(trackLabel('asesmen', 'id')).toBe('Asesmen awal')
    expect(trackLabel('mandiri', 'en')).toBe('Self check-up')
    expect(trackLabel(undefined, 'id')).toBeNull()
    expect(trackLabel('something-new', 'id')).toBe('something-new')
  })
})

describe('settings helpers', () => {
  const base: MhcuSettings = {
    pricing: { single: { normal: 297000, promo: 227000 }, package3: { normal: 885000, promo: 647000 }, promoUntil: '2027-04-30' },
    alertLevel: 4,
    alertEmail: 'contact@attentiveid.com',
    autoAssign: true,
    autoSend: false,
  }

  it('writes rupiah with thousand points and reads them back', () => {
    expect(formatThousands(1250000)).toBe('1.250.000')
    expect(formatThousands(0)).toBe('0')
    expect(formatThousands(null)).toBe('')
    expect(regroupRupiah('227000')).toBe('227.000')
    expect(regroupRupiah('2270x00')).toBe('227.000')
    expect(regroupRupiah('')).toBe('')
    expect(rupiahValue('227.000')).toBe(227000)
    expect(rupiahValue('')).toBeNull()
    expect(rupiahValue('abc')).toBeNull()
  })

  it('finds dirty state', () => {
    expect(settingsEqual(base, structuredClone(base))).toBe(true)
    expect(settingsEqual(base, { ...base, autoSend: true })).toBe(false)
  })

  it('catches easy mistakes and says them in the language asked', () => {
    expect(settingsProblem(base, 'id')).toBeNull()
    expect(settingsProblem({ ...base, pricing: { ...base.pricing, single: { normal: 100, promo: 200 } } }, 'id')).toMatch(/promo 1x tidak boleh lebih tinggi/)
    expect(settingsProblem({ ...base, pricing: { ...base.pricing, package3: { normal: 100, promo: 200 } } }, 'en')).toMatch(/3x promo price cannot be higher/)
    expect(settingsProblem({ ...base, pricing: { ...base.pricing, single: { normal: Number.NaN, promo: 1 } } }, 'id')).toMatch(/angka rupiah/)
    expect(settingsProblem({ ...base, pricing: { ...base.pricing, promoUntil: '' } }, 'id')).toMatch(/tanggal akhir promo/)
    expect(settingsProblem({ ...base, alertEmail: 'bukan-email' }, 'id')).toMatch(/tidak valid/)
    expect(settingsProblem({ ...base, alertEmail: '  ' }, 'id')).toBeNull()
  })
})
