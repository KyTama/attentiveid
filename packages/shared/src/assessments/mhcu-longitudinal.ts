/**
 * MHCU longitudinal domain: who is "the same person", wave numbering, and the change between measurements.
 *
 * Source of truth: the team's v7 demo (RMHCU_Demo_Lengkap_v7.html): its database dictionary, the `wide()` view of the
 * "Data longitudinal" tab, the delta_* columns of the sessions table, and the comparison pages of the reports
 * (c5 / c4r client progress report, p5 / p4r psychologist report). Pure functions, no I/O, no clock.
 *
 * Conventions (all taken from the demo's data, see mhcu-longitudinal.test.ts):
 * - one session = one filled-in questionnaire; wave_no = the person's n-th session ordered by submission time (T1, T2, ...);
 * - days_since_first / days_since_prev = difference of the CALENDAR DATES of the submissions (time of day ignored);
 * - delta_* = value minus the previous session's value, rounded to 2 decimals (positive = went up). For DI "up" is worse,
 *   for the level "up" is worse, for MHI/WI/BHI "up" is better;
 * - a change on a 0-100 index is "bermakna" (clearly) at 5 points or more (interim Attentive rule).
 */

import { MHCU_DOMAINS } from './mhcu'

/** A change of this many points or more on a 0-100 scale counts as meaningful ("bermakna") */
export const MHCU_SIGNIFICANT_CHANGE = 5

/* ============================== participant matching ============================== */

/** Normalised e-mail: trimmed and lower-cased; null when empty. */
export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null
  const e = email.trim().toLowerCase()
  return e ? e : null
}

/**
 * Normalised WhatsApp / phone number in the Indonesian national format "08...": digits only,
 * "+62 8.." / "62 8.." / "8.." become "08..". Null when fewer than 9 or more than 15 digits remain.
 */
export function normalizePhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  let d = phone.replace(/\D/g, '')
  if (d.startsWith('62')) d = `0${d.slice(2)}`
  else if (d.startsWith('8')) d = `0${d}`
  if (d.length < 9 || d.length > 15) return null
  return d
}

export interface MhcuKnownParticipant {
  participantId: string
  /** email_norm of the participants table */
  emailNorm: string | null
  /** phone_norm of the participants table */
  phoneNorm: string | null
}

export interface MhcuMatch {
  participantId: string
  matchedBy: 'email' | 'phone'
}

/**
 * Same person = same normalised e-mail first; only when no participant has that e-mail, the same normalised
 * WhatsApp number. The e-mail match always wins, even if the phone number belongs to somebody else.
 * Returns null for a new person (the caller then creates a participant and numbers it T1).
 */
export function matchParticipant(
  known: readonly MhcuKnownParticipant[],
  incoming: { email?: unknown; phone?: unknown },
): MhcuMatch | null {
  const email = normalizeEmail(incoming.email)
  if (email) {
    const byEmail = known.find((p) => p.emailNorm === email)
    if (byEmail) return { participantId: byEmail.participantId, matchedBy: 'email' }
  }
  const phone = normalizePhone(incoming.phone)
  if (phone) {
    const byPhone = known.find((p) => p.phoneNorm === phone)
    if (byPhone) return { participantId: byPhone.participantId, matchedBy: 'phone' }
  }
  return null
}

/* ============================== dates ============================== */

/** Split "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM:SS[.sss][Z]" into UTC-based milliseconds of its date and of the full instant. */
function parseStamp(stamp: string): { dayMs: number; instantMs: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(stamp.trim())
  if (!m) throw new Error(`invalid timestamp: ${stamp}`)
  const [y, mo, d, hh = '0', mi = '0', ss = '0'] = m.slice(1)
  return {
    dayMs: Date.UTC(Number(y), Number(mo) - 1, Number(d)),
    instantMs: Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mi), Number(ss)),
  }
}

const DAY_MS = 86_400_000

/** Whole calendar days from `from` to `to` (time of day ignored). */
export function calendarDaysBetween(from: string, to: string): number {
  return Math.round((parseStamp(to).dayMs - parseStamp(from).dayMs) / DAY_MS)
}

/** Days between the two instants, rounded to the nearest day (the demo's `days` column of the wide view). */
export function roundedDaysBetween(from: string, to: string): number {
  return Math.round((parseStamp(to).instantMs - parseStamp(from).instantMs) / DAY_MS)
}

/* ============================== history ============================== */

export interface MhcuSessionInput {
  sessionId: string
  reportCode?: string
  /** "YYYY-MM-DD HH:MM:SS" (local, as stored) or ISO */
  submittedAt: string
  /** 0-100, null when it could not be computed */
  mhi: number | null
  /** Final level 1-5 */
  level: number
  di: number | null
  wi: number | null
  bhi: number | null
  /** WI dimensions: Positive Affect, Positive Functioning, Positive Relationships (0-100) */
  wiDims?: readonly (number | null)[]
  /** BHI dimensions: Self-care & Routine, Social Connection, Meaningful Activity (0-100) */
  bhiDims?: readonly (number | null)[]
  /** The 13 domain scores of Part A (0-4), in MHCU_DOMAINS order */
  domains?: readonly (number | null)[]
}

export type MhcuMetric = 'mhi' | 'di' | 'wi' | 'bhi'

/** Differences to the previous session of the same person (null on T1 or when either value is missing). */
export interface MhcuDeltas {
  mhi: number | null
  di: number | null
  wi: number | null
  bhi: number | null
  /** level minus previous level (negative = better) */
  level: number | null
}

export interface MhcuWave extends MhcuSessionInput {
  /** 1 = first measurement (T1) */
  waveNo: number
  /** YYYY-MM-DD */
  submittedDate: string
  daysSinceFirst: number
  daysSincePrev: number | null
  prevSessionId: string | null
  delta: MhcuDeltas
}

/** The history of one participant: the waves in order, with the numbers the reports and the dashboard need. */
export interface MhcuHistory {
  participantId: string | null
  waves: MhcuWave[]
  /** Number of measurements */
  n: number
  firstDate: string
  lastDate: string
  /** Days between the first and the last submission (rounded instants, the demo's `days`) */
  spanDays: number
}

const round2 = (v: number): number => Math.round(v * 100) / 100

function diff2(cur: number | null, prev: number | null): number | null {
  return cur === null || prev === null ? null : round2(cur - prev)
}

/**
 * Number the sessions of one person (ordered by submission time, ties by session id) and compute days and deltas.
 * The input order does not matter and the input is not modified.
 */
export function buildHistory(sessions: readonly MhcuSessionInput[], participantId: string | null = null): MhcuHistory {
  const sorted = [...sessions].sort((a, b) => parseStamp(a.submittedAt).instantMs - parseStamp(b.submittedAt).instantMs || a.sessionId.localeCompare(b.sessionId))
  const first = sorted[0]
  const waves: MhcuWave[] = sorted.map((s, i) => {
    const prev = i > 0 ? (sorted[i - 1] as MhcuSessionInput) : null
    return {
      ...s,
      waveNo: i + 1,
      submittedDate: s.submittedAt.slice(0, 10),
      daysSinceFirst: first ? calendarDaysBetween(first.submittedAt, s.submittedAt) : 0,
      daysSincePrev: prev ? calendarDaysBetween(prev.submittedAt, s.submittedAt) : null,
      prevSessionId: prev ? prev.sessionId : null,
      delta: {
        mhi: prev ? diff2(s.mhi, prev.mhi) : null,
        di: prev ? diff2(s.di, prev.di) : null,
        wi: prev ? diff2(s.wi, prev.wi) : null,
        bhi: prev ? diff2(s.bhi, prev.bhi) : null,
        level: prev ? s.level - prev.level : null,
      },
    }
  })
  const last = waves[waves.length - 1]
  return {
    participantId,
    waves,
    n: waves.length,
    firstDate: first ? first.submittedAt.slice(0, 10) : '',
    lastDate: last ? last.submittedAt.slice(0, 10) : '',
    spanDays: first && last ? roundedDaysBetween(first.submittedAt, last.submittedAt) : 0,
  }
}

/** Group sessions by participant id and build every history. */
export function buildHistories(sessions: readonly (MhcuSessionInput & { participantId: string })[]): MhcuHistory[] {
  const byPerson = new Map<string, (MhcuSessionInput & { participantId: string })[]>()
  for (const s of sessions) {
    const list = byPerson.get(s.participantId) ?? []
    list.push(s)
    byPerson.set(s.participantId, list)
  }
  return [...byPerson.keys()].sort().map((id) => buildHistory(byPerson.get(id) ?? [], id))
}

/* ============================== wide view ============================== */

export interface MhcuWideRow {
  participantId: string
  n: number
  firstDate: string
  lastDate: string
  days: number
  /** One entry per wave T1..Tmax; null where the person has fewer waves */
  mhi: (number | null)[]
  level: (number | null)[]
  di: (number | null)[]
  wi: (number | null)[]
  bhi: (number | null)[]
  /** Last minus first, rounded to 2 decimals; null with a single wave */
  change: { mhi: number | null; level: number | null; di: number | null; wi: number | null; bhi: number | null }
}

/** The demo's wide_by_wave view of one participant: T1..Tmax per index plus the last-minus-first change. */
export function wideRow(history: MhcuHistory, maxWaves: number): MhcuWideRow {
  const pick = (key: 'mhi' | 'level' | 'di' | 'wi' | 'bhi'): (number | null)[] =>
    Array.from({ length: maxWaves }, (_, i) => {
      const w = history.waves[i]
      return w ? w[key] : null
    })
  const first = history.waves[0]
  const last = history.waves[history.waves.length - 1]
  const change = (key: 'mhi' | 'level' | 'di' | 'wi' | 'bhi'): number | null =>
    history.n > 1 && first && last ? diff2(last[key], first[key]) : null
  return {
    participantId: history.participantId ?? '',
    n: history.n,
    firstDate: history.firstDate,
    lastDate: history.lastDate,
    days: history.spanDays,
    mhi: pick('mhi'),
    level: pick('level'),
    di: pick('di'),
    wi: pick('wi'),
    bhi: pick('bhi'),
    change: { mhi: change('mhi'), level: change('level'), di: change('di'), wi: change('wi'), bhi: change('bhi') },
  }
}

/* ============================== change between two measurements ============================== */

export type MhcuChangeKind = 'clearly_better' | 'slightly_better' | 'stable' | 'slightly_worse' | 'clearly_worse'

export interface MhcuChange {
  from: number | null
  to: number | null
  /** to - from, unrounded; null when either side is missing */
  delta: number | null
  /** The delta rounded to 1 decimal as printed in the reports (+8,9) */
  deltaShown: number | null
  kind: MhcuChangeKind | null
  /** True at |delta| >= 5 points */
  significant: boolean
  /** Report wording (Indonesian is the team's text; "worse" wording and "stable" EN are not in the demo, see tests) */
  word: { id: string; en: string } | null
}

const WORDS: Record<MhcuChangeKind, { id: string; en: string }> = {
  clearly_better: { id: 'Membaik bermakna', en: 'Clearly improved' },
  slightly_better: { id: 'Sedikit membaik', en: 'Slightly improved' },
  stable: { id: 'Relatif tetap', en: 'Relatively unchanged' },
  slightly_worse: { id: 'Sedikit memburuk', en: 'Slightly worse' },
  clearly_worse: { id: 'Memburuk bermakna', en: 'Clearly worse' },
}

/** Whether a higher value is better for the index (DI: lower is better). */
export const MHCU_HIGHER_IS_BETTER: Record<MhcuMetric, boolean> = { mhi: true, wi: true, bhi: true, di: false }

/**
 * Compare two values of a 0-100 index (an index, or a WI/BHI dimension). `higherIsBetter` is false only for the DI.
 * |delta| >= 5 (with a 1e-9 tolerance for float noise) is "clearly" (bermakna); a delta that prints as 0.0 is "stable";
 * anything in between is "slightly".
 */
export function compareIndex(from: number | null, to: number | null, higherIsBetter: boolean): MhcuChange {
  if (from === null || to === null) return { from, to, delta: null, deltaShown: null, kind: null, significant: false, word: null }
  const delta = to - from
  const shown = Math.round(delta * 10) / 10
  const significant = Math.abs(delta) >= MHCU_SIGNIFICANT_CHANGE - 1e-9
  const good = higherIsBetter ? delta : -delta
  let kind: MhcuChangeKind
  if (shown === 0) kind = 'stable'
  else if (good > 0) kind = significant ? 'clearly_better' : 'slightly_better'
  else kind = significant ? 'clearly_worse' : 'slightly_worse'
  return { from, to, delta, deltaShown: shown === 0 ? 0 : shown, kind, significant, word: WORDS[kind] }
}

/** Change of a named index between two measurements. */
export function compareMetric(metric: MhcuMetric, from: number | null, to: number | null): MhcuChange {
  return compareIndex(from, to, MHCU_HIGHER_IS_BETTER[metric])
}

export interface MhcuLevelChange {
  from: number
  to: number
  /** to - from (negative = better) */
  delta: number
  direction: 'down' | 'up' | 'same'
  /** "Turun 1 level" / "Naik 2 level" / "Tetap" */
  text: { id: string; en: string }
  /** "Membaik" / "Memburuk" / "Tetap" */
  word: { id: string; en: string }
}

/** Change of the final level (1-5). A lower level is better. */
export function compareLevel(from: number, to: number): MhcuLevelChange {
  const delta = to - from
  if (delta < 0) {
    return { from, to, delta, direction: 'down', text: { id: `Turun ${-delta} level`, en: `Down ${-delta} level` }, word: { id: 'Membaik', en: 'Improved' } }
  }
  if (delta > 0) {
    return { from, to, delta, direction: 'up', text: { id: `Naik ${delta} level`, en: `Up ${delta} level` }, word: { id: 'Memburuk', en: 'Worse' } }
  }
  return { from, to, delta, direction: 'same', text: { id: 'Tetap', en: 'Unchanged' }, word: { id: 'Tetap', en: 'Unchanged' } }
}

export interface MhcuDomainChange {
  from: number | null
  to: number | null
  /** to - from on the 0-4 domain score */
  delta: number | null
  direction: 'better' | 'worse' | 'same' | null
  /** The last value is still at or above the domain's review threshold (still flagged) */
  stillAboveThreshold: boolean
  /** "Membaik" / "Membaik, masih di atas ambang" / "Tetap" / "Tetap, masih di atas ambang" / "Memburuk[, ...]" */
  word: { id: string; en: string } | null
}

/**
 * Change of a Part A domain score (0-4) between two measurements, with the report wording:
 * Improved / Worse / Unchanged, followed by ", still at/above threshold" when the last score is at or above the
 * review threshold (for "Unchanged" only when that score is above 0).
 */
export function compareDomain(domainNo: number, from: number | null, to: number | null): MhcuDomainChange {
  const def = MHCU_DOMAINS[domainNo - 1]
  if (!def || from === null || to === null) return { from, to, delta: null, direction: null, stillAboveThreshold: false, word: null }
  const above = to >= def.threshold
  const direction = to < from ? 'better' : to > from ? 'worse' : 'same'
  const base = direction === 'better' ? { id: 'Membaik', en: 'Improved' } : direction === 'worse' ? { id: 'Memburuk', en: 'Worse' } : { id: 'Tetap', en: 'Unchanged' }
  const withThreshold = above && (direction !== 'same' || to > 0)
  return {
    from,
    to,
    delta: to - from,
    direction,
    stillAboveThreshold: above,
    word: withThreshold ? { id: `${base.id}, masih di atas ambang`, en: `${base.en}, still at/above threshold` } : base,
  }
}

/** Signed change as printed in the reports: "+8,9" (Indonesian, decimal comma) or "+8.9"; "0,0" for no change. */
export function formatSignedChange(deltaShown: number | null, lang: 'id' | 'en'): string {
  if (deltaShown === null) return '-'
  const abs = Math.abs(deltaShown).toFixed(1)
  const sign = deltaShown > 0 ? '+' : deltaShown < 0 ? '-' : ''
  return sign + (lang === 'id' ? abs.replace('.', ',') : abs)
}

/** All four indices and the level compared between two waves of one history (e.g. previous -> latest, or T1 -> Tn). */
export interface MhcuWaveComparison {
  fromWaveNo: number
  toWaveNo: number
  mhi: MhcuChange
  di: MhcuChange
  wi: MhcuChange
  bhi: MhcuChange
  level: MhcuLevelChange
  wiDims: MhcuChange[]
  bhiDims: MhcuChange[]
  domains: MhcuDomainChange[]
}

export function compareWaves(from: MhcuWave, to: MhcuWave): MhcuWaveComparison {
  const dims = (a: readonly (number | null)[] | undefined, b: readonly (number | null)[] | undefined): MhcuChange[] =>
    Array.from({ length: 3 }, (_, i) => compareIndex(a?.[i] ?? null, b?.[i] ?? null, true))
  return {
    fromWaveNo: from.waveNo,
    toWaveNo: to.waveNo,
    mhi: compareMetric('mhi', from.mhi, to.mhi),
    di: compareMetric('di', from.di, to.di),
    wi: compareMetric('wi', from.wi, to.wi),
    bhi: compareMetric('bhi', from.bhi, to.bhi),
    level: compareLevel(from.level, to.level),
    wiDims: dims(from.wiDims, to.wiDims),
    bhiDims: dims(from.bhiDims, to.bhiDims),
    domains: MHCU_DOMAINS.map((_, i) => compareDomain(i + 1, from.domains?.[i] ?? null, to.domains?.[i] ?? null)),
  }
}
