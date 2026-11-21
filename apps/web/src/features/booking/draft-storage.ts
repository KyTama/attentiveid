/**
 * The booking form remembers what a visitor typed so they can come back to it. What is saved is limited on purpose:
 *  - the free-text story about their concern and the "I am in crisis" tick are health information and are never saved in the
 *    browser (they are asked again if the visitor comes back); they only leave the page when the booking is sent;
 *  - the saved draft expires after a day, so name, phone and e-mail do not sit in a shared computer's browser for weeks;
 *  - a draft saved by the older version (no expiry) is dropped.
 */

export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000

/** Fields never written to the browser's storage. */
export const UNSAVED_DRAFT_FIELDS = ['concernNote', 'isCrisisManual'] as const

export const serializeDraft = (data: object, now: number = Date.now()): string => {
  const kept: Record<string, unknown> = { ...(data as Record<string, unknown>) }
  for (const key of UNSAVED_DRAFT_FIELDS) delete kept[key]
  return JSON.stringify({ savedAt: now, data: kept })
}

/** The saved fields, or null when there is no usable draft (missing, older version, expired or damaged). */
export const parseDraft = <T extends object>(raw: string | null, now: number = Date.now()): Partial<T> | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { savedAt?: unknown; data?: unknown } | null
    if (!parsed || typeof parsed.savedAt !== 'number' || !parsed.data || typeof parsed.data !== 'object') return null
    if (now - parsed.savedAt > DRAFT_TTL_MS || parsed.savedAt > now + 60_000) return null
    const data = { ...(parsed.data as Record<string, unknown>) }
    for (const key of UNSAVED_DRAFT_FIELDS) delete data[key]
    return data as Partial<T>
  } catch {
    return null
  }
}
