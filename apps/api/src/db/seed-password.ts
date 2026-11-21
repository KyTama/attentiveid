import { randomBytes } from 'node:crypto'

/**
 * Passwords for seeded staff accounts come from the environment, never from the source code (this repository is public).
 * In production a strong password must be provided; on a developer machine a random one is made when none is given.
 */

export const MIN_SEED_PASSWORD_LENGTH = 14

export interface SeedPassword {
  password: string
  generated: boolean
}

export const resolveSeedPassword = (
  value: string | undefined,
  options: { production: boolean; label: string; random?: () => string },
): SeedPassword => {
  const provided = value?.trim()
  if (provided) {
    if (provided.length < MIN_SEED_PASSWORD_LENGTH) {
      throw new Error(`${options.label} must be at least ${MIN_SEED_PASSWORD_LENGTH} characters.`)
    }
    return { password: provided, generated: false }
  }
  if (options.production) {
    throw new Error(`${options.label} is required to seed users in production.`)
  }
  const random = options.random ?? (() => randomBytes(18).toString('base64url'))
  return { password: random(), generated: true }
}
