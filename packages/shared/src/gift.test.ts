import { describe, expect, it } from 'bun:test'
import {
  DEFAULT_GIFT,
  DEFAULT_GIFT_MESSAGE_EN,
  fallbackPrayerFor,
  giftAllowedOn,
  giftPageFor,
  mergeSiteSettings,
  renderGiftMessage,
  validateGift,
  validatePrayerInput,
} from './index'

describe('gift settings', () => {
  it('is on for the home page only by default, and never on forms or the prayer page', () => {
    const { gift } = mergeSiteSettings(null)
    expect(gift).toEqual(DEFAULT_GIFT)
    expect(giftAllowedOn(gift, '/')).toBe(true)
    for (const path of ['/articles', '/psychologists/syazka', '/our-services', '/free-session', '/booking', '/let-there-be-light', '/dashboard']) {
      expect(giftAllowedOn(gift, path)).toBe(false)
    }
  })

  it('lets the admin pick pages, but forms and the prayer page can never be turned on', () => {
    const saved = validateGift({ pages: { '/articles': true, '/': false, '/free-session': true, '/let-there-be-light': true } })
    expect(saved.ok).toBe(true)
    if (!saved.ok) return
    expect(giftAllowedOn(saved.value, '/articles/x')).toBe(true)
    expect(giftAllowedOn(saved.value, '/')).toBe(false)
    expect(giftAllowedOn(saved.value, '/free-session')).toBe(false)
    expect(giftAllowedOn(saved.value, '/let-there-be-light')).toBe(false)
    expect(giftPageFor('/Articles/')).toBe('/articles')
    expect(giftAllowedOn({ ...saved.value, enabled: false }, '/articles')).toBe(false)
  })

  it('needs [Prayer] in the letter, and keeps the choices it understands', () => {
    expect(validateGift({ messageId: 'Halo', messageEn: 'Hello [Prayer]' }).ok).toBe(false)
    const ok = validateGift({ frequency: 'always', moderation: 'manual', showName: false, messageId: 'Halo\n[Prayer]', messageEn: 'Hi\n[Prayer]', giftImageUrl: '/media/x.webp' })
    expect(ok.ok && ok.value.frequency).toBe('always')
    expect(ok.ok && ok.value.moderation).toBe('manual')
    expect(ok.ok && ok.value.showName).toBe(false)
    expect(validateGift({ frequency: 'weird', giftImageUrl: 'javascript:alert(1)' }).ok).toBe(false)
    const fallback = validateGift({ frequency: 'weird' })
    expect(fallback.ok && fallback.value.frequency).toBe('session')
  })

  it('puts the prayer in the letter, with the name and city only when allowed', () => {
    const prayer = { text: 'Be well.', name: 'Sari', city: 'Malang' }
    const both = renderGiftMessage(DEFAULT_GIFT_MESSAGE_EN, prayer, { showName: true, showCity: true })
    expect(both).toContain('Hi there!')
    expect(both).toContain('Be well.\n— Sari, Malang')
    expect(both).not.toContain('[Prayer]')
    expect(renderGiftMessage('[Prayer]', prayer, { showName: false, showCity: true })).toBe('Be well.\n— Malang')
    expect(renderGiftMessage('[Prayer]', prayer, { showName: false, showCity: false })).toBe('Be well.')
    expect(renderGiftMessage('[Prayer]', { text: 'Be well.' }, { showName: true, showCity: true })).toBe('Be well.')
  })
})

describe('prayer input', () => {
  it('accepts a prayer with an optional name and city', () => {
    const result = validatePrayerInput({ name: '  Sari ', city: 'Malang', prayer: 'Semoga harimu tenang   dan indah.' })
    expect(result).toEqual({ ok: true, value: { name: 'Sari', city: 'Malang', prayer: 'Semoga harimu tenang dan indah.' } })
    expect(validatePrayerInput({ prayer: 'Semoga kamu baik-baik saja' }).ok).toBe(true)
  })

  it('rejects empty, too long, and contact-like text', () => {
    expect(validatePrayerInput({ prayer: 'pendek' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'x'.repeat(401) }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Kunjungi https://spam.example sekarang' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Hubungi saya di 0812-3456-7890 ya' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Kirim ke saya@example.com ya sayang' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Semoga harimu tenang dan indah', name: 'a'.repeat(61) }).ok).toBe(false)
    const bad = validatePrayerInput({ prayer: 'pendek', city: 'www.spam.com' })
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(Object.keys(bad.errors).sort()).toEqual(['city', 'prayer'])
  })

  it('always has a prayer to show', () => {
    expect(fallbackPrayerFor('en', () => 0).text).toContain('May')
    expect(fallbackPrayerFor('id', () => 0.99).text).toContain('Semoga')
  })
})
