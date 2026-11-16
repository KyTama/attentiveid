/**
 * Cursor "twinkling lights": a few tiny warm lights that appear near the pointer and fade out.
 * Kept deliberately light so it never competes with reading or clicking:
 * few particles, short life, low opacity, no pointer capture, paused on forms.
 */

/** Pages (and path prefixes) where the lights are off so people can focus. */
export const LIGHTS_DISABLED_PATHS = ['/free-session', '/booking', '/let-there-be-light', '/portal-gate', '/dashboard']

export const lightsEnabledForPath = (pathname: string): boolean =>
  !LIGHTS_DISABLED_PATHS.some((blocked) => pathname === blocked || pathname.startsWith(`${blocked}/`))

/** Pointer is over (or inside) something the person is typing into or reading in a dialog. */
export const FORM_SELECTOR = 'input, textarea, select, form, [contenteditable="true"], [role="dialog"], [aria-modal="true"]'

export const LIGHTS_CONFIG = {
  maxParticles: 18,
  lifeMs: 1000,
  minSpawnGapMs: 70,
  minMoveDistance: 22,
  spread: 22,
  maxAlpha: 0.8,
  color: '226, 174, 82',
} as const

export interface Particle {
  x: number
  y: number
  vy: number
  size: number
  born: number
  phase: number
}

export const spawnParticle = (x: number, y: number, now: number, random: () => number = Math.random): Particle => ({
  x: x + (random() - 0.5) * 2 * LIGHTS_CONFIG.spread,
  y: y + (random() - 0.5) * 2 * LIGHTS_CONFIG.spread,
  vy: -(0.012 + random() * 0.02),
  size: 1.4 + random() * 2,
  born: now,
  phase: random() * Math.PI * 2,
})

/** Twinkle: fades in and out over the life with a gentle flicker. 0 when expired. */
export const particleAlpha = (particle: Particle, now: number): number => {
  const age = (now - particle.born) / LIGHTS_CONFIG.lifeMs
  if (age < 0 || age >= 1) return 0
  const envelope = Math.sin(Math.PI * age)
  const flicker = 0.75 + 0.25 * Math.sin(now / 90 + particle.phase)
  return LIGHTS_CONFIG.maxAlpha * envelope * flicker
}

export const isAlive = (particle: Particle, now: number) => now - particle.born < LIGHTS_CONFIG.lifeMs

/** Whether a new light may appear for this pointer move. */
export const shouldSpawn = (
  state: { lastSpawnAt: number; lastX: number; lastY: number; count: number },
  x: number,
  y: number,
  now: number,
): boolean =>
  state.count < LIGHTS_CONFIG.maxParticles &&
  now - state.lastSpawnAt >= LIGHTS_CONFIG.minSpawnGapMs &&
  Math.hypot(x - state.lastX, y - state.lastY) >= LIGHTS_CONFIG.minMoveDistance
