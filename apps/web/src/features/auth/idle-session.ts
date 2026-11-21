/**
 * Inactivity sign-out for the portal. Activity is noticed only inside this website (typing, clicking, scrolling, touching),
 * and only in the browser: the server is not told. A warning with a countdown comes first; one button keeps the session.
 */

export const IDLE_WARNING_SECONDS = 60
export const ACTIVITY_STORAGE_KEY = 'attentive-last-activity'

export type IdleState =
  | { kind: 'active' }
  | { kind: 'warning'; secondsLeft: number }
  | { kind: 'expired' }

/**
 * Where the countdown stands. The warning starts `warningSeconds` before the limit, or at a third of the limit when the limit
 * is very short, so the person always has some time of plain activity before it appears.
 */
export const idleStateAt = (now: number, lastActivity: number, idleMinutes: number, warningSeconds = IDLE_WARNING_SECONDS): IdleState => {
  const limitMs = idleMinutes * 60_000
  const warnMs = Math.min(warningSeconds * 1000, Math.floor(limitMs / 3))
  const idleFor = now - lastActivity
  if (idleFor >= limitMs) return { kind: 'expired' }
  if (idleFor >= limitMs - warnMs) return { kind: 'warning', secondsLeft: Math.max(1, Math.ceil((limitMs - idleFor) / 1000)) }
  return { kind: 'active' }
}

/** The events that count as being there. Mouse moves are included because reading with the pointer resting is still presence. */
export const ACTIVITY_EVENTS = ['keydown', 'pointerdown', 'pointermove', 'wheel', 'scroll', 'touchstart', 'input'] as const

/** Last activity time shared between tabs (several portal tabs count as one person). */
export const readLastActivity = (fallback: number): number => {
  try {
    const stored = Number(window.localStorage.getItem(ACTIVITY_STORAGE_KEY))
    return Number.isFinite(stored) && stored > 0 ? Math.max(stored, fallback) : fallback
  } catch {
    return fallback
  }
}

export const writeLastActivity = (time: number) => {
  try {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, String(time))
  } catch {
    // storage blocked: this tab alone keeps the count
  }
}
