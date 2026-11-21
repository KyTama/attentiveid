import { describe, expect, it } from 'bun:test'
import { gunzipSync, gzipSync } from 'node:zlib'
import { GSC_EDU_VALUES, GSC_LIMITS, GSC_SEX_VALUES, validateGscSubmission } from './gsc'

/** Same packing as pack()/unpack() of gsc.html: gzip of the JSON, base64url without padding */
const pack = (obj: unknown): string => gzipSync(Buffer.from(JSON.stringify(obj))).toString('base64url')
const unpack = (code: string): Record<string, unknown> => JSON.parse(gunzipSync(Buffer.from(code, 'base64url')).toString('utf8'))

const REL_VALUES = ['s', 'c', 'b'] as const

/** A full session as the page builds it: cards and own values, every relation answered, progress set. */
function fullSession(n = 12) {
  const goals = Array.from({ length: n }, (_, i) => ({
    id: i % 3 === 2 ? `own${i}` : `gwork${i}`,
    name: i % 3 === 2 ? `Nilai sendiri nomor ${i}` : `Memiliki penghasilan yang cukup untuk kebutuhan dan tabungan, bagian ${i}`,
    note: i % 3 === 2 ? 'Seperti apa wujudnya bagi saya: hadir penuh bersama keluarga' : '',
    area: i % 3 === 2 ? '' : 'work',
    src: i % 3 === 2 ? 'own' : 'card',
    rank: i + 1,
    prog: i % 3,
  }))
  const rel: Record<string, string> = {}
  let k = 0
  for (const a of goals) for (const b of goals) if (a.id !== b.id) rel[`${a.id}>${b.id}`] = REL_VALUES[k++ % 3] as string
  return { goals, rel }
}

function payloadFor(n = 12) {
  const { goals, rel } = fullSession(n)
  const profile = { name: 'Rina Pratiwi', age: 29, sex: 'Perempuan', edu: 'D4/S1', email: 'rina@example.com', wa: '6281234567890' }
  const id = 'GSC-261121-AB12'
  const code = pack({ v: 15, id, lang: 'id', profile, t0: 1_763_700_000_000, t1: 1_763_700_840_000, goals, rel })
  return {
    id,
    ts: '2026-11-21T03:14:00.000Z',
    lang: 'id',
    profile,
    minutes: 14,
    brief: { core: 'Keluarga', coreWhy: 'Banyak nilai lain bergantung padanya', n, links: 132, support: 44, hinder: 44, both: 44 },
    goals: goals.map((g) => g.name),
    code,
    counselorUrl: `https://attentiveid.com/assessments/goal-compass/konselor#d=${code}`,
  }
}

const good = () => payloadFor(8)

describe('validateGscSubmission: what the participant page sends', () => {
  it('accepts a payload and returns only the known fields', () => {
    const result = validateGscSubmission(good())
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toMatchObject({ clientId: 'GSC-261121-AB12', lang: 'id', name: 'Rina Pratiwi', age: 29, sex: 'Perempuan', edu: 'D4/S1', phone: '6281234567890', minutes: 14 })
      expect(Object.keys(result.value)).not.toContain('counselorUrl')
      expect(Object.keys(result.value)).not.toContain('ts')
    }
  })

  it('accepts a full 12-goal session with all 132 relations; the code is far under the limit', () => {
    const body = payloadFor(12)
    expect(body.code.length).toBeLessThan(GSC_LIMITS.codeMax / 4)
    const result = validateGscSubmission(body)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.goals.length).toBe(12)
  })

  it('the code round-trips: unpacking gives back the goals, relations and profile', () => {
    const body = payloadFor(12)
    const session = unpack(body.code)
    const { goals, rel } = fullSession(12)
    expect(session.v).toBe(15)
    expect(session.id).toBe(body.id)
    expect((session.goals as { name: string }[]).map((g) => g.name)).toEqual(body.goals)
    expect(session.goals).toEqual(goals)
    expect(session.rel).toEqual(rel)
    expect(session.profile).toEqual(body.profile)
    const result = validateGscSubmission(body)
    expect(result.ok).toBe(true)
    if (result.ok) expect((unpack(result.value.code).goals as { name: string }[]).map((g) => g.name)).toEqual(result.value.goals)
  })

  it('accepts the edges of every range the page allows', () => {
    const withProfile = (patch: Record<string, unknown>) => ({ ...good(), profile: { ...good().profile, ...patch } })
    for (const age of [12, 99]) expect(validateGscSubmission(withProfile({ age })).ok).toBe(true)
    for (const sex of GSC_SEX_VALUES) expect(validateGscSubmission(withProfile({ sex })).ok).toBe(true)
    for (const edu of GSC_EDU_VALUES) expect(validateGscSubmission(withProfile({ edu })).ok).toBe(true)
    for (const wa of ['62812345678', '628123456789012']) expect(validateGscSubmission(withProfile({ wa })).ok).toBe(true)
    expect(validateGscSubmission(withProfile({ name: 'Al' })).ok).toBe(true)
    expect(validateGscSubmission(withProfile({ name: 'a'.repeat(60) })).ok).toBe(true)
    expect(validateGscSubmission(payloadFor(6)).ok).toBe(true)
    expect(validateGscSubmission({ ...good(), minutes: 1 }).ok).toBe(true)
    expect(validateGscSubmission({ ...good(), lang: 'en' }).ok).toBe(true)
  })

  it('normalises text: trims name, email and goals, strips non-digits from the WhatsApp number', () => {
    const b = good()
    const result = validateGscSubmission({ ...b, profile: { ...b.profile, name: '  Rina  ', email: ' rina@example.com ', wa: '+62 812-3456-7890' }, goals: b.goals.map((g) => ` ${g} `) })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('Rina')
      expect(result.value.email).toBe('rina@example.com')
      expect(result.value.phone).toBe('6281234567890')
      expect(result.value.goals[0]).toBe(b.goals[0] as string)
    }
  })

  it('rounds minutes and accepts a missing minutes value', () => {
    const r = validateGscSubmission({ ...good(), minutes: 13.6 })
    expect(r.ok && r.value.minutes).toBe(14)
    const none = validateGscSubmission({ ...good(), minutes: undefined })
    expect(none.ok).toBe(true)
    if (none.ok) expect(none.value.minutes).toBeNull()
  })
})

describe('validateGscSubmission: rejections', () => {
  const cases: [string, (b: ReturnType<typeof good>) => unknown][] = [
    ['lang', (b) => ({ ...b, lang: 'fr' })],
    ['id', (b) => ({ ...b, id: 'not-an-id' })],
    ['id', (b) => ({ ...b, id: '' })],
    ['profile', (b) => ({ ...b, profile: null })],
    ['name', (b) => ({ ...b, profile: { ...b.profile, name: 'a\u0000b' } })],
    ['name', (b) => ({ ...b, profile: { ...b.profile, name: 'A' } })],
    ['name', (b) => ({ ...b, profile: { ...b.profile, name: 'a'.repeat(61) } })],
    ['name', (b) => ({ ...b, profile: { ...b.profile, name: '   ' } })],
    ['email', (b) => ({ ...b, profile: { ...b.profile, email: 'nope' } })],
    ['email', (b) => ({ ...b, profile: { ...b.profile, email: `${'a'.repeat(80)}@x.com` } })],
    ['age', (b) => ({ ...b, profile: { ...b.profile, age: '29' } })],
    ['age', (b) => ({ ...b, profile: { ...b.profile, age: 11 } })],
    ['age', (b) => ({ ...b, profile: { ...b.profile, age: 100 } })],
    ['age', (b) => ({ ...b, profile: { ...b.profile, age: 29.5 } })],
    ['age', (b) => ({ ...b, profile: { ...b.profile, age: null } })],
    ['sex', (b) => ({ ...b, profile: { ...b.profile, sex: '' } })],
    ['sex', (b) => ({ ...b, profile: { ...b.profile, sex: 'Male' } })],
    ['edu', (b) => ({ ...b, profile: { ...b.profile, edu: '' } })],
    ['edu', (b) => ({ ...b, profile: { ...b.profile, edu: 'PhD' } })],
    ['WhatsApp', (b) => ({ ...b, profile: { ...b.profile, wa: '12' } })],
    ['WhatsApp', (b) => ({ ...b, profile: { ...b.profile, wa: '081234567890' } })], // the page turns a leading 0 into 62 before sending
    ['WhatsApp', (b) => ({ ...b, profile: { ...b.profile, wa: '62812345' } })],
    ['WhatsApp', (b) => ({ ...b, profile: { ...b.profile, wa: 6281234567890 } })],
    ['minutes', (b) => ({ ...b, minutes: 0 })],
    ['minutes', (b) => ({ ...b, minutes: 24 * 60 + 1 })],
    ['minutes', (b) => ({ ...b, minutes: '14' })],
    ['goals', (b) => ({ ...b, goals: Array.from({ length: 13 }, () => 'x') })],
    ['goals', (b) => ({ ...b, goals: Array.from({ length: 5 }, () => 'x') })],
    ['goals', (b) => ({ ...b, goals: 'x' })],
    ['goal', (b) => ({ ...b, goals: [...b.goals.slice(1), '   '] })],
    ['goal', (b) => ({ ...b, goals: [...b.goals.slice(1), 5] })],
    ['goal', (b) => ({ ...b, goals: [...b.goals.slice(1), 'x'.repeat(301)] })],
    ['code', (b) => ({ ...b, code: 'has spaces and <script>' })],
    ['code', (b) => ({ ...b, code: 'short' })],
    ['code', (b) => ({ ...b, code: 'A'.repeat(GSC_LIMITS.codeMax + 1) })],
    ['code', (b) => ({ ...b, code: undefined })],
    ['brief', (b) => ({ ...b, brief: 'text' })],
    ['brief', (b) => ({ ...b, brief: { big: 'x'.repeat(GSC_LIMITS.briefJsonMax) } })],
  ]
  for (const [word, make] of cases) {
    it(`rejects a bad ${word}`, () => {
      const result = validateGscSubmission(make(good()))
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.toLowerCase()).toContain(word.toLowerCase())
    })
  }

  it('rejects non-objects', () => {
    for (const bad of [null, undefined, 'x', 5, [], true]) expect(validateGscSubmission(bad).ok).toBe(false)
  })
})
