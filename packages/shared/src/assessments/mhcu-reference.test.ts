import { describe, expect, it } from 'bun:test'
import { MHCU_REFERENCE, MHCU_REFERENCE_COUNTS, mhcuDomainMetric, percentile, type MhcuReferenceMetric } from './mhcu-reference'

/* Anchors = the percentiles printed in the demo's psychologist reports (p1: Larasati P00007 T1, p5: Nadia P00001 T5,
   p4r: Rizky P00005 T4), 24 rows each: [metric, score printed in the report, printed percentile, report]. */
const ANCHORS: [MhcuReferenceMetric, number, number, string][] = [
  ['mhi', 77.46, 93, 'p1'],
  ['di', 17.31, 7, 'p1'],
  ['domain1', 1, 8, 'p1'],
  ['domain2', 1, 19, 'p1'],
  ['domain3', 1, 17, 'p1'],
  ['domain4', 1, 7, 'p1'],
  ['domain5', 1, 27, 'p1'],
  ['domain6', 0, 27, 'p1'],
  ['domain7', 0, 29, 'p1'],
  ['domain8', 0, 8, 'p1'],
  ['domain9', 1, 42, 'p1'],
  ['domain10', 1, 30, 'p1'],
  ['domain11', 1, 47, 'p1'],
  ['domain12', 0, 6, 'p1'],
  ['domain13', 1, 61, 'p1'],
  ['wi', 76.79, 94, 'p1'],
  ['wiPA', 91.67, 97, 'p1'],
  ['wiPF', 75, 91, 'p1'],
  ['wiPR', 66.67, 79, 'p1'],
  ['bhi', 68.33, 78, 'p1'],
  ['bhiSC', 67.86, 68, 'p1'],
  ['bhiSO', 60, 75, 'p1'],
  ['bhiMA', 83.33, 81, 'p1'],
  ['ati', 83.33, 80, 'p1'],
  ['mhi', 76.08, 93, 'p5'],
  ['di', 17.31, 7, 'p5'],
  ['domain1', 1, 8, 'p5'],
  ['domain2', 0, 2, 'p5'],
  ['domain3', 0, 5, 'p5'],
  ['domain4', 2, 20, 'p5'],
  ['domain5', 1, 27, 'p5'],
  ['domain6', 0, 27, 'p5'],
  ['domain7', 0, 29, 'p5'],
  ['domain8', 1, 24, 'p5'],
  ['domain9', 0, 15, 'p5'],
  ['domain10', 1, 30, 'p5'],
  ['domain11', 1, 47, 'p5'],
  ['domain12', 2, 30, 'p5'],
  ['domain13', 0, 29, 'p5'],
  ['wi', 75, 93, 'p5'],
  ['wiPA', 75, 91, 'p5'],
  ['wiPF', 71.88, 89, 'p5'],
  ['wiPR', 83.33, 94, 'p5'],
  ['bhi', 65, 72, 'p5'],
  ['bhiSC', 71.43, 71, 'p5'],
  ['bhiSO', 55, 71, 'p5'],
  ['bhiMA', 66.67, 52, 'p5'],
  ['ati', 66.67, 47, 'p5'],
  ['mhi', 56.54, 72, 'p4r'],
  ['di', 32.69, 20, 'p4r'],
  ['domain1', 1, 8, 'p4r'],
  ['domain2', 1, 19, 'p4r'],
  ['domain3', 2, 39, 'p4r'],
  ['domain4', 2, 20, 'p4r'],
  ['domain5', 2, 45, 'p4r'],
  ['domain6', 0, 27, 'p4r'],
  ['domain7', 0, 29, 'p4r'],
  ['domain8', 1, 24, 'p4r'],
  ['domain9', 1, 42, 'p4r'],
  ['domain10', 2, 44, 'p4r'],
  ['domain11', 2, 63, 'p4r'],
  ['domain12', 2, 30, 'p4r'],
  ['domain13', 1, 61, 'p4r'],
  ['wi', 48.21, 56, 'p4r'],
  ['wiPA', 58.33, 74, 'p4r'],
  ['wiPF', 40.63, 39, 'p4r'],
  ['wiPR', 58.33, 67, 'p4r'],
  ['bhi', 51.67, 43, 'p4r'],
  ['bhiSC', 60.71, 57, 'p4r'],
  ['bhiSO', 35, 39, 'p4r'],
  ['bhiMA', 58.33, 34, 'p4r'],
  ['ati', 66.67, 47, 'p4r'],
]

const CORE = (m: string) => !['mhi', 'bhi', 'bhiSC', 'bhiSO', 'bhiMA'].includes(m)
const diff = (a: (typeof ANCHORS)[number]): number => (percentile(a[0], a[1]) as number) - a[2]

describe('MHCU reference sample', () => {
  it('has the documented size: every metric holds all 87 check-ups', () => {
    expect(MHCU_REFERENCE).toEqual({ n: 87, from: '2026-11-05', to: '2026-11-20' })
    expect(Object.keys(MHCU_REFERENCE_COUNTS).length).toBe(24)
    for (const m of Object.keys(MHCU_REFERENCE_COUNTS) as MhcuReferenceMetric[]) expect(MHCU_REFERENCE_COUNTS[m]).toBe(87)
  })

  it('values are inside the scales: indices 0-100, domains whole numbers 0-4', () => {
    // 0 and 100 are probed through the function: nothing is below 0 and nothing is above 100
    for (const m of Object.keys(MHCU_REFERENCE_COUNTS) as MhcuReferenceMetric[]) {
      const isDomain = m.startsWith('domain')
      expect(percentile(m, isDomain ? 5 : 101)).toBe(100)
      expect(percentile(m, -1)).toBe(0)
    }
    for (let d = 1; d <= 13; d++) {
      for (const v of [0, 1, 2, 3, 4]) expect(percentile(mhcuDomainMetric(d), v)).not.toBeNull()
    }
  })
})

describe('percentile()', () => {
  it('is monotone non-decreasing in the score for every metric', () => {
    for (const m of Object.keys(MHCU_REFERENCE_COUNTS) as MhcuReferenceMetric[]) {
      const isDomain = m.startsWith('domain')
      const grid = isDomain ? [0, 0.5, 1, 1.5, 2, 3, 4] : Array.from({ length: 201 }, (_, i) => i / 2)
      let prev = -1
      for (const v of grid) {
        const p = percentile(m, v) as number
        expect(p).toBeGreaterThanOrEqual(prev)
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(100)
        prev = p
      }
    }
  })

  it('uses the mid-rank of ties: tied zeros sit in the middle of their block', () => {
    // Suicidal thoughts (domain 6): 47 of 87 answered 0 -> (0 + 47/2) / 87 = 27.0 -> P27 (printed in the demo)
    expect(percentile('domain6', 0)).toBe(27)
    // Psychosis (domain 7): 52 zeros -> 29.9 -> P30 (the demo prints P29, see the discrepancy test)
    expect(percentile('domain7', 0)).toBe(30)
  })

  it('returns null for missing or non-finite scores', () => {
    expect(percentile('mhi', null)).toBeNull()
    expect(percentile('mhi', undefined)).toBeNull()
    expect(percentile('di', Number.NaN)).toBeNull()
    expect(percentile('di', Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('maps a domain number to its metric key', () => {
    expect(mhcuDomainMetric(1)).toBe('domain1')
    expect(mhcuDomainMetric(13)).toBe('domain13')
  })
})

describe('against the percentiles printed in the demo reports (72 anchors)', () => {
  it('has 72 anchors, 24 per report', () => {
    expect(ANCHORS.length).toBe(72)
    for (const doc of ['p1', 'p5', 'p4r']) expect(ANCHORS.filter((a) => a[3] === doc).length).toBe(24)
  })

  it('REGRESSION of the known fit: 42 of 72 exact; the 57 non-BHI/MHI anchors are within 2 points (36 exact), the 15 BHI/MHI ones within 3 (6 exact)', () => {
    const core = ANCHORS.filter((a) => CORE(a[0]))
    const rest = ANCHORS.filter((a) => !CORE(a[0]))
    expect(core.length).toBe(57)
    expect(rest.length).toBe(15)
    expect(core.filter((a) => diff(a) === 0).length).toBe(36)
    expect(Math.max(...core.map((a) => Math.abs(diff(a))))).toBe(2)
    expect(rest.filter((a) => diff(a) === 0).length).toBe(6)
    expect(Math.max(...rest.map((a) => Math.abs(diff(a))))).toBe(3)
    expect(ANCHORS.filter((a) => diff(a) === 0).length).toBe(42)
  })

  it('KNOWN DISCREPANCIES: the demo prints these numbers, the reference file does not give them (the sample of the demo differs slightly from this file)', () => {
    const off = ANCHORS.filter((a) => diff(a) !== 0).map((a) => `${a[3]} ${a[0]}=${a[1]} want P${a[2]} got P${percentile(a[0], a[1])}`)
    expect(off.filter((x) => /(mhi|bhi)/.test(x)).length).toBe(9)
    expect(off.length).toBe(30)
  })

  it('the three MHI anchors: 77.46 -> P93, 76.08 -> P93 are reproduced, 56.54 differs by one point (P71 vs the printed P72)', () => {
    expect(percentile('mhi', 77.46)).toBe(93)
    expect(percentile('mhi', 76.08)).toBe(93)
    expect(percentile('mhi', 56.54)).toBe(71)
  })
})
