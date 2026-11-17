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
    const ok = validateGift({ frequency: 'always', moderation: 'manual', messageId: 'Halo\n[Prayer]', messageEn: 'Hi\n[Prayer]', giftImageUrl: '/media/x.webp' })
    expect(ok.ok && ok.value.frequency).toBe('always')
    expect(ok.ok && ok.value.moderation).toBe('manual')
    expect(validateGift({ frequency: 'weird', giftImageUrl: 'javascript:alert(1)' }).ok).toBe(false)
    const fallback = validateGift({ frequency: 'weird' })
    expect(fallback.ok && fallback.value.frequency).toBe('session')
  })

  it('puts the prayer in the letter and adds nothing about the sender', () => {
    const letter = renderGiftMessage(DEFAULT_GIFT_MESSAGE_EN, { text: 'Be well.' })
    expect(letter).toContain('Hi there!')
    expect(letter).toContain('Be well.')
    expect(letter).not.toContain('[Prayer]')
    expect(letter).not.toContain('—')
    expect(renderGiftMessage('[Prayer]', { text: '  Be well.  ' })).toBe('Be well.')
    // an old saved "show name / city" choice is simply dropped
    const old = validateGift({ showName: true, showCity: true })
    expect(old.ok && 'showName' in old.value).toBe(false)
  })
})

describe('prayer input', () => {
  it('accepts a prayer and keeps only the prayer: a name or city sent along is ignored', () => {
    const result = validatePrayerInput({ name: 'Sari', city: 'Malang', prayer: 'Semoga harimu tenang   dan indah.' })
    expect(result).toEqual({ ok: true, value: { prayer: 'Semoga harimu tenang dan indah.' } })
    expect(validatePrayerInput({ prayer: 'Semoga kamu baik-baik saja' }).ok).toBe(true)
  })

  it('rejects empty, too long, and contact-like text', () => {
    expect(validatePrayerInput({ prayer: 'pendek' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'x'.repeat(401) }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Kunjungi https://spam.example sekarang' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Hubungi saya di 0812-3456-7890 ya' }).ok).toBe(false)
    expect(validatePrayerInput({ prayer: 'Kirim ke saya@example.com ya sayang' }).ok).toBe(false)
    const bad = validatePrayerInput({ prayer: 'pendek' })
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(Object.keys(bad.errors)).toEqual(['prayer'])
  })

  it('always has a prayer to show', () => {
    expect(fallbackPrayerFor('en', () => 0).text).toContain('May')
    expect(fallbackPrayerFor('id', () => 0.99).text).toContain('Semoga')
  })
})
