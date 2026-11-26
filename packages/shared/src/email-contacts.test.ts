import { describe, expect, test } from 'bun:test'
import { normalizeContactEmail, normalizeContactPhone, suggestNameFromEmail, validateCategoryName, validateContact } from './email-contacts'

describe('email contact rules', () => {
  test('an address is lower-cased and trimmed', () => {
    expect(normalizeContactEmail('  Budi.Santoso@Example.TEST ')).toBe('budi.santoso@example.test')
  })

  test('anything that could carry a second address or a header is refused', () => {
    for (const bad of ['a@b.test, c@d.test', 'Budi <a@b.test>', 'a@b.test\nBcc: x@y.test', 'a@b', 'a b@c.test', '', 'a@b.test;c@d.test']) {
      expect(normalizeContactEmail(bad)).toBeNull()
    }
  })

  test('the three ways of writing an Indonesian number are one number', () => {
    for (const phone of ['0812-3456-7890', '+62 812 3456 7890', '6281234567890', '81234567890']) {
      expect(normalizeContactPhone(phone)).toBe('081234567890')
    }
    expect(normalizeContactPhone('123')).toBe('')
  })

  test('a contact needs only an address; categories are made unique', () => {
    expect(validateContact({ email: 'a@example.test', categoryIds: ['1', '1'] })).toEqual({
      ok: true,
      value: { email: 'a@example.test', name: '', phone: '', categoryIds: ['1'] },
    })
  })

  test('errors name the field', () => {
    const result = validateContact({ email: 'nope', name: 'x'.repeat(121), phone: 'call me' })
    expect(result).toEqual({ ok: false, errors: { email: 'invalid', name: 'too_long', phone: 'invalid' } })
    expect(validateContact({})).toEqual({ ok: false, errors: { email: 'required' } })
  })

  test('line breaks in a name become spaces', () => {
    const result = validateContact({ email: 'a@example.test', name: 'Budi\r\n  Santoso' })
    expect(result.ok && result.value.name).toBe('Budi Santoso')
  })

  test('a name is suggested only when the address clearly spells one', () => {
    expect(suggestNameFromEmail('budi.santoso@example.test')).toBe('Budi Santoso')
    for (const address of ['info@example.test', 'budi99.x@example.test', 'a.b@example.test']) expect(suggestNameFromEmail(address)).toBe('')
  })

  test('category names', () => {
    expect(validateCategoryName('  Mitra  Sekolah ')).toBe('Mitra Sekolah')
    expect(validateCategoryName('a;b')).toBeNull()
    expect(validateCategoryName(' ')).toBeNull()
    expect(validateCategoryName('x'.repeat(41))).toBeNull()
  })
})
