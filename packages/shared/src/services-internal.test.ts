import { describe, expect, it } from 'bun:test'
import { buildInternalLedgerCsv, computeServiceMargin, sanitizeCsvCell } from './services-internal'

describe('services-internal helpers', () => {
  it('computes gross margin and percentage faithfully', () => {
    expect(computeServiceMargin(1_500_000, 500_000, 100_000)).toEqual({
      gross: 900_000,
      pct: 60,
    })
    expect(computeServiceMargin(0, 500_000, 0)).toBeNull()
    expect(computeServiceMargin(1_500_000, null, 0)).toBeNull()
  })

  it('neutralizes CSV spreadsheet formula injection payloads', () => {
    expect(sanitizeCsvCell('=CMD("calc")')).toBe('"\'=CMD(""calc"")"')
    expect(sanitizeCsvCell(' +SUM(A1:A2)')).toBe("' +SUM(A1:A2)")
    expect(sanitizeCsvCell('@evil')).toBe("'@evil")
    expect(sanitizeCsvCell('Safe, Name')).toBe('"Safe, Name"')
  })

  it('builds UTF-8 BOM CSV output for ledger rows', () => {
    const csv = buildInternalLedgerCsv([
      {
        key: 'k1',
        serviceId: 's1',
        serviceSlug: 'tes-iq',
        serviceName: 'Tes IQ',
        categoryName: 'Asesmen',
        serviceStatus: 'published',
        visibility: 'public',
        variantId: 'v1',
        variantSlug: 'v-iq',
        variantName: '=cmd',
        variantStatus: 'published',
        unitLabel: 'per tes',
        psychologistId: null,
        psychologistSlug: null,
        psychologistName: 'Tim',
        berlakuPrice: 2_500_000,
        berlakuPriceMax: null,
        priceSource: 'service_public_prices',
        feeAmount: 500_000,
        directCostAmount: 50_000,
        margin: { gross: 1_950_000, pct: 78 },
        promoAmount: null,
        promoProgramName: null,
        promoMargin: null,
        usulanAmounts: [2_400_000],
        historisCount: 2,
      },
    ])
    expect(csv.startsWith('\uFEFFProduk,Slug')).toBe(true)
    expect(csv).toContain("'=cmd")
    expect(csv).toContain('1950000')
    expect(csv).toContain('78.0')
  })
})
