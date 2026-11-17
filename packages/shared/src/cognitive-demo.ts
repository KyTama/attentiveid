import { AAA50_DATASET, type Aaa50Item, type Aaa50ScaleOption, type Aaa50Section } from './aaa50-data'

export const COGNITIVE_TASK_KEYS = ['cpt', 'sst', 'nb', 'gng'] as const
export type CognitiveTaskKey = typeof COGNITIVE_TASK_KEYS[number]

export type CognitiveReportKey =
  | 'sampul'
  | 'sorotan'
  | 'huruf-x'
  | 'menahan'
  | 'memori'
  | 'kecepatan'
  | 'aaa50'
  | 'kualitas'

export interface CognitiveTaskDefinition {
  readonly key: CognitiveTaskKey
  readonly name: readonly [id: string, en: string]
  readonly domain: readonly [id: string, en: string]
  readonly keys: 'space' | 'fj'
  readonly trialCount: number
  readonly reportKey: CognitiveReportKey
  readonly rules: readonly (readonly [id: string, en: string])[]
  readonly short: readonly [id: string, en: string]
}

export const DEMO_FEEDBACK_MS = 650
export const DEMO_GAP_MS = 150
export const DEMO_ANTICIPATORY_MS = 150
export const DEMO_LETTERS = 'BCDFGHJKLMNPRSTVWZ'

export const COGNITIVE_TASK_DEFINITIONS: Readonly<Record<CognitiveTaskKey, CognitiveTaskDefinition>> = {
  cpt: {
    key: 'cpt',
    name: ['Tugas Huruf X', 'Letter X Task'],
    domain: ['Perhatian berkelanjutan', 'Sustained attention'],
    keys: 'space',
    trialCount: 18,
    reportKey: 'huruf-x',
    rules: [
      ['Huruf muncul satu per satu di tengah layar.', 'Letters appear one at a time in the middle of the screen.'],
      ['Tekan SPACE atau ketuk layar hanya saat huruf X muncul.', 'Press SPACE or tap the screen only when the letter X appears.'],
      ['Huruf lain: diam saja.', 'Any other letter: do nothing.'],
    ],
    short: ['Tekan hanya saat huruf X muncul.', 'Press only when the letter X appears.'],
  },
  sst: {
    key: 'sst',
    name: ['Tugas Panah & Rem', 'Arrow & Brake Task'],
    domain: ['Menghentikan respons', 'Stopping a response'],
    keys: 'fj',
    trialCount: 14,
    reportKey: 'menahan',
    rules: [
      [
        'Panah ke kiri: tekan F atau ketuk sisi kiri layar. Panah ke kanan: tekan J atau ketuk sisi kanan.',
        'Arrow left: press F or tap the left side. Arrow right: press J or tap the right side.',
      ],
      ['Kalau lingkaran berubah merah tebal, rem: jangan tekan apa pun.', 'If the circle turns thick red, brake: do not press anything.'],
      [
        'Merahnya muncul sesaat setelah panah. Kadang sempat ditahan, kadang tidak, dan itu wajar.',
        'The red appears just after the arrow. Sometimes you stop in time, sometimes not, and that is normal.',
      ],
    ],
    short: ['Ikuti arah panah, rem saat lingkaran merah.', 'Follow the arrow, brake when the circle turns red.'],
  },
  nb: {
    key: 'nb',
    name: ['Tugas Ingat Huruf', 'Letter Memory Task'],
    domain: ['Memori kerja', 'Working memory'],
    keys: 'space',
    trialCount: 12,
    reportKey: 'memori',
    rules: [
      ['Huruf muncul satu per satu.', 'Letters appear one at a time.'],
      [
        'Tekan SPACE atau ketuk layar bila huruf sama dengan huruf dua langkah sebelumnya.',
        'Press SPACE or tap the screen when the letter matches the one two steps back.',
      ],
      [
        'Contoh: T, K, T. Huruf ketiga sama dengan huruf pertama, jadi tekan.',
        'Example: T, K, T. The third letter matches the first, so press.',
      ],
    ],
    short: ['Tekan bila sama dengan huruf dua langkah sebelumnya.', 'Press when it matches the letter two steps back.'],
  },
  gng: {
    key: 'gng',
    name: ['Tugas Lingkaran & Kotak', 'Circle & Square Task'],
    domain: ['Menahan respons otomatis', 'Holding back an automatic response'],
    keys: 'space',
    trialCount: 18,
    reportKey: 'menahan',
    rules: [
      ['Lingkaran hijau: tekan SPACE atau ketuk layar secepatnya.', 'Green circle: press SPACE or tap the screen as fast as you can.'],
      ['Kotak merah: tahan, jangan tekan.', 'Red square: hold back, do not press.'],
      ['Lingkaran jauh lebih sering muncul, jadi tetap waspada.', 'Circles come up far more often, so stay alert.'],
    ],
    short: ['Tekan untuk lingkaran hijau, tahan untuk kotak merah.', 'Press for the green circle, hold for the red square.'],
  },
}

export type CognitiveTrialOutcome =
  | 'hit'
  | 'correct_rejection'
  | 'miss'
  | 'false_alarm'
  | 'anticipatory'
  | 'go_correct'
  | 'go_wrong_key'
  | 'go_omission'
  | 'stop_success'
  | 'stop_fail'
  | 'init'

export interface CognitiveTrial {
  index: number
  stim?: string
  target?: boolean
  init?: boolean
  stop?: boolean
  dir?: 'L' | 'R'
  key?: 'KeyF' | 'KeyJ'
  dur: number
  win: number
  iti?: number
  ssd?: number
  resp?: 'Space' | 'KeyF' | 'KeyJ' | null
  rt?: number | null
  outcome?: CognitiveTrialOutcome
  correct?: boolean
}

export interface CognitiveTaskSummary {
  ok: number
  tot: number
  rt: number | null
}

const randomUniform = (min: number, max: number, rng: () => number): number =>
  min + rng() * (max - min)

const shuffleArray = <T>(items: readonly T[], rng: () => number): T[] => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

const maxRunLength = (flags: readonly boolean[]): number => {
  let best = 0
  let cur = 0
  for (const flag of flags) {
    cur = flag ? cur + 1 : 0
    if (cur > best) best = cur
  }
  return best
}

/** Places target/stop flags avoiding consecutive targets or overly long target clusters. */
const spacedFlags = (total: number, count: number, minLead: number, rng: () => number): boolean[] => {
  for (let attempt = 0; attempt < 300; attempt++) {
    const picked = new Set<number>()
    const pool: number[] = []
    for (let i = minLead; i < total; i++) pool.push(i)
    const shuffled = shuffleArray(pool, rng)
    for (const idx of shuffled) {
      if (picked.size >= count) break
      if (!picked.has(idx - 1) && !picked.has(idx + 1)) {
        picked.add(idx)
      }
    }
    if (picked.size === count) {
      return Array.from({ length: total }, (_, idx) => picked.has(idx))
    }
  }
  const fallback = Array.from({ length: total }, (_, idx) => idx >= minLead && idx < minLead + count)
  return fallback
}

const pickNonExcludedLetter = (excluded: readonly string[], rng: () => number): string => {
  const candidates = [...DEMO_LETTERS].filter((letter) => !excluded.includes(letter))
  const list = candidates.length > 0 ? candidates : [...DEMO_LETTERS]
  return list[Math.floor(rng() * list.length)] ?? 'B'
}

export function generateCognitiveTrials(
  task: CognitiveTaskKey,
  rng: () => number = Math.random,
): CognitiveTrial[] {
  const n = COGNITIVE_TASK_DEFINITIONS[task].trialCount

  if (task === 'cpt') {
    let prev = ''
    return spacedFlags(n, Math.round(n * 0.25), 2, rng).map((isTarget, index) => {
      const base = Math.round(randomUniform(1000, 1400, rng))
      const stim = isTarget ? 'X' : pickNonExcludedLetter([prev], rng)
      prev = stim
      return { index, target: isTarget, stim, dur: 200, win: base - 50 }
    })
  }

  if (task === 'gng') {
    return spacedFlags(n, Math.round(n * 0.2), 2, rng).map((isNoGo, index) => {
      const base = Math.round(randomUniform(900, 1100, rng))
      return { index, target: !isNoGo, dur: 400, win: base - 50 }
    })
  }

  if (task === 'sst') {
    const stops = spacedFlags(n, Math.round(n * 0.25), 2, rng)
    const dirs = shuffleArray(
      Array.from({ length: n }, (_, idx): 'L' | 'R' => (idx < n / 2 ? 'L' : 'R')),
      rng,
    )
    return stops.map((isStop, index) => ({
      index,
      stop: isStop,
      dir: dirs[index] ?? 'L',
      key: (dirs[index] ?? 'L') === 'L' ? 'KeyF' : 'KeyJ',
      dur: 1000,
      win: 1000,
      iti: Math.round(randomUniform(400, 600, rng)),
    }))
  }

  // 2-back letter memory task
  const lag = 2
  const m = n - lag
  const nTargets = Math.round(m * 0.3)
  let types: ('T' | 'N')[] = []
  for (let t = 0; t < 400; t++) {
    types = shuffleArray(
      Array.from({ length: m }, (_, idx): 'T' | 'N' => (idx < nTargets ? 'T' : 'N')),
      rng,
    )
    if (maxRunLength(types.map((x) => x === 'T')) <= 2) break
  }

  const letters: string[] = []
  for (let i = 0; i < n; i++) {
    const kind = i < lag ? 'N' : (types[i - lag] ?? 'N')
    if (kind === 'T') {
      letters.push(letters[i - lag] ?? 'T')
    } else {
      const exclusions = [letters[i - 1], letters[i - 2], letters[i - 3]].filter(
        (val): val is string => Boolean(val),
      )
      letters.push(pickNonExcludedLetter(exclusions, rng))
    }
  }

  return letters.map((stim, index) => {
    const base = Math.round(randomUniform(2000, 2200, rng))
    return {
      index,
      stim,
      init: index < lag,
      target: index >= lag && stim === letters[index - lag],
      dur: 500,
      win: base - 50,
    }
  })
}

export function nextSstStopSignalDelay(currentSsdMs: number, respondedDuringStop: boolean): number {
  const delta = respondedDuringStop ? -50 : 50
  return Math.max(50, Math.min(900, currentSsdMs + delta))
}

const POSITIVE_OUTCOMES: ReadonlySet<CognitiveTrialOutcome> = new Set([
  'hit',
  'correct_rejection',
  'go_correct',
  'stop_success',
])

export function classifyCognitiveTrial(task: CognitiveTaskKey, trial: CognitiveTrial): CognitiveTrial {
  let outcome: CognitiveTrialOutcome
  if (task === 'sst') {
    if (trial.stop) {
      outcome = trial.resp ? 'stop_fail' : 'stop_success'
    } else if (!trial.resp) {
      outcome = 'go_omission'
    } else if (typeof trial.rt === 'number' && trial.rt < DEMO_ANTICIPATORY_MS) {
      outcome = 'anticipatory'
    } else {
      outcome = trial.resp === trial.key ? 'go_correct' : 'go_wrong_key'
    }
  } else if (trial.init) {
    outcome = trial.resp ? 'false_alarm' : 'init'
  } else if (trial.resp && typeof trial.rt === 'number' && trial.rt < DEMO_ANTICIPATORY_MS) {
    outcome = 'anticipatory'
  } else if (trial.target) {
    outcome = trial.resp ? 'hit' : 'miss'
  } else {
    outcome = trial.resp ? 'false_alarm' : 'correct_rejection'
  }

  return {
    ...trial,
    outcome,
    correct: POSITIVE_OUTCOMES.has(outcome),
  }
}

export function summarizeCognitiveTrials(trials: readonly CognitiveTrial[]): CognitiveTaskSummary {
  const scored = trials.filter((t) => t.outcome !== 'init')
  const ok = scored.filter((t) => t.correct).length
  const rts = trials
    .filter((t) => (t.outcome === 'hit' || t.outcome === 'go_correct') && typeof t.rt === 'number')
    .map((t) => t.rt as number)

  return {
    ok,
    tot: scored.length,
    rt: rts.length > 0 ? Math.round(rts.reduce((sum, val) => sum + val, 0) / rts.length) : null,
  }
}

export const COGNITIVE_REPORT_GALLERY: ReadonlyArray<{
  key: CognitiveReportKey
  fileBase: string
  width: number
  height: number
  caption: readonly [id: string, en: string]
}> = [
  { key: 'sampul', fileBase: 'sampul', width: 1200, height: 850, caption: ['Sampul & ringkasan laporan', 'Report cover & overview'] },
  { key: 'huruf-x', fileBase: 'huruf-x', width: 1200, height: 850, caption: ['Tugas Huruf X — Perhatian berkelanjutan', 'Letter X Task — Sustained attention'] },
  { key: 'menahan', fileBase: 'menahan', width: 1200, height: 850, caption: ['Tugas Panah & Rem / Lingkaran & Kotak', 'Arrow & Brake / Circle & Square Tasks'] },
  { key: 'memori', fileBase: 'memori', width: 1200, height: 850, caption: ['Tugas Ingat Huruf — Memori kerja', 'Letter Memory Task — Working memory'] },
  { key: 'kecepatan', fileBase: 'kecepatan', width: 1200, height: 850, caption: ['Profil kecepatan respons', 'Response speed profile'] },
  { key: 'aaa50', fileBase: 'aaa50', width: 1200, height: 850, caption: ['Ringkasan Kuesioner AAA-50', 'AAA-50 Questionnaire summary'] },
  { key: 'kualitas', fileBase: 'kualitas', width: 1200, height: 850, caption: ['Indikator kualitas pengerjaan', 'Task validity & quality indicators'] },
]

export function getCognitiveReportImageUrl(key: CognitiveReportKey, locale: 'id' | 'en'): string {
  const prefix = locale === 'en' ? 'en' : 'id'
  return `/media/services/reports/${prefix}-${key}.webp`
}

// ============================================================================
// AAA-50 Self-Report Helpers (In-Memory State Only, Zero Storage)
// ============================================================================

export type Aaa50AnswerValue = string | number | (string | number)[]
export type Aaa50Answers = Record<number, Aaa50AnswerValue>

export type Aaa50FlowStep =
  | { kind: 'intro'; section: Aaa50Section; sectionIndex: number; itemCount: number }
  | { kind: 'item'; section: Aaa50Section; item: Aaa50Item }
  | { kind: 'done' }

export function buildAaa50Flow(): Aaa50FlowStep[] {
  const steps: Aaa50FlowStep[] = []
  AAA50_DATASET.sections.forEach((section, sectionIndex) => {
    const sectionItems = AAA50_DATASET.items.filter((item) => item.sec === section.id)
    steps.push({ kind: 'intro', section, sectionIndex, itemCount: sectionItems.length })
    sectionItems.forEach((item) => {
      steps.push({ kind: 'item', section, item })
    })
  })
  steps.push({ kind: 'done' })
  return steps
}

export function getAaa50Options(item: Aaa50Item): readonly Aaa50ScaleOption[] {
  if (item.opts) {
    return item.opts.map((opt) => [opt.v, opt.id, opt.en, opt.excl] as const)
  }
  return AAA50_DATASET.scales[item.type] ?? []
}

export function isAaa50Answered(item: Aaa50Item, value: Aaa50AnswerValue | undefined): boolean {
  if (item.type === 'text') return true
  if (item.type === 'multi') return Array.isArray(value) && value.length > 0
  return (typeof value === 'string' && value.length > 0) || (typeof value === 'number' && Number.isFinite(value))
}

export function countAaa50Answered(answers: Aaa50Answers): number {
  return AAA50_DATASET.items.filter(
    (item) => item.type !== 'text' && isAaa50Answered(item, answers[item.n]),
  ).length
}

export function getAaa50RequiredTotal(): number {
  return AAA50_DATASET.items.filter((item) => item.type !== 'text').length
}

export function toggleAaa50MultiOption(
  current: Aaa50AnswerValue | undefined,
  item: Aaa50Item,
  optionValue: string | number,
): (string | number)[] {
  const list = Array.isArray(current) ? [...current] : []
  if (list.includes(optionValue)) {
    return list.filter((entry) => entry !== optionValue)
  }
  const options = getAaa50Options(item)
  const picked = options.find((opt) => opt[0] === optionValue)
  if (picked?.[3]) {
    return [optionValue]
  }
  const exclusiveValues = new Set(options.filter((opt) => opt[3]).map((opt) => opt[0]))
  return [...list.filter((entry) => !exclusiveValues.has(entry)), optionValue]
}

const formatAaa50AnswerValue = (value: Aaa50AnswerValue | undefined): string => {
  if (value == null || value === '') return '-'
  if (Array.isArray(value)) return value.length > 0 ? value.join('+') : '-'
  return String(value)
}

export function formatAaa50Message(answers: Aaa50Answers, locale: 'id' | 'en'): string {
  const head =
    locale === 'en'
      ? 'Hello Attentive Admin, I have completed the AAA-50 Questionnaire on the service menu and would like to get the report. Please let me know the fee and next steps.'
      : 'Halo Admin Attentive, saya sudah mengisi Kuesioner AAA-50 di buku menu layanan dan ingin mendapatkan laporannya. Mohon info biaya dan langkah berikutnya.'

  const sectionLines = AAA50_DATASET.sections
    .filter((section) => section.id !== 'F')
    .map((section) => {
      const pairs = AAA50_DATASET.items
        .filter((item) => item.sec === section.id)
        .map((item) => `${item.n}=${formatAaa50AnswerValue(answers[item.n])}`)
        .join(' ')
      return `${section.id}: ${pairs}`
    })

  const textLines = AAA50_DATASET.items
    .filter((item) => item.type === 'text')
    .map((item) => {
      const raw = answers[item.n]
      const textVal = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : '-'
      return `${item.n}: ${textVal}`
    })

  const label = locale === 'en' ? 'AAA-50 answers' : 'Jawaban AAA-50'
  return `${head}\n\n${label}:\n${sectionLines.join('\n')}\n${textLines.join('\n')}`
}

export function buildAaa50WhatsAppUrl(
  whatsappNumber: string,
  answers: Aaa50Answers,
  locale: 'id' | 'en',
): string {
  const digits = whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(formatAaa50Message(answers, locale))}`
}
