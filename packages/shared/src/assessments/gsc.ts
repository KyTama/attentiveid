/**
 * Goal System Compass (GSC): what the participant page sends when a person finishes, checked before it is stored.
 * The goals map itself travels as `code` (the whole session, gzip + base64url, exactly what the counselor console opens);
 * the server keeps it as is and never interprets it. `brief` is the short summary the page computed for the counselor's list.
 */

export const GSC_LIMITS = {
  idMax: 40,
  nameMin: 2,
  /** The page's name field has maxlength 60 */
  nameMax: 60,
  /** The page's email field has maxlength 80 */
  emailMax: 80,
  /** The page accepts ages 12-99 */
  ageMin: 12,
  ageMax: 99,
  minutesMin: 1,
  minutesMax: 24 * 60,
  goalsMin: 6,
  goalsMax: 12,
  goalMax: 300,
  /** About 6 times what a full 12-goal session packs to. */
  codeMax: 60_000,
  briefJsonMax: 20_000,
} as const

/** Values of the page's sex buttons and education list (stored as the Indonesian label). */
export const GSC_SEX_VALUES = ['Laki-laki', 'Perempuan'] as const
export const GSC_EDU_VALUES = ['SD', 'SMP', 'SMA/SMK', 'D1–D3', 'D4/S1', 'S2', 'S3'] as const

export interface GscSubmission {
  /** The id the page showed the person (GSC-yymmdd-XXXX) */
  clientId: string
  lang: 'id' | 'en'
  name: string
  age: number
  sex: string
  edu: string
  email: string
  /** WhatsApp number, digits only */
  phone: string
  minutes: number | null
  goals: string[]
  brief: Record<string, unknown>
  /** gzip + base64url of the whole session, opened by the counselor console */
  code: string
}

export type GscValidation = { ok: true; value: GscSubmission } | { ok: false; error: string }

/** Page id: GSC-yymmdd-XXXX */
const ID_RE = /^GSC-\d{6}-[A-Z0-9]{4}$/
/** WhatsApp as the page normalises it: 62 + 8 to 13 digits */
const WA_RE = /^62\d{8,13}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CODE_RE = /^[A-Za-z0-9_-]+$/

const isPlain = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

const hasControl = (s: string): boolean => {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c < 32 || c === 127) return true
  }
  return false
}

const text = (source: Record<string, unknown>, key: string, max: number, required = true): { value: string } | { error: string } => {
  const v = source[key]
  if (v === undefined || v === null || v === '') return required ? { error: `${key} is required` } : { value: '' }
  if (typeof v !== 'string') return { error: `${key} must be text` }
  const trimmed = v.trim()
  if (required && !trimmed) return { error: `${key} is required` }
  if (trimmed.length > max) return { error: `${key} is too long` }
  if (hasControl(trimmed)) return { error: `${key} has invalid characters` }
  return { value: trimmed }
}

export function validateGscSubmission(body: unknown): GscValidation {
  const fail = (error: string): GscValidation => ({ ok: false, error })
  if (!isPlain(body)) return fail('body must be an object')
  if (body.lang !== 'id' && body.lang !== 'en') return fail("lang must be 'id' or 'en'")

  const id = text(body, 'id', GSC_LIMITS.idMax)
  if ('error' in id) return fail(id.error)
  if (!ID_RE.test(id.value)) return fail('id is not valid')

  const profile = body.profile
  if (!isPlain(profile)) return fail('profile is required')
  const name = text(profile, 'name', GSC_LIMITS.nameMax)
  if ('error' in name) return fail(name.error)
  if (name.value.length < GSC_LIMITS.nameMin) return fail('name is too short')
  const sex = text(profile, 'sex', 80)
  if ('error' in sex) return fail(sex.error)
  if (!(GSC_SEX_VALUES as readonly string[]).includes(sex.value)) return fail('sex is not valid')
  const edu = text(profile, 'edu', 80)
  if ('error' in edu) return fail(edu.error)
  if (!(GSC_EDU_VALUES as readonly string[]).includes(edu.value)) return fail('edu is not valid')
  const email = text(profile, 'email', GSC_LIMITS.emailMax)
  if ('error' in email) return fail(email.error)
  if (!EMAIL_RE.test(email.value)) return fail('email is not valid')

  const age = profile.age
  if (typeof age !== 'number' || !Number.isInteger(age) || age < GSC_LIMITS.ageMin || age > GSC_LIMITS.ageMax) return fail('age is not valid')

  const wa = typeof profile.wa === 'string' ? profile.wa.replace(/\D/g, '') : ''
  if (!WA_RE.test(wa)) return fail('WhatsApp number is not valid')

  let minutes: number | null = null
  if (body.minutes !== undefined && body.minutes !== null && body.minutes !== '') {
    if (typeof body.minutes !== 'number' || !Number.isFinite(body.minutes) || body.minutes < GSC_LIMITS.minutesMin || body.minutes > GSC_LIMITS.minutesMax) return fail('minutes is not valid')
    minutes = Math.round(body.minutes)
  }

  if (!Array.isArray(body.goals) || body.goals.length < GSC_LIMITS.goalsMin || body.goals.length > GSC_LIMITS.goalsMax) return fail('goals is not valid')
  const goals: string[] = []
  for (const goal of body.goals) {
    if (typeof goal !== 'string' || goal.length > GSC_LIMITS.goalMax || hasControl(goal) || !goal.trim()) return fail('a goal is not valid')
    goals.push(goal.trim())
  }

  if (!isPlain(body.brief)) return fail('brief is required')
  if (JSON.stringify(body.brief).length > GSC_LIMITS.briefJsonMax) return fail('brief is too large')

  const code = body.code
  if (typeof code !== 'string' || code.length < 20 || code.length > GSC_LIMITS.codeMax || !CODE_RE.test(code)) return fail('code is not valid')

  return {
    ok: true,
    value: { clientId: id.value, lang: body.lang, name: name.value, age, sex: sex.value, edu: edu.value, email: email.value, phone: wa, minutes, goals, brief: body.brief, code },
  }
}
