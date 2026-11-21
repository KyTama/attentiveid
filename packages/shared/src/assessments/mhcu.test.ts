import { describe, expect, it } from 'bun:test'
import {
  MHCU_ANSWER_RANGE,
  MHCU_ITEMS,
  MHCU_PART_SIZE,
  MHCU_PARTS,
  mhcuCode,
  mhcuItemsOf,
  mhcuTriggersText,
  scoreMhcu,
  validateMhcuSubmission,
  type MhcuAnswers,
} from './mhcu'

/* ---------- helpers ---------- */

interface Arrays {
  cc?: (number | null)[]
  wb?: (number | null)[]
  hb?: (number | null)[]
  ati?: (number | null)[]
}

/** Build an answers record from per-part arrays (null / undefined = not answered). Defaults: all-zero symptoms, WB 3, HB 2, ATI 2. */
function answersOf(a: Arrays = {}): MhcuAnswers {
  const parts = {
    cc: a.cc ?? new Array<number>(23).fill(0),
    wb: a.wb ?? new Array<number>(14).fill(3),
    hb: a.hb ?? new Array<number>(15).fill(2),
    ati: a.ati ?? new Array<number>(6).fill(2),
  }
  const out: Record<string, number | null> = {}
  for (const part of MHCU_PARTS) {
    parts[part].forEach((v, i) => {
      if (v !== null && v !== undefined) out[mhcuCode(part, i + 1)] = v
    })
  }
  return out
}

/** 23 symptom answers, all zero except the given 1-based items */
const ccWith = (set: Record<number, number>): number[] => Array.from({ length: 23 }, (_, i) => set[i + 1] ?? 0)

/** 14 WEMWBS answers (1-5) that add up to `total` (14-70) */
function wbTotal(total: number): number[] {
  const base = Math.floor(total / 14)
  const a = new Array<number>(14).fill(base)
  for (let i = 0; i < total - base * 14; i++) a[i] = (a[i] ?? 0) + 1
  return a
}

const near = (a: number | null, b: number | null, tol = 1e-4): boolean =>
  a === null || b === null ? a === b : Math.abs(a - b) <= tol

/* ---------- calculator rows (R_MHCU calculator - version latest.xlsx, sheet Hasil, cached values) ---------- */
/* ans = 23 CC, 14 WB, 15 HB, 6 ATI in form order; null = the old "NA" / skipped (excluded from the index). */

const CALC_ROWS = [
  {
    name: "Sampel 1",
    ans: [0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,5,4,4,4,4,4,5,4,5,4,5,5,4,4,3,4,3,4,4,3,3,4,4,4,3,4,3,2,3,4,3,3,4,3,3],
    exp: {
      dom: [0,1,0,1,1,0,0,1,0,0,0,0,0], flagNonCrit: 0, maxNonCrit: 1, flagNames: "",
      di: 7.692308, diCat: "Minimal", wb: 61, wi: 83.928571, wiCat: "Tinggi",
      wiDims: [83.333333,81.25,91.666667], hbN: 15, bhi: 85, bhiCat: "Baik",
      bhiDims: [85.714286,80,91.666667], mhi: 87.494505, mhiLevel: 1,
      r1: 0, r2: 0, r3: 0, level: 1, status: "Baik",
      trigger: "Tidak ada pemicu", followUp: "Umpan balik umum dan psikoedukasi; skrining ulang berkala (mis. 6 bulan).",
      atiTotal: 20, atiIndex: 83.333333, atiCat: "Tinggi", atiHi: "Attentive Listening", atiLo: "Empathic Concern",
    },
  },
  {
    name: "Sampel 2",
    ans: [1,1,1,0,0,1,0,1,1,0,0,0,0,2,1,0,0,0,1,0,0,3,0,4,4,3,3,3,4,4,4,4,3,4,4,4,3,2,4,2,4,null,1,2,3,3,4,3,2,2,null,2,3,2,3,2,3,2],
    exp: {
      dom: [1,1,0,1,1,0,0,2,1,0,0,1,3], flagNonCrit: 2, maxNonCrit: 3, flagNames: "Masalah Tidur, Penggunaan Zat",
      di: 21.153846, diCat: "Ringan", wb: 51, wi: 66.071429, wiCat: "Rata-rata",
      wiDims: [58.333333,68.75,66.666667], hbN: 13, bhi: 65.384615, bhiCat: "Cukup",
      bhiDims: [60.714286,68.75,75], mhi: 71.043956, mhiLevel: 1,
      r1: 0, r2: 2, r3: 0, level: 2, status: "Perlu Dipantau",
      trigger: "2 domain di atas ambang", followUp: "Psikolog meninjau domain/item yang ditandai; tawarkan konseling (First Free Session); skrining ulang 2-4 minggu.",
      atiTotal: 15, atiIndex: 62.5, atiCat: "Tinggi", atiHi: "Attentive Listening", atiLo: "Empathic Concern",
    },
  },
  {
    name: "Sampel 3",
    ans: [3,3,2,0,1,3,2,2,2,1,0,0,0,3,2,1,0,1,2,2,0,0,0,2,3,2,3,2,2,3,3,3,2,3,3,3,2,1,2,1,3,2,0,1,2,2,3,1,2,2,1,1,3,3,2,2,2,3],
    exp: {
      dom: [3,2,1,3,2,0,0,3,2,1,1,2,0], flagNonCrit: 7, maxNonCrit: 3, flagNames: "Depresi, Kemarahan, Kecemasan, Gejala Somatik, Masalah Tidur, Memori, Fungsi Kepribadian",
      di: 38.461538, diCat: "Sedang", wb: 36, wi: 39.285714, wiCat: "Sangat rendah",
      wiDims: [25,40.625,50], hbN: 15, bhi: 40, bhiCat: "Kurang",
      bhiDims: [35.714286,45,41.666667], mhi: 48.32967, mhiLevel: 3,
      r1: 0, r2: 3, r3: 3, level: 3, status: "Perlu Perhatian",
      trigger: "7 domain di atas ambang, total well-being 36 (indikasi depresi probable), MHI rendah (48.3)", followUp: "Rekomendasikan sesi konseling dan asesmen lanjutan untuk domain yang ditandai.",
      atiTotal: 15, atiIndex: 62.5, atiCat: "Tinggi", atiHi: "Attentive Listening", atiLo: "Mindful Awareness",
    },
  },
  {
    name: "Sampel 4",
    ans: [4,4,3,1,1,4,3,3,3,3,0,0,0,4,3,3,2,2,3,4,2,0,0,1,2,1,2,1,2,2,2,2,1,2,3,2,1,0,1,0,2,1,0,0,1,1,2,0,1,1,0,0,2,3,1,1,1,2],
    exp: {
      dom: [4,3,1,4,3,0,0,4,3,3,2,4,2], flagNonCrit: 10, maxNonCrit: 4, flagNames: "Depresi, Kemarahan, Kecemasan, Gejala Somatik, Masalah Tidur, Memori, Pikiran & Perilaku Berulang, Disosiasi, Fungsi Kepribadian, Penggunaan Zat",
      di: 63.461538, diCat: "Tinggi", wb: 24, wi: 17.857143, wiCat: "Sangat rendah",
      wiDims: [0,18.75,33.333333], hbN: 15, bhi: 16.666667, bhiCat: "Sangat kurang",
      bhiDims: [14.285714,20,16.666667], mhi: 25.091575, mhiLevel: 4,
      r1: 0, r2: 3, r3: 3, level: 4, status: "Perlu Perhatian Serius",
      trigger: "10 domain di atas ambang, ada domain berat (skor 4), total well-being 24 (indikasi depresi probable), MHI rendah (25.1)", followUp: "Psikolog menghubungi secara proaktif; asesmen klinis menyeluruh; pertimbangkan rujukan psikiater.",
      atiTotal: 10, atiIndex: 41.666667, atiCat: "Sedang", atiHi: "Empathic Concern", atiLo: "Mindful Awareness",
    },
  },
  {
    name: "Sampel 5",
    ans: [1,2,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,1,0,0,0,3,4,3,4,3,3,4,3,4,3,4,4,4,3,3,4,2,4,3,2,3,3,2,4,3,2,3,2,4,4,4,3,3,4,4],
    exp: {
      dom: [2,1,0,1,0,1,0,1,0,0,0,1,0], flagNonCrit: 1, maxNonCrit: 2, flagNames: "Depresi, Pikiran Menyakiti Diri",
      di: 13.461538, diCat: "Ringan", wb: 49, wi: 62.5, wiCat: "Rata-rata",
      wiDims: [50,62.5,75], hbN: 15, bhi: 73.333333, bhiCat: "Cukup",
      bhiDims: [67.857143,70,91.666667], mhi: 74.282051, mhiLevel: 1,
      r1: 5, r2: 2, r3: 0, level: 5, status: "Prioritas (item kritis)",
      trigger: "Pikiran menyakiti diri (CC11 = 1), 1 domain di atas ambang", followUp: "Hubungi hari yang sama; asesmen risiko bunuh diri; susun safety plan; rujuk layanan darurat bila risiko tinggi.",
      atiTotal: 22, atiIndex: 91.666667, atiCat: "Sangat tinggi", atiHi: "Attentive Listening", atiLo: "Mindful Awareness",
    },
  },]

function rowAnswers(ans: (number | null)[]): MhcuAnswers {
  return answersOf({ cc: ans.slice(0, 23), wb: ans.slice(23, 37), hb: ans.slice(37, 52), ati: ans.slice(52, 58) })
}

/* ============================== TESTS ============================== */

describe('MHCU item bank', () => {
  it('has 58 items: 23 / 14 / 15 / 6', () => {
    expect(MHCU_ITEMS.length).toBe(58)
    for (const part of MHCU_PARTS) expect(mhcuItemsOf(part).length).toBe(MHCU_PART_SIZE[part])
  })

  it('codes follow the form helper (CC01..CC23, WB01.., HB01.., ATI01..ATI06) and are unique', () => {
    expect(mhcuCode('cc', 1)).toBe('CC01')
    expect(mhcuCode('cc', 23)).toBe('CC23')
    expect(mhcuCode('wb', 9)).toBe('WB09')
    expect(mhcuCode('hb', 15)).toBe('HB15')
    expect(mhcuCode('ati', 6)).toBe('ATI06')
    expect(new Set(MHCU_ITEMS.map((i) => i.code)).size).toBe(58)
    for (const it of MHCU_ITEMS) expect(it.code).toBe(mhcuCode(it.part, it.n))
  })

  it('keeps form order and non-empty Indonesian and English text', () => {
    expect(MHCU_ITEMS[0]?.code).toBe('CC01')
    expect(MHCU_ITEMS[23]?.code).toBe('WB01')
    expect(MHCU_ITEMS[37]?.code).toBe('HB01')
    expect(MHCU_ITEMS[57]?.code).toBe('ATI06')
    for (const it of MHCU_ITEMS) {
      expect(it.id.length).toBeGreaterThan(2)
      expect(it.en.length).toBeGreaterThan(2)
    }
    expect(mhcuItemsOf('ati')[3]?.id).toContain('mengelola') // corrected spelling, not "mengelolal"
  })

  it('answer ranges: Part B is 1-5, every other part 0-4', () => {
    expect(MHCU_ANSWER_RANGE.wb).toEqual({ min: 1, max: 5 })
    for (const p of ['cc', 'hb', 'ati'] as const) expect(MHCU_ANSWER_RANGE[p]).toEqual({ min: 0, max: 4 })
  })
})

describe('scoreMhcu: team calculator rows', () => {
  for (const row of CALC_ROWS) {
    it(`${row.name} gives the same numbers as the calculator`, () => {
      const r = scoreMhcu(rowAnswers(row.ans))
      const e = row.exp
      expect(r.domains.map((d) => d.score)).toEqual(e.dom)
      expect(r.flaggedNonCritical).toBe(e.flagNonCrit)
      expect(r.maxNonCritical).toBe(e.maxNonCrit)
      expect(r.flaggedDomains.join(', ')).toBe(e.flagNames)
      expect(near(r.di, e.di)).toBe(true)
      expect(r.diCategory?.id).toBe(e.diCat)
      expect(r.wbTotal).toBe(e.wb)
      expect(near(r.wi, e.wi)).toBe(true)
      expect(r.wiCategory?.id).toBe(e.wiCat)
      e.wiDims.forEach((v, i) => expect(near(r.wiDims[i]?.score ?? null, v)).toBe(true))
      expect(r.answered.hb).toBe(e.hbN)
      expect(near(r.bhi, e.bhi)).toBe(true)
      expect(r.bhiCategory?.id).toBe(e.bhiCat)
      e.bhiDims.forEach((v, i) => expect(near(r.bhiDims[i]?.score ?? null, v)).toBe(true))
      expect(near(r.mhi, e.mhi)).toBe(true)
      expect(r.mhiLevel as number | null).toBe(e.mhiLevel)
      expect({ ...r.redFlags } as Record<string, number>).toEqual({ r1: e.r1, r2: e.r2, r3: e.r3 })
      expect(r.level as number).toBe(e.level)
      expect(r.status).toBe(e.status)
      expect(mhcuTriggersText(r, 'id')).toBe(e.trigger)
      expect(r.followUp.actionId).toBe(e.followUp)
      expect(near(r.ati.total, e.atiTotal)).toBe(true)
      expect(near(r.ati.index, e.atiIndex)).toBe(true)
      expect(r.ati.category?.id).toBe(e.atiCat)
      expect(r.atiAspects.highest).toBe(e.atiHi)
      expect(r.atiAspects.lowest).toBe(e.atiLo)
      expect(r.complete).toBe(r.answered.hb === 15)
    })
  }
})

describe('scoreMhcu: worked examples (manual s.5/s.9, example report p.1)', () => {
  it('manual example: DI 38.46, WI 50, BHI 62.50, MHI 57.12 (band level 2)', () => {
    const cc = ccWith({ 1: 3, 3: 2, 4: 1, 6: 3, 9: 2, 14: 3, 15: 2, 16: 1, 18: 1, 19: 2 }) // domain maxima 3,2,1,3,2,0,0,3,2,1,1,2,0 = 20
    const hb = [2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, null, null, null] // mean of the 12 answered = 2.5
    const r = scoreMhcu(answersOf({ cc, wb: new Array<number>(14).fill(3), hb }))
    expect(r.domains.map((d) => d.score)).toEqual([3, 2, 1, 3, 2, 0, 0, 3, 2, 1, 1, 2, 0])
    expect(near(r.di, 38.4615, 0.001)).toBe(true)
    expect(r.wbTotal).toBe(42)
    expect(near(r.wi, 50, 1e-9)).toBe(true)
    expect(near(r.bhi, 62.5, 1e-9)).toBe(true)
    expect(near(r.mhi, 57.12, 0.01)).toBe(true)
    expect(r.mhiLevel).toBe(2)
    expect(r.mhiBand?.id).toBe('Dipantau')
    expect(r.mhiBand?.en).toBe('Monitoring')
  })

  it('example report: only Sleep Problems flagged -> Level 2 although the MHI band is Good', () => {
    const cc = ccWith({ 1: 1, 3: 1, 6: 1, 9: 1, 14: 2, 15: 1, 20: 1 })
    const wbByItem: Record<number, number> = { 1: 3, 3: 3, 14: 4, 2: 3, 5: 3, 6: 3, 7: 3, 8: 4, 10: 4, 11: 4, 13: 4, 4: 4, 9: 4, 12: 3 }
    const wb = Array.from({ length: 14 }, (_, i) => wbByItem[i + 1] ?? 3)
    const r = scoreMhcu(answersOf({ cc, wb, hb: new Array<number>(15).fill(3).fill(2, 14), ati: [3, 3, 2, 2, 2, 3] }))
    expect(r.domains.map((d) => d.score).join(',')).toBe('1,1,0,1,1,0,0,2,1,0,0,1,0')
    expect(near(r.di, 15.38, 0.01)).toBe(true)
    expect(r.wbTotal).toBe(49)
    expect(near(r.wi, 62.5)).toBe(true)
    expect(near(r.wiDims[0]?.score ?? null, 58.33, 0.01)).toBe(true)
    expect(near(r.wiDims[1]?.score ?? null, 62.5, 0.01)).toBe(true)
    expect(near(r.wiDims[2]?.score ?? null, 66.67, 0.01)).toBe(true)
    expect(r.flaggedDomains).toEqual(['Masalah Tidur'])
    expect(r.mhiLevel).toBe(1)
    expect(r.level).toBe(2)
    expect(r.status).toBe('Perlu Dipantau')
    expect(mhcuTriggersText(r, 'en')).toBe('1 domain(s) at or above threshold')
  })
})

describe('scoreMhcu: cutoff boundaries', () => {
  const good = { hb: new Array<number>(15).fill(4) }

  it('WEMWBS review levels: <=40 R3=3, 41-44 R3=2, >=45 none', () => {
    for (const [t, r3] of [[40, 3], [41, 2], [44, 2], [45, 0]] as const) {
      const r = scoreMhcu(answersOf({ wb: wbTotal(t), ...good }))
      expect(r.wbTotal).toBe(t)
      expect(r.redFlags.r3).toBe(r3)
    }
    const probable = scoreMhcu(answersOf({ wb: wbTotal(36), ...good }))
    expect(mhcuTriggersText(probable, 'id')).toContain('total well-being 36 (indikasi depresi probable)')
    const possible = scoreMhcu(answersOf({ wb: wbTotal(42), ...good }))
    expect(mhcuTriggersText(possible, 'en')).toContain('WEMWBS total 42 (41-44; Warwick benchmark: possible depression indication)')
  })

  it('MHI bands: 40 -> level 3, 55 -> level 2, 70 -> level 1, just under 40 -> level 4', () => {
    // DI 0 so MHI = 40 + 0.4 WI + 0.2 BHI
    const at = (t: number, h: number) => scoreMhcu(answersOf({ wb: wbTotal(t), hb: new Array<number>(15).fill(h) }))
    let r = at(14, 0)
    expect(r.mhi).toBeCloseTo(40, 9)
    expect(r.mhiLevel).toBe(3)
    r = at(35, 0)
    expect(r.mhi).toBeCloseTo(55, 9)
    expect(r.mhiLevel).toBe(2)
    r = at(56, 0)
    expect(r.mhi).toBeCloseTo(70, 9)
    expect(r.mhiLevel).toBe(1)
    r = scoreMhcu(answersOf({ cc: ccWith({ 1: 1 }), wb: wbTotal(14), hb: new Array<number>(15).fill(0) }))
    expect(r.mhi ?? 99).toBeLessThan(40)
    expect(r.mhiLevel).toBe(4)
    r = at(14, 0)
    expect(r.level).toBe(3)
    r = at(70, 4)
    expect(r.mhi ?? 0).toBeGreaterThan(99)
    expect(r.level).toBe(1)
  })

  it('R2: one flagged domain -> 2, three flagged -> 3, a domain scored 4 -> 3', () => {
    const wb = wbTotal(70)
    let r = scoreMhcu(answersOf({ cc: ccWith({ 1: 3 }), wb, ...good }))
    expect(r.level).toBe(2)
    expect(r.flaggedNonCritical).toBe(1)
    r = scoreMhcu(answersOf({ cc: ccWith({ 1: 2, 3: 2, 6: 2 }), wb, ...good }))
    expect(r.level).toBe(3)
    expect(r.flaggedNonCritical).toBe(3)
    r = scoreMhcu(answersOf({ cc: ccWith({ 1: 4 }), wb, ...good }))
    expect(r.level).toBe(3)
    expect(r.maxNonCritical).toBe(4)
    expect(r.triggers.map((t) => t.k)).toContain('severe')
  })

  it('DI of one domain at 4 is 4/52*100', () => {
    const r = scoreMhcu(answersOf({ cc: ccWith({ 1: 4 }), wb: wbTotal(70), ...good }))
    expect(r.di).toBeCloseTo((4 / 52) * 100, 9)
  })

  it('category edges: lower bound belongs to the higher category', () => {
    const wiOf = (t: number) => scoreMhcu(answersOf({ wb: wbTotal(t) })).wiCategory?.id
    expect(wiOf(40)).toBe('Sangat rendah')
    expect(wiOf(41)).toBe('Rendah')
    expect(wiOf(44)).toBe('Rendah')
    expect(wiOf(45)).toBe('Rata-rata')
    expect(wiOf(59)).toBe('Rata-rata')
    expect(wiOf(60)).toBe('Tinggi')
    const bhiOf = (v: number) => scoreMhcu(answersOf({ hb: new Array<number>(15).fill(v) })).bhiCategory?.id
    expect(bhiOf(0)).toBe('Sangat kurang')
    expect(bhiOf(1)).toBe('Kurang') // 25
    expect(bhiOf(2)).toBe('Cukup') // 50
    expect(bhiOf(3)).toBe('Baik') // 75
    const atiOf = (v: number) => scoreMhcu(answersOf({ ati: new Array<number>(6).fill(v) })).ati.category?.id
    expect(atiOf(0)).toBe('Rendah')
    expect(atiOf(2)).toBe('Sedang') // 50
    expect(atiOf(3)).toBe('Tinggi') // 75
    expect(atiOf(4)).toBe('Sangat tinggi') // 100
    // DI = (sum of the 13 domain maxima) / 52 * 100; first item of each domain carries the value
    const firstItems = [1, 3, 4, 6, 9, 11, 12, 14, 15, 16, 18, 19, 21]
    const diOf = (sum: number) => {
      const set: Record<number, number> = {}
      let left = sum
      for (const n of firstItems) {
        const v = Math.min(4, left)
        set[n] = v
        left -= v
      }
      return scoreMhcu(answersOf({ cc: ccWith(set) })).diCategory?.id
    }
    expect(diOf(0)).toBe('Minimal')
    expect(diOf(5)).toBe('Minimal') // 9.6
    expect(diOf(6)).toBe('Ringan') // 11.5
    expect(diOf(12)).toBe('Ringan') // 23.1
    expect(diOf(13)).toBe('Sedang') // 25 exactly
    expect(diOf(25)).toBe('Sedang') // 48.1
    expect(diOf(26)).toBe('Tinggi') // 50 exactly
  })
})

describe('scoreMhcu: critical items', () => {
  const ok = { wb: new Array<number>(14).fill(5), hb: new Array<number>(15).fill(4), ati: new Array<number>(6).fill(3) }

  it('CC11 >= 1 -> Level 5 Prioritas even when everything else is fine', () => {
    const r = scoreMhcu(answersOf({ cc: ccWith({ 11: 1 }), ...ok }))
    expect(r.level).toBe(5)
    expect(r.redFlags.r1).toBe(5)
    expect(r.status).toBe('Prioritas (item kritis)')
    expect(r.statusEn).toBe('Priority')
    expect(r.levelName).toEqual({ id: 'Prioritas', en: 'Priority' })
    expect(r.followUp.responseTimeEn).toBe('Same day')
    expect(mhcuTriggersText(r, 'id')).toBe('Pikiran menyakiti diri (CC11 = 1)')
    expect(r.triggers.map((t) => t.k)).toEqual(['cc11'])
    expect(r.reasons[0]?.en).toBe('Thoughts of hurting oneself (CC11 = 1)')
  })

  it('CC11 = 0 does not trigger R1', () => {
    expect(scoreMhcu(answersOf({ cc: ccWith({}), ...ok })).redFlags.r1).toBe(0)
  })

  it('CC12 or CC13 >= 1 -> Level 4', () => {
    for (const n of [12, 13]) {
      const r = scoreMhcu(answersOf({ cc: ccWith({ [n]: 1 }), ...ok }))
      expect(r.level).toBe(4)
      expect(r.redFlags.r1).toBe(4)
      expect(r.triggers.map((t) => t.k)).toContain('psy')
    }
  })

  it('CC11 wins over CC12/13', () => {
    const r = scoreMhcu(answersOf({ cc: ccWith({ 11: 2, 12: 3 }), ...ok }))
    expect(r.level).toBe(5)
    expect(r.triggers.map((t) => t.k)).toEqual(['cc11', 'psy'])
  })

  it('a missing critical item adds the confirm-directly trigger', () => {
    const cc: (number | null)[] = ccWith({})
    cc[10] = null // CC11
    const r = scoreMhcu(answersOf({ cc, ...ok }))
    expect(r.criticalMissing).toBe(true)
    expect(r.triggers[0]?.k).toBe('critmissing')
    expect(mhcuTriggersText(r, 'id')).toContain('ITEM KRITIS CC11-CC13 KOSONG')
    expect(r.triggers.map((t) => t.k)).not.toContain('none')
  })

  it('smoking only (CC22 = 1) flags Substance Use -> Level 2', () => {
    const r = scoreMhcu(answersOf({ cc: ccWith({ 22: 1 }), ...ok }))
    expect(r.flaggedDomains).toEqual(['Penggunaan Zat'])
    expect(r.level).toBe(2)
  })

  it('everything worst -> Level 5, DI 100', () => {
    const r = scoreMhcu(answersOf({ cc: new Array<number>(23).fill(4), wb: new Array<number>(14).fill(1), hb: new Array<number>(15).fill(0), ati: new Array<number>(6).fill(0) }))
    expect(r.level).toBe(5)
    expect(r.di).toBeCloseTo(100, 9)
    expect(r.wi).toBe(0)
    expect(r.bhi).toBe(0)
    expect(r.mhi).toBeCloseTo(0, 9)
  })

  it('all-zero symptoms and top well-being -> Level 1 Baik, no trigger', () => {
    const r = scoreMhcu(answersOf({ cc: ccWith({}), wb: new Array<number>(14).fill(5), hb: new Array<number>(15).fill(4), ati: new Array<number>(6).fill(4) }))
    expect(r.level).toBe(1)
    expect(r.status).toBe('Baik')
    expect(r.triggers).toEqual([{ k: 'none' }])
    expect(r.mhi).toBeCloseTo(100, 9)
    expect(r.complete).toBe(true)
    expect(r.completeness).toBe('Lengkap')
  })
})

describe('scoreMhcu: minimum items and proration', () => {
  it('Part A: 20 answers are enough for the DI, 19 are not', () => {
    const cc20 = ccWith({}).map((v, i) => (i < 20 ? 0 : null))
    expect(scoreMhcu(answersOf({ cc: cc20 })).di).not.toBeNull()
    const cc19 = ccWith({}).map((v, i) => (i < 19 ? 0 : null))
    const r = scoreMhcu(answersOf({ cc: cc19, wb: new Array<number>(14).fill(5) }))
    expect(r.di).toBeNull()
    expect(r.mhi).toBeNull()
    expect(r.incomplete).toBe(true)
    expect(r.status).toBe('DATA BELUM LENGKAP')
    expect(r.statusEn).toBe('INCOMPLETE DATA')
    expect(r.completeness).toBe('Cek: A 19/23, B 14/14, C 15/15, D 6/6')
    expect(r.complete).toBe(false)
  })

  it('Part B: 12 and 13 answers are prorated to a 14-item total, 11 give no WI', () => {
    const wb13 = new Array<number | null>(14).fill(4)
    wb13[2] = null
    expect(scoreMhcu(answersOf({ wb: wb13 })).wbTotal).toBe(56)
    const wb12 = new Array<number | null>(14).fill(4)
    wb12[2] = null
    wb12[8] = null
    const r12 = scoreMhcu(answersOf({ wb: wb12 }))
    expect(r12.wbTotal).toBe(56)
    expect(near(r12.wi, 75)).toBe(true)
    const wb11 = new Array<number | null>(14).fill(4)
    for (const i of [2, 8, 9]) wb11[i] = null
    const r11 = scoreMhcu(answersOf({ wb: wb11 }))
    expect(r11.wbTotal).toBeNull()
    expect(r11.wi).toBeNull()
    expect(r11.wiDims.every((d) => d.score === null)).toBe(true)
    expect(r11.redFlags.r3).toBe(0)
    expect(r11.incomplete).toBe(true)
  })

  it('Part C: 11 answers are enough for the BHI, 10 are not (unanswered items are excluded, not zero)', () => {
    const hb11 = [3, 3, 3, 3, null, null, null, null, 3, 3, 3, 3, 3, 3, 3]
    const r11 = scoreMhcu(answersOf({ hb: hb11 }))
    expect(r11.answered.hb).toBe(11)
    expect(near(r11.bhi, 75)).toBe(true)
    const hb10 = [3, 3, 3, 3, null, null, null, null, null, 3, 3, 3, 3, 3, 3]
    const r10 = scoreMhcu(answersOf({ hb: hb10 }))
    expect(r10.bhi).toBeNull()
    expect(r10.mhi).toBeNull()
    expect(r10.incomplete).toBe(true)
  })

  it('Part D: 5 answers are prorated as mean x 6, 4 answers give no ATI', () => {
    const r5 = scoreMhcu(answersOf({ ati: [2, 2, 2, 2, 2, null] }))
    expect(r5.ati.total).toBeCloseTo(12, 9)
    expect(r5.ati.index).toBeCloseTo(50, 9)
    const r4 = scoreMhcu(answersOf({ ati: [2, 2, 2, 2, null, null] }))
    expect(r4.ati.total).toBeNull()
    expect(r4.ati.index).toBeNull()
    expect(r4.atiAspects.highest).toBeNull()
  })

  it('incomplete data with a raised level keeps the level name in the status', () => {
    const cc = ccWith({ 11: 1 }).map((v, i) => (i === 0 ? null : v))
    const r = scoreMhcu(answersOf({ cc, hb: new Array<number | null>(15).fill(null) }))
    expect(r.level).toBe(5)
    expect(r.incomplete).toBe(true)
    expect(r.status).toBe('Prioritas (item kritis), data belum lengkap')
    expect(r.statusEn).toBe('Priority, incomplete data')
  })

  it('no answers at all: no crash, every index null, Level 1 with critical items missing', () => {
    const r = scoreMhcu({})
    expect(r.di).toBeNull()
    expect(r.wi).toBeNull()
    expect(r.bhi).toBeNull()
    expect(r.mhi).toBeNull()
    expect(r.ati.total).toBeNull()
    expect(r.level).toBe(1)
    expect(r.criticalMissing).toBe(true)
    expect(r.answered).toEqual({ cc: 0, wb: 0, hb: 0, ati: 0 })
    expect(r.domains.every((d) => d.score === null && !d.flagged)).toBe(true)
  })

  it('part C answers of 0 count as answered zeros', () => {
    const r = scoreMhcu(answersOf({ hb: new Array<number>(15).fill(0) }))
    expect(r.answered.hb).toBe(15)
    expect(r.bhi).toBe(0)
  })

  it('invalid values (out of range, fractions, strings, NaN) are treated as not answered', () => {
    const base = { ...answersOf() } as Record<string, unknown>
    base.CC01 = 5
    base.CC02 = 1.5
    base.WB01 = 0 // WEMWBS is 1-5
    base.HB01 = '3'
    base.ATI01 = Number.NaN
    const r = scoreMhcu(base as MhcuAnswers)
    expect(r.answered).toEqual({ cc: 21, wb: 13, hb: 14, ati: 5 })
  })
})

describe('scoreMhcu: purity', () => {
  it('does not mutate its input and returns equal results for equal input', () => {
    const input = answersOf({ cc: ccWith({ 1: 2, 14: 3 }) })
    const copy = JSON.stringify(input)
    const a = scoreMhcu(input)
    const b = scoreMhcu(input)
    expect(JSON.stringify(input)).toBe(copy)
    expect(a).toEqual(b)
  })

  it('ATI aspects: highest and lowest are the first of equal scores, all six listed', () => {
    const r = scoreMhcu(answersOf({ ati: [1, 4, 4, 0, 0, 2] }))
    expect(r.atiAspects.highest).toBe('Empathic Concern')
    expect(r.atiAspects.lowest).toBe('Cognitive Engagement')
    expect(r.atiAspects.items.length).toBe(6)
    expect(r.atiAspects.items[2]).toEqual({ n: 3, name: 'Mindful Awareness', score: 4 })
  })
})

/* ============================== VALIDATION ============================== */

function validBody(): Record<string, unknown> {
  const answers: Record<string, number> = {}
  const raw: Record<string, string> = {}
  for (const it of MHCU_ITEMS) {
    answers[it.code] = it.part === 'wb' ? 3 : 1
    raw[it.code] = String(answers[it.code])
  }
  return {
    lang: 'id',
    consent: 'research',
    consent_version: 'v1',
    ack: ['read', 'screen', 'limits', 'age', 'voluntary'],
    guardian: false,
    name: '  Nico Contoh ',
    sex: 'Perempuan',
    age: 27,
    phone: '0812-3456-7890',
    email: ' nico@example.com ',
    answers,
    raw,
    invite: 'tok_abc',
    website: '',
    duration_sec: 612,
  }
}

function errorOf(mutate: (b: Record<string, unknown>) => void): string {
  const b = validBody()
  mutate(b)
  const r = validateMhcuSubmission(b)
  if (r.ok) throw new Error('expected a validation error')
  return r.error
}

describe('validateMhcuSubmission', () => {
  it('accepts the form payload and normalises it', () => {
    const r = validateMhcuSubmission(validBody())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.lang).toBe('id')
    expect(r.value.consent).toBe('research')
    expect(r.value.name).toBe('Nico Contoh')
    expect(r.value.email).toBe('nico@example.com')
    expect(r.value.age).toBe(27)
    expect(r.value.guardian).toBe(false)
    expect(Object.keys(r.value.answers).length).toBe(58)
    expect(r.value.raw.CC01).toBe('1')
    expect(r.value.invite).toBe('tok_abc')
    expect(r.value.durationSec).toBe(612)
    expect(scoreMhcu(r.value.answers).complete).toBe(true)
  })

  it('rejects non-objects', () => {
    for (const bad of [null, undefined, 'x', 5, [], true]) expect(validateMhcuSubmission(bad).ok).toBe(false)
  })

  it('ignores unknown keys, including the honeypot', () => {
    const b: Record<string, unknown> = { ...validBody(), website: 'http://spam', extra: { a: 1 } }
    ;(b.answers as Record<string, unknown>).ZZ99 = 'junk'
    ;(b.answers as Record<string, unknown>).cc01 = 99 // wrong case is an unknown code
    const r = validateMhcuSubmission(b)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(Object.keys(r.value.answers).length).toBe(58)
      expect('ZZ99' in r.value.answers).toBe(false)
      expect('website' in r.value).toBe(false)
    }
  })

  it('lang, consent and consent_version', () => {
    expect(errorOf((b) => { b.lang = 'fr' })).toContain('lang')
    expect(errorOf((b) => { delete b.lang })).toContain('lang')
    expect(errorOf((b) => { b.consent = 'yes' })).toContain('consent')
    expect(errorOf((b) => { b.consent = true })).toContain('consent')
    expect(errorOf((b) => { b.consent_version = '' })).toContain('consent_version')
    expect(errorOf((b) => { b.consent_version = 'x'.repeat(41) })).toContain('consent_version')
    const nr = validBody()
    nr.consent = 'no_research'
    expect(validateMhcuSubmission(nr).ok).toBe(true)
  })

  it('ack must be a short array of short strings', () => {
    expect(errorOf((b) => { b.ack = 'read' })).toContain('ack')
    expect(errorOf((b) => { b.ack = Array.from({ length: 11 }, () => 'a') })).toContain('ack')
    expect(errorOf((b) => { b.ack = [1] })).toContain('ack')
    expect(errorOf((b) => { b.ack = ['x'.repeat(41)] })).toContain('ack')
  })

  it('name, sex, phone and email: type, length, shape', () => {
    expect(errorOf((b) => { b.name = '   ' })).toContain('name')
    expect(errorOf((b) => { b.name = 42 })).toContain('name')
    expect(errorOf((b) => { b.name = 'a'.repeat(121) })).toContain('name')
    expect(errorOf((b) => { b.name = 'bad\u0000name' })).toContain('name')
    expect(errorOf((b) => { b.sex = '' })).toContain('sex')
    expect(errorOf((b) => { b.sex = 'x'.repeat(81) })).toContain('sex')
    expect(errorOf((b) => { b.phone = '12345' })).toContain('phone')
    expect(errorOf((b) => { b.phone = '1'.repeat(16) })).toContain('phone')
    expect(errorOf((b) => { b.phone = 8123456789 })).toContain('phone')
    expect(errorOf((b) => { b.email = 'nico@example' })).toContain('email')
    expect(errorOf((b) => { b.email = 'no at sign.com' })).toContain('email')
    expect(errorOf((b) => { b.email = `${'a'.repeat(250)}@x.com` })).toContain('email')
  })

  it('age is a whole number 1-120 and drives the guardian flag', () => {
    expect(errorOf((b) => { b.age = 0 })).toContain('age')
    expect(errorOf((b) => { b.age = 121 })).toContain('age')
    expect(errorOf((b) => { b.age = 27.5 })).toContain('age')
    expect(errorOf((b) => { b.age = '27' })).toContain('age')
    expect(errorOf((b) => { b.age = Number.NaN })).toContain('age')
    for (const [age, guardian] of [[1, true], [17, true], [18, false], [120, false]] as const) {
      const b = validBody()
      b.age = age
      const r = validateMhcuSubmission(b)
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.value.guardian).toBe(guardian)
    }
    expect(errorOf((b) => { b.guardian = 'yes' })).toContain('guardian')
    const claimed = validBody()
    claimed.guardian = true
    const r = validateMhcuSubmission(claimed)
    if (r.ok) expect(r.value.guardian).toBe(true)
  })

  it('answers: object, known codes only, each in the range of its part', () => {
    expect(errorOf((b) => { b.answers = null })).toContain('answers')
    expect(errorOf((b) => { b.answers = [] })).toContain('answers')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).CC01 = 5 })).toContain('CC01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).CC01 = -1 })).toContain('CC01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).CC01 = '1' })).toContain('CC01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).CC01 = 1.5 })).toContain('CC01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).CC01 = null })).toContain('CC01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).WB01 = 0 })).toContain('WB01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).WB01 = 6 })).toContain('WB01')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).HB05 = 5 })).toContain('HB05')
    expect(errorOf((b) => { (b.answers as Record<string, unknown>).ATI06 = 9 })).toContain('ATI06')
    const edge = validBody()
    Object.assign(edge.answers as Record<string, number>, { CC01: 0, CC02: 4, WB01: 1, WB02: 5, HB01: 0, ATI01: 4 })
    expect(validateMhcuSubmission(edge).ok).toBe(true)
  })

  it('answers: required minimum per part (20 / 12 / 11 / 5)', () => {
    const drop = (prefix: string, keep: number) => (b: Record<string, unknown>) => {
      const a = b.answers as Record<string, number>
      const codes = Object.keys(a).filter((c) => c.startsWith(prefix))
      for (const c of codes.slice(keep)) delete a[c]
    }
    for (const [prefix, min] of [['CC', 20], ['WB', 12], ['HB', 11], ['ATI', 5]] as const) {
      const okBody = validBody()
      drop(prefix, min)(okBody)
      expect(validateMhcuSubmission(okBody).ok).toBe(true)
      expect(errorOf(drop(prefix, min - 1))).toContain(`part ${prefix} needs at least ${min}`)
    }
    expect(errorOf((b) => { b.answers = {} })).toContain('at least')
  })

  it('raw: optional, but known codes must hold short strings', () => {
    const none = validBody()
    delete none.raw
    const r = validateMhcuSubmission(none)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.raw).toEqual({})
    expect(errorOf((b) => { b.raw = 'x' })).toContain('raw')
    expect(errorOf((b) => { (b.raw as Record<string, unknown>).CC01 = 5 })).toContain('CC01')
    expect(errorOf((b) => { (b.raw as Record<string, unknown>).CC01 = 'x'.repeat(201) })).toContain('CC01')
  })

  it('invite and duration_sec', () => {
    const blank = validBody()
    blank.invite = ''
    blank.duration_sec = ''
    const r = validateMhcuSubmission(blank)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.invite).toBe('')
      expect(r.value.durationSec).toBeNull()
    }
    const absent = validBody()
    delete absent.invite
    delete absent.duration_sec
    expect(validateMhcuSubmission(absent).ok).toBe(true)
    expect(errorOf((b) => { b.invite = 'x'.repeat(129) })).toContain('invite')
    expect(errorOf((b) => { b.invite = 5 })).toContain('invite')
    expect(errorOf((b) => { b.duration_sec = -1 })).toContain('duration_sec')
    expect(errorOf((b) => { b.duration_sec = '60' })).toContain('duration_sec')
    expect(errorOf((b) => { b.duration_sec = Number.POSITIVE_INFINITY })).toContain('duration_sec')
  })
})

describe('consent values sent by the website form', () => {
  it("does not reject the form's 'full' or 'no_research', and rejects anything else", () => {
    const base = { lang: 'id', consent_version: 'v1', ack: [], guardian: false, name: 'A', sex: 'x', age: 30, phone: '0812', email: 'a@b.co', answers: {}, raw: {}, invite: '', duration_sec: '' }
    const problem = (consent: string) => {
      const result = validateMhcuSubmission({ ...base, consent })
      return result.ok ? '' : result.error
    }
    // (these bodies have no answers, so they fail later for that reason, never for the consent value)
    expect(problem('full')).not.toMatch(/consent must be/)
    expect(problem('no_research')).not.toMatch(/consent must be/)
    expect(problem('maybe')).toMatch(/consent must be/)
  })
})
