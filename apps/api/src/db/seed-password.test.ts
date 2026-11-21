import { describe, expect, it } from 'bun:test'
import { MIN_SEED_PASSWORD_LENGTH, resolveSeedPassword } from './seed-password'

describe('seed passwords come from the environment', () => {
  it('uses a provided password and refuses a short one', () => {
    expect(resolveSeedPassword('a-long-enough-password!', { production: true, label: 'X' })).toEqual({ password: 'a-long-enough-password!', generated: false })
    expect(() => resolveSeedPassword('short', { production: false, label: 'X' })).toThrow(String(MIN_SEED_PASSWORD_LENGTH))
  })

  it('refuses to seed production without a password, and makes a random one locally', () => {
    expect(() => resolveSeedPassword(undefined, { production: true, label: 'SEED_SUPERADMIN_PASSWORD' })).toThrow('required')
    expect(() => resolveSeedPassword('   ', { production: true, label: 'X' })).toThrow('required')
    const first = resolveSeedPassword(undefined, { production: false, label: 'X' })
    const second = resolveSeedPassword(undefined, { production: false, label: 'X' })
    expect(first.generated).toBe(true)
    expect(first.password.length).toBeGreaterThanOrEqual(20)
    expect(first.password).not.toBe(second.password)
  })

  it('no longer has passwords written in the seed script', async () => {
    const source = await Bun.file(new URL('./seed-users.ts', import.meta.url)).text()
    expect(source).not.toMatch(/Password123|@Password6969/)
    expect(source).not.toMatch(/(?:defaultPassword|superPassword)\s*=\s*['"]/)
  })
})
