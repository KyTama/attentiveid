import { describe, expect, it } from 'bun:test'
import {
  MHCU_ANSWER_RANGE,
  MHCU_CATEGORIES,
  MHCU_ITEMS,
  mhcuCode,
  scoreMhcu,
  validateMhcuSubmission,
  type MhcuAnswers,
  type MhcuPart,
} from './mhcu'

/* Property and boundary tests with a seeded random generator (deterministic). */

let seed = 20261121
const rnd = (): number => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const ri = (a: number, b: number): number => a + Math.floor(rnd() * (b - a + 1))

type Full = Record<string, number>

function randomFull(): Full {
  const out: Full = {}
  const bias = ri(0, 3)
  for (const it of MHCU_ITEMS) {
    const { min, max } = MHCU_ANSWER_RANGE[it.part]
    out[it.code] = bias === 0 ? ri(min, max) : bias === 1 ? (rnd() < 0.7 ? min : ri(min, max)) : bias === 2 ? (rnd() < 0.7 ? max : ri(min, max)) : ri(min, Math.min(max, min + 2))
  }
  return out
}

/** A strictly "worse or equal" copy: higher symptoms (CC), lower well-being (WB) and healthy behaviour (HB). ATI is left alone. */
function worsen(a: Full): Full {
  const out: Full = { ...a }
  for (const it of MHCU_ITEMS) {
    if (rnd() > 0.35) continue
    const { min, max } = MHCU_ANSWER_RANGE[it.part]
    const v = out[it.code] as number
    if (it.part === 'cc') out[it.code] = Math.min(max, v + ri(0, 2))
    else if (it.part === 'wb' || it.part === 'hb') out[it.code] = Math.max(min, v - ri(0, 2))
  }
  return out
}

describe('MHCU properties', () => {
  it('worse answers never raise the MHI, never lower the DI, never raise WI/BHI/WEMWBS (500 random pairs)', () => {
    for (let t = 0; t < 500; t++) {
      const a = randomFull()
      const b = worsen(a)
      const ra = scoreMhcu(a)
      const rb = scoreMhcu(b)
      expect((rb.mhi as number) <= (ra.mhi as number) + 1e-9).toBe(true)
      expect((rb.di as number) >= (ra.di as number) - 1e-9).toBe(true)
      expect((rb.wi as number) <= (ra.wi as number) + 1e-9).toBe(true)
      expect((rb.bhi as number) <= (ra.bhi as number) + 1e-9).toBe(true)
      expect((rb.wbTotal as number) <= (ra.wbTotal as number)).toBe(true)
    }
  })

  it('worse answers never lower the final level, nor any of R1/R2/R3 (500 random pairs)', () => {
    for (let t = 0; t < 500; t++) {
      const a = randomFull()
      const b = worsen(a)
      const ra = scoreMhcu(a)
      const rb = scoreMhcu(b)
      expect(rb.level).toBeGreaterThanOrEqual(ra.level)
      expect(rb.redFlags.r1).toBeGreaterThanOrEqual(ra.redFlags.r1)
      expect(rb.redFlags.r2).toBeGreaterThanOrEqual(ra.redFlags.r2)
      expect(rb.redFlags.r3).toBeGreaterThanOrEqual(ra.redFlags.r3)
    }
  })

  it('the final level is exactly max(MHI band level, R1, R2, R3, 1) and stays within 1-5', () => {
    for (let t = 0; t < 500; t++) {
      const r = scoreMhcu(randomFull())
      expect(r.level).toBe(Math.max(r.mhiLevel ?? 0, r.redFlags.r1, r.redFlags.r2, r.redFlags.r3, 1) as 1 | 2 | 3 | 4 | 5)
      expect(r.level).toBeGreaterThanOrEqual(1)
      expect(r.level).toBeLessThanOrEqual(5)
    }
  })

  it('all indices stay inside their ranges: DI/WI/BHI/ATI/MHI 0-100, WEMWBS 14-70', () => {
    for (let t = 0; t < 500; t++) {
      const r = scoreMhcu(randomFull())
      for (const v of [r.di, r.wi, r.bhi, r.mhi, r.ati.index]) {
        expect(v).not.toBeNull()
        expect(v as number).toBeGreaterThanOrEqual(-1e-9)
        expect(v as number).toBeLessThanOrEqual(100 + 1e-9)
      }
      expect(r.wbTotal as number).toBeGreaterThanOrEqual(14)
      expect(r.wbTotal as number).toBeLessThanOrEqual(70)
    }
  })

  it('R1: CC11 >= 1 always gives level 5; CC12/CC13 >= 1 gives at least level 4 (200 random sessions)', () => {
    for (let t = 0; t < 200; t++) {
      const a = randomFull()
      a.CC11 = ri(1, 4)
      expect(scoreMhcu(a).level).toBe(5)
      const b = randomFull()
      b.CC11 = 0
      b[rnd() < 0.5 ? 'CC12' : 'CC13'] = ri(1, 4)
      expect(scoreMhcu(b).level).toBeGreaterThanOrEqual(4)
      expect(scoreMhcu(b).redFlags.r1).toBe(4)
    }
  })

  it('removing answers never throws and yields null indices below the minimum, not zeros (300 random drops)', () => {
    const minimum: Record<MhcuPart, number> = { cc: 20, wb: 12, hb: 11, ati: 5 }
    const size: Record<MhcuPart, number> = { cc: 23, wb: 14, hb: 15, ati: 6 }
    for (let t = 0; t < 300; t++) {
      const a = randomFull()
      const keep: Record<MhcuPart, number> = { cc: ri(0, 23), wb: ri(0, 14), hb: ri(0, 15), ati: ri(0, 6) }
      const part = (c: string): MhcuPart => MHCU_ITEMS.find((i) => i.code === c)?.part as MhcuPart
      const dropped: Record<MhcuPart, number> = { cc: 0, wb: 0, hb: 0, ati: 0 }
      const partial: MhcuAnswers = Object.fromEntries(
        Object.entries(a).filter(([code]) => {
          const p = part(code)
          if (dropped[p] >= size[p] - keep[p]) return true
          dropped[p]++
          return false
        }),
      )
      const r = scoreMhcu(partial)
      expect(r.answered).toEqual(keep)
      expect(r.di === null).toBe(keep.cc < minimum.cc)
      expect(r.wi === null).toBe(keep.wb < minimum.wb)
      expect(r.bhi === null).toBe(keep.hb < minimum.hb)
      expect(r.ati.total === null).toBe(keep.ati < minimum.ati)
      expect(r.mhi === null).toBe(r.di === null || r.wi === null || r.bhi === null)
      expect(r.incomplete).toBe(r.mhi === null)
      expect(r.complete).toBe(keep.cc === 23 && keep.wb === 14 && keep.hb === 15 && keep.ati === 6)
    }
  })

  it('an unanswered Part C item is left out, not counted as 0 (BHI of the rest is unchanged)', () => {
    const a = randomFull()
    for (let n = 1; n <= 15; n++) a[mhcuCode('hb', n)] = n <= 11 ? 3 : 0
    const dropped = { ...a }
    for (let n = 12; n <= 15; n++) delete dropped[mhcuCode('hb', n)]
    expect(scoreMhcu(a).bhi as number).toBeLessThan(scoreMhcu(dropped).bhi as number)
    expect(scoreMhcu(dropped).bhi as number).toBeCloseTo(75, 9)
  })
})

describe('MHCU Part B is 1-5', () => {
  const base = (): Full => {
    const a: Full = {}
    for (const it of MHCU_ITEMS) a[it.code] = it.part === 'wb' ? 3 : 1
    return a
  }

  it('WB answers of 0 and 6 are not scored (treated as unanswered); 1 and 5 are', () => {
    for (const bad of [0, 6, -1, 2.5]) {
      const a = base()
      a.WB01 = bad
      expect(scoreMhcu(a).answered.wb).toBe(13)
    }
    for (const good of [1, 5]) {
      const a = base()
      a.WB01 = good
      expect(scoreMhcu(a).answered.wb).toBe(14)
    }
  })

  it('WEMWBS total spans 14 (all 1) to 70 (all 5)', () => {
    const lo = base()
    const hi = base()
    for (let n = 1; n <= 14; n++) {
      lo[mhcuCode('wb', n)] = 1
      hi[mhcuCode('wb', n)] = 5
    }
    expect(scoreMhcu(lo).wbTotal).toBe(14)
    expect(scoreMhcu(lo).wi).toBe(0)
    expect(scoreMhcu(hi).wbTotal).toBe(70)
    expect(scoreMhcu(hi).wi).toBe(100)
  })

  it('validation rejects WB 0 and 6, and accepts 0 for the other parts', () => {
    const body = (patch: Record<string, number>) => {
      const answers: Record<string, number> = { ...base(), ...patch }
      return {
        lang: 'id', consent: 'research', consent_version: 'v1', ack: ['read'], name: 'Nico', sex: 'Laki-laki', age: 30,
        phone: '081234567890', email: 'a@b.co', answers,
      }
    }
    expect(validateMhcuSubmission(body({ WB05: 0 })).ok).toBe(false)
    expect(validateMhcuSubmission(body({ WB05: 6 })).ok).toBe(false)
    expect(validateMhcuSubmission(body({ WB05: 1, CC01: 0, HB01: 0, ATI01: 0 })).ok).toBe(true)
  })
})

describe('MHCU category edges', () => {
  it('lower bounds are strictly increasing and start at 0 for every index', () => {
    for (const kind of ['di', 'wi', 'bhi', 'ati'] as const) {
      const { lo, id, en } = MHCU_CATEGORIES[kind]
      expect(lo[0]).toBe(0)
      expect(id.length).toBe(lo.length)
      expect(en.length).toBe(lo.length)
      for (let i = 1; i < lo.length; i++) expect((lo[i] as number) > (lo[i - 1] as number)).toBe(true)
    }
  })

  it('every reachable BHI / ATI value lands in the category of the highest bound it reaches', () => {
    // BHI = mean/4*100 with 15 items: every sum 0..60 gives value sum/60*100
    for (let sum = 0; sum <= 60; sum++) {
      const a: Full = {}
      for (const it of MHCU_ITEMS) a[it.code] = it.part === 'wb' ? 3 : 0
      let left = sum
      for (let n = 1; n <= 15; n++) {
        const v = Math.min(4, left)
        a[mhcuCode('hb', n)] = v
        left -= v
      }
      const value = (sum / 60) * 100
      const lo = MHCU_CATEGORIES.bhi.lo
      const expected = lo.filter((x) => value >= x).length - 1
      expect(scoreMhcu(a).bhiCategory?.index).toBe(expected)
    }
    // ATI total 0..24 -> index total/24*100
    for (let sum = 0; sum <= 24; sum++) {
      const a: Full = {}
      for (const it of MHCU_ITEMS) a[it.code] = it.part === 'wb' ? 3 : 0
      let left = sum
      for (let n = 1; n <= 6; n++) {
        const v = Math.min(4, left)
        a[mhcuCode('ati', n)] = v
        left -= v
      }
      const value = (sum / 24) * 100
      const expected = MHCU_CATEGORIES.ati.lo.filter((x) => value >= x).length - 1
      expect(scoreMhcu(a).ati.category?.index).toBe(expected)
    }
  })

  it('every reachable WEMWBS total 14-70 maps to the Warwick bands 14-40 / 41-44 / 45-59 / 60-70', () => {
    for (let total = 14; total <= 70; total++) {
      const a: Full = {}
      for (const it of MHCU_ITEMS) a[it.code] = it.part === 'wb' ? 1 : 0
      let left = total - 14
      for (let n = 1; n <= 14; n++) {
        const v = Math.min(4, left)
        a[mhcuCode('wb', n)] = 1 + v
        left -= v
      }
      const r = scoreMhcu(a)
      expect(r.wbTotal).toBe(total)
      const expected = total <= 40 ? 0 : total <= 44 ? 1 : total <= 59 ? 2 : 3
      expect(r.wiCategory?.index).toBe(expected)
    }
  })
})
