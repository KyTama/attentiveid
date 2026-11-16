import { describe, expect, it } from 'vitest'
import {
  LIGHTS_CONFIG,
  lightsEnabledForPath,
  particleAlpha,
  shouldSpawn,
  spawnParticle,
} from '@/features/ambient-lights/lights'

describe('ambient lights', () => {
  it('is off on form pages and the experience page, on elsewhere', () => {
    for (const path of ['/free-session', '/booking', '/booking/step', '/let-there-be-light', '/portal-gate', '/dashboard/x']) {
      expect(lightsEnabledForPath(path)).toBe(false)
    }
    for (const path of ['/', '/psychologists', '/articles/a', '/sci-brief', '/free-sessions-info']) {
      expect(lightsEnabledForPath(path)).toBe(true)
    }
  })

  it('twinkles within the opacity cap and is gone after its life', () => {
    const particle = spawnParticle(100, 100, 0, () => 0.5)
    const middle = particleAlpha(particle, LIGHTS_CONFIG.lifeMs / 2)
    expect(middle).toBeGreaterThan(0)
    expect(middle).toBeLessThanOrEqual(LIGHTS_CONFIG.maxAlpha)
    expect(particleAlpha(particle, LIGHTS_CONFIG.lifeMs + 1)).toBe(0)
  })

  it('limits how often and how many lights appear', () => {
    const base = { lastSpawnAt: 0, lastX: 0, lastY: 0, count: 0 }
    expect(shouldSpawn(base, 100, 100, 1000)).toBe(true)
    expect(shouldSpawn({ ...base, lastSpawnAt: 990 }, 100, 100, 1000)).toBe(false)
    expect(shouldSpawn(base, 3, 3, 1000)).toBe(false)
    expect(shouldSpawn({ ...base, count: LIGHTS_CONFIG.maxParticles }, 100, 100, 1000)).toBe(false)
  })
})
