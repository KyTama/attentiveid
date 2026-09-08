import { describe, expect, it } from 'vitest'
import {
  createPsychologistListSearchParams,
  getPsychologistBySlug,
  listPsychologists,
  listRelatedPsychologists,
  parsePsychologistListQuery,
} from '../src/features/psychologists'
import { psychologists } from '../src/data/psychologists'

describe('psychologist service', () => {
  it('normalizes case and whitespace when searching names', async () => {
    const result = await listPsychologists({ search: '  SYAZKA   KIRANI  ' })

    expect(result.status).toBe('success')
    expect(result.psychologists.map((psychologist) => psychologist.slug)).toEqual(['syazka'])
  })

  it('searches specialization text', async () => {
    const result = await listPsychologists({ search: 'brainspotting' })

    expect(result.status).toBe('success')
    expect(result.psychologists.map((psychologist) => psychologist.slug)).toContain('gita')
  })

  it('combines support area and experience filters', async () => {
    const result = await listPsychologists({
      supportArea: 'childAdolescent',
      experienceLevel: 'seniorLevel',
    })

    expect(result.status).toBe('success')
    expect(result.psychologists.map((psychologist) => psychologist.slug)).toEqual(['anggun'])
  })

  it('returns an explicit empty result', async () => {
    const result = await listPsychologists({
      search: 'a specialization that does not exist',
      supportArea: 'educational',
    })

    expect(result).toEqual({ status: 'empty', psychologists: [] })
  })

  it('keeps practice licenses available in list summaries', async () => {
    const result = await listPsychologists()

    expect(result.status).toBe('success')
    if (result.status === 'success') {
      expect(result.psychologists).toHaveLength(psychologists.length)
      expect(result.psychologists.find((psychologist) => psychologist.slug === 'syazka')?.licenseNumber)
        .toBe('20190974-2021-02-1552')
    }
  })

  it('ignores invalid URL filters and writes canonical query parameters', () => {
    const parsed = parsePsychologistListQuery(new URLSearchParams('q=%20syazka%20&support=unknown&experience=midLevel'))

    expect(parsed).toEqual({
      search: 'syazka',
      supportArea: 'all',
      experienceLevel: 'midLevel',
    })
    expect(createPsychologistListSearchParams(parsed).toString()).toBe('q=syazka&experience=midLevel')
  })

  it('returns a mapped profile for a valid slug', async () => {
    const result = await getPsychologistBySlug('SYAZKA')

    expect(result.status).toBe('found')
    if (result.status === 'found') {
      expect(result.psychologist.slug).toBe('syazka')
      expect(result.psychologist.experienceYears).toBe(6)
      expect(result.psychologist.licenseNumber).toBeTruthy()
    }
  })

  it('returns an explicit not-found result for an unknown slug', async () => {
    await expect(getPsychologistBySlug('unknown-person')).resolves.toEqual({ status: 'not-found' })
  })

  it('prioritizes related psychologists from the same support area', async () => {
    const related = await listRelatedPsychologists('syazka', 2)

    expect(related).toHaveLength(2)
    expect(related.every((psychologist) => psychologist.supportArea === 'adultClinical')).toBe(true)
    expect(related.every((psychologist) => psychologist.slug !== 'syazka')).toBe(true)
  })
})
