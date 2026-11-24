/**
 * MHCU report builders: pure functions that turn stored sessions into the input of the report renderers
 * (MhcuClientReportData for the client report c1/c5, MhcuPsychologistReportData for the psychologist report p1/p5).
 *
 * Everything a report prints is derived from the stored answers (re-scored with scoreMhcu, never from stored text),
 * the participant's other sessions (longitudinal), the reference sample (percentiles) and a few inputs that come from
 * outside the data: the psychologist (name, SIPP), the psychologist's note text and the report date.
 *
 * Scores are rounded to 2 decimals before anything else is computed, exactly as the demo's database stores them, so
 * changes, the "bermakna" test (>= 5 points) and the percentiles equal the demo.
 */

import {
  MHCU_CATEGORIES,
  MHCU_LEVELS,
  MHCU_ITEMS,
  scoreMhcu,
  type MhcuCategory,
  type MhcuResult,
} from './mhcu'
import {
  buildHistory,
  compareMetric,
  compareWaves,
  compareLevel,
  roundedDaysBetween,
  type MhcuChange,
  type MhcuSessionInput,
  type MhcuWave,
} from './mhcu-longitudinal'
import { MHCU_REFERENCE, mhcuDomainMetric, percentile } from './mhcu-reference'
import type {
  MhcuAppendixItem,
  MhcuClientIndexRow,
  MhcuClientReportData,
  MhcuProgressData,
  MhcuProgressWave,
  MhcuPsychologistNote,
  MhcuPsychologistReportData,
  MhcuPsychologistRow,
  MhcuReportHeader,
  MhcuReportLang,
  MhcuReportSummary,
} from './mhcu-report-data'

/* ============================== input ============================== */

/** A stored check-up, as the database will hold it. The score is recomputed from `answers`. */
export interface MhcuStoredSession {
  sessionId: string
  /** AT-MHCU-2026-122 */
  reportNo: string
  /** P00001 */
  participantId: string
  /** "YYYY-MM-DD HH:MM:SS" (local time as stored) or ISO */
  submittedAt: string
  lang: MhcuReportLang
  name: string
  /** As stored: "Perempuan (Female)", "Laki-laki (Male)" or "Lainnya: ..." */
  sex: string
  age: number
  phone: string
  email: string
  /** Item code (CC01..ATI06) -> answer, as posted */
  answers: Readonly<Record<string, number>>
  /** The scorer output for `answers` (scoreMhcu); when absent the builder computes it */
  result?: MhcuResult
}

/** Inputs that come from outside the sessions */
export interface MhcuReportExtras {
  /** Examining psychologist (null = none assigned yet) */
  psychologist: { name: string; sipp: string | null } | null
  /** The psychologist's note. `explanation` is generated when absent; the recommendation (template for the level + custom text) is always an input */
  note: { explanation?: string; recommendation: string; status: 'draft' | 'final'; finalizedBy: string | null } | null
  /** "YYYY-MM-DD" */
  reportDate: string
}

export interface MhcuReportBuildInput {
  /** The check-up the report is about */
  session: MhcuStoredSession
  /** All sessions of the same participant (the current one may be included; later ones are ignored) */
  history: readonly MhcuStoredSession[]
  extras: MhcuReportExtras
}

/* ============================== formatting ============================== */

const round2 = (v: number | null): number | null => (v === null ? null : Math.round(v * 100) / 100)
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** One decimal, decimal comma for Indonesian: 76,1 / 76.1 */
export function formatOneDecimal(v: number, lang: MhcuReportLang): string {
  const s = (Math.round(v * 10) / 10).toFixed(1)
  return lang === 'id' ? s.replace('.', ',') : s
}

/** "23 Oktober 2026" / "23 October 2026" from "YYYY-MM-DD..." */
export function formatLongDate(stamp: string, lang: MhcuReportLang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(stamp)
  if (!m) return stamp
  const months = lang === 'id' ? MONTHS_ID : MONTHS_EN
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`
}

/** Sex as printed on the report: "Perempuan" / "Female", "Laki-laki" / "Male"; "Lainnya: x" is kept as typed. */
export function reportSex(stored: string, lang: MhcuReportLang): string {
  const m = /^(.*?)\s*\((.*)\)\s*$/.exec(stored)
  if (m) return lang === 'id' ? (m[1] as string) : (m[2] as string)
  return stored
}

function trimNumber(v: number, lang: MhcuReportLang): string {
  const s = String(Math.round(v * 10) / 10)
  return lang === 'id' ? s.replace('.', ',') : s
}

/** "Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100" (the NILAI ACUAN cell) */
export function referenceRangesText(kind: 'di' | 'wi' | 'bhi', lang: MhcuReportLang): string {
  const { lo, id, en } = MHCU_CATEGORIES[kind]
  const names = lang === 'id' ? id : en
  return lo
    .map((from, i) => {
      const next = lo[i + 1]
      const to = next === undefined ? 100 : Math.round((next - 0.1) * 10) / 10
      return `${names[i]} ${trimNumber(from, lang)}-${trimNumber(to, lang)}`
    })
    .join('; ')
}

const SEVERITY = {
  id: ['Tidak ada', 'Sangat ringan', 'Ringan', 'Sedang', 'Berat'],
  en: ['None', 'Slight', 'Mild', 'Moderate', 'Severe'],
} as const

const PERIOD = { id: '2 minggu terakhir', en: 'Past 2 weeks' } as const

/* ============================== session -> scores ============================== */

function resultOf(s: MhcuStoredSession): MhcuResult {
  return s.result ?? scoreMhcu(s.answers)
}

/** The scores of a session as the history and the reports use them: rounded to 2 decimals (as stored in the demo's database). */
function toSessionInput(s: MhcuStoredSession): MhcuSessionInput {
  const r = resultOf(s)
  return {
    sessionId: s.sessionId,
    reportCode: s.reportNo,
    submittedAt: s.submittedAt,
    mhi: round2(r.mhi),
    level: r.level,
    di: round2(r.di),
    wi: round2(r.wi),
    bhi: round2(r.bhi),
    wiDims: r.wiDims.map((d) => round2(d.score)),
    bhiDims: r.bhiDims.map((d) => round2(d.score)),
    domains: r.domains.map((d) => d.score),
  }
}

interface Context {
  s: MhcuStoredSession
  r: MhcuResult
  /** Waves of the participant up to and including this session */
  waves: MhcuWave[]
  wave: MhcuWave
  lang: MhcuReportLang
}

function contextOf(input: MhcuReportBuildInput): Context {
  const { session } = input
  const all = new Map<string, MhcuStoredSession>()
  for (const h of input.history) if (h.participantId === session.participantId) all.set(h.sessionId, h)
  all.set(session.sessionId, session)
  const history = buildHistory([...all.values()].map(toSessionInput), session.participantId)
  const upTo = history.waves.findIndex((w) => w.sessionId === session.sessionId)
  const waves = history.waves.slice(0, upTo + 1)
  return { s: session, r: resultOf(session), waves, wave: waves[waves.length - 1] as MhcuWave, lang: session.lang }
}

/** MHI band of the reference bar. The report names the bands like the levels they stand for (Baik, Perlu Dipantau, Perlu Perhatian, Perlu Perhatian Serius). */
function bandOf(r: MhcuResult): MhcuReportSummary['band'] {
  if (!r.mhiBand || r.mhiLevel === null) return null
  const level = MHCU_LEVELS[r.mhiLevel]
  return { index: r.mhiBand.index, id: level.id, en: level.en }
}

/* ============================== texts ============================== */

/** "Level 2 ditetapkan karena ..." (why the final level is what it is). Both languages. */
export function buildLevelReason(r: MhcuResult): { id: string; en: string } {
  const L = r.level
  const raised = r.mhiLevel !== null && L > r.mhiLevel
  const idParts: string[] = []
  const enParts: string[] = []
  if (r.redFlags.r1 === L && L === 5) {
    idParts.push('ada jawaban 1 atau lebih pada item Pikiran Menyakiti Diri (CC11)')
    enParts.push('there is an answer of 1 or more on Thoughts of Hurting Oneself (CC11)')
  }
  if (r.redFlags.r1 === L && L === 4) {
    idParts.push('ada jawaban 1 atau lebih pada item Gejala Psikotik (CC12/CC13)')
    enParts.push('there is an answer of 1 or more on a psychosis-related item (CC12/CC13)')
  }
  if (r.redFlags.r2 === L) {
    idParts.push('ada area yang mencapai ambang peninjauan')
    enParts.push('some areas reached the review threshold')
  }
  if (r.redFlags.r3 === L) {
    idParts.push('total well-being (WEMWBS) berada pada rentang peninjauan')
    enParts.push('the WEMWBS well-being total is in the review range')
  }
  if (!raised) {
    if (L === 1) {
      return {
        id: 'Level 1 ditetapkan karena skor MHI berada pada rentang Baik dan tidak ada pemicu lain.',
        en: 'Level 1 is assigned because the MHI is in the Good range and nothing else was triggered.',
      }
    }
    return { id: `Level ${L} ditetapkan berdasarkan skor MHI.`, en: `Level ${L} is assigned based on the MHI score.` }
  }
  return {
    id: `Level ${L} ditetapkan karena ${idParts.join(' dan ')}, walaupun skor MHI berada pada rentang yang lebih baik.`,
    en: `Level ${L} is assigned because ${enParts.join(' and ')}, even though the MHI itself falls in a better range.`,
  }
}

const EXPLAIN_ID =
  'Pemeriksaan ini melihat kondisi kesehatan mental Anda dalam dua minggu terakhir. Distress Index (DI) menggambarkan keluhan psikologis yang Anda alami, misalnya pada suasana hati, pikiran, kondisi tubuh, dan kegiatan sehari-hari. Well-being Index (WI) menggambarkan seberapa baik Anda merasa dan menjalani keseharian, termasuk hubungan Anda dengan orang lain. Behavioral Health Index (BHI) menggambarkan kebiasaan sehari-hari seperti istirahat, merawat diri, bersosialisasi, dan kegiatan yang Anda anggap bermakna.'
const EXPLAIN_EN =
  'This check-up looks at your mental health over the past two weeks. The Distress Index (DI) reflects the psychological complaints you have been experiencing, for example in your mood, thoughts, body and daily activities. The Well-being Index (WI) reflects how well you have been feeling and functioning, including your relationships with other people. The Behavioral Health Index (BHI) reflects daily habits such as rest, self-care, social contact and activities you find meaningful.'

/** The first paragraph of "KETERANGAN PSIKOLOG": what the check-up shows, plus the comparison with the previous check-up. */
export function buildExplanation(r: MhcuResult, waves: readonly MhcuWave[], lang: MhcuReportLang): string {
  const intro = lang === 'id' ? EXPLAIN_ID : EXPLAIN_EN
  if (r.mhi === null || !r.diCategory || !r.wiCategory || !r.bhiCategory) return intro
  const wave = waves[waves.length - 1] as MhcuWave
  const mhi = wave.mhi as number
  const levelName = lang === 'id' ? r.levelName.id : r.levelName.en
  const cat = (c: MhcuCategory): string => (lang === 'id' ? c.id : c.en).toLowerCase()
  const body =
    lang === 'id'
      ? `Tingkat distres Anda berada pada kategori ${cat(r.diCategory)}, kesejahteraan mental pada kategori ${cat(r.wiCategory)}, dan perilaku sehat pada kategori ${cat(r.bhiCategory)}. Dari ketiganya diperoleh MHI ${formatOneDecimal(mhi, lang)} dari 100 dengan status ${levelName} (Level ${r.level}).`
      : `Your distress is in the ${cat(r.diCategory)} category, your well-being is ${cat(r.wiCategory)} and your healthy behaviour is ${cat(r.bhiCategory)}. Together these give an MHI of ${formatOneDecimal(mhi, lang)} out of 100, with an overall status of ${levelName} (Level ${r.level}).`
  const prev = waves.length > 1 ? (waves[waves.length - 2] as MhcuWave) : null
  let previous = ''
  if (prev && prev.mhi !== null) {
    const delta = Math.round((mhi - prev.mhi) * 10) / 10
    const abs = formatOneDecimal(Math.abs(delta), lang)
    const when = `T${prev.waveNo}, ${formatLongDate(prev.submittedAt, lang)}`
    if (lang === 'id') {
      const move = delta > 0 ? `naik ${abs} poin` : delta < 0 ? `turun ${abs} poin` : 'tidak berubah'
      previous = ` Pada pengukuran sebelumnya (${when}) MHI Anda ${formatOneDecimal(prev.mhi, lang)}, jadi ${move}.`
    } else {
      const move = delta > 0 ? `so it has risen by ${abs} points` : delta < 0 ? `so it has fallen by ${abs} points` : 'so it has not changed'
      previous = ` At your previous measurement (${when}) your MHI was ${formatOneDecimal(prev.mhi, lang)}, ${move}.`
    }
  }
  return `${intro} ${body}${previous}`
}

/* ============================== shared blocks ============================== */

function buildHeader(c: Context, extras: MhcuReportExtras, forPsychologist: boolean): MhcuReportHeader {
  return {
    lang: c.lang,
    name: c.s.name,
    reportNo: c.s.reportNo,
    participantId: c.s.participantId,
    age: c.s.age,
    sex: reportSex(c.s.sex, c.lang),
    examinedAt: c.s.submittedAt,
    waveNo: c.wave.waveNo,
    waveCount: c.waves.length,
    period: { ...PERIOD },
    psychologist: { name: extras.psychologist?.name ?? '', sipp: extras.psychologist?.sipp ?? null },
    clientContact: forPsychologist ? { whatsapp: c.s.phone, email: c.s.email } : { whatsapp: '', email: '' },
    reportDate: extras.reportDate,
  }
}

function buildSummary(c: Context): MhcuReportSummary {
  return {
    mhi: c.wave.mhi,
    level: c.r.level,
    levelName: { ...c.r.levelName },
    reason: buildLevelReason(c.r),
    band: bandOf(c.r),
    incomplete: c.r.incomplete,
  }
}

function buildNote(c: Context, extras: MhcuReportExtras): MhcuPsychologistNote {
  const note = extras.note
  return {
    explanation: note?.explanation ?? buildExplanation(c.r, c.waves, c.lang),
    recommendation: note?.recommendation ?? '',
    status: note?.status ?? 'draft',
    finalizedBy: note?.finalizedBy ?? null,
  }
}

function buildProgress(c: Context, withDetail: boolean): MhcuProgressData | null {
  if (c.waves.length < 2) return null
  const first = c.waves[0] as MhcuWave
  const last = c.wave
  const cmp = compareWaves(first, last)
  const waves: MhcuProgressWave[] = c.waves.map((w) => {
    const base: MhcuProgressWave = { waveNo: w.waveNo, date: w.submittedDate, mhi: w.mhi, level: w.level, di: w.di, wi: w.wi, bhi: w.bhi }
    if (withDetail) {
      base.domains = [...(w.domains ?? [])]
      base.wiDims = [...(w.wiDims ?? [])]
      base.bhiDims = [...(w.bhiDims ?? [])]
    }
    return base
  })
  return {
    waves,
    firstDate: first.submittedDate,
    lastDate: last.submittedDate,
    spanDays: roundedDaysBetween(first.submittedAt, last.submittedAt),
    waveCount: c.waves.length,
    firstToLast: {
      mhi: cmp.mhi,
      di: cmp.di,
      wi: cmp.wi,
      bhi: cmp.bhi,
      level: compareLevel(first.level, last.level),
      ...(withDetail ? { wiDims: cmp.wiDims, bhiDims: cmp.bhiDims, domains: cmp.domains } : {}),
    },
    summary: { mhiFrom: first.mhi, mhiTo: last.mhi, levelFrom: first.level, levelTo: last.level },
  }
}

/* ============================== client report ============================== */

/** Input of renderClientReport: c1/c1en (single check-up) and c5/c5en/c4r (longitudinal). */
export function buildClientReportData(input: MhcuReportBuildInput): MhcuClientReportData {
  const c = contextOf(input)
  const prev = c.waves.length > 1 ? (c.waves[c.waves.length - 2] as MhcuWave) : null
  const rows: [MhcuClientIndexRow['key'], number | null, MhcuCategory | null, boolean][] = [
    ['di', c.wave.di, c.r.diCategory, false],
    ['wi', c.wave.wi, c.r.wiCategory, true],
    ['bhi', c.wave.bhi, c.r.bhiCategory, true],
  ]
  const indices: MhcuClientIndexRow[] = rows.map(([key, value, category, higherIsBetter]) => {
    const prevValue = prev ? prev[key] : null
    const change: MhcuChange | null = prev ? compareMetric(key, prevValue, value) : null
    return {
      key,
      value,
      category,
      higherIsBetter,
      referenceRanges: { id: referenceRangesText(key, 'id'), en: referenceRangesText(key, 'en') },
      previous: prev && change ? { waveNo: prev.waveNo, value: prevValue, change } : null,
    }
  })
  return {
    kind: c.waves.length > 1 ? 'client_longitudinal' : 'client_single',
    header: buildHeader(c, input.extras, false),
    summary: buildSummary(c),
    indices,
    note: buildNote(c, input.extras),
    progress: buildProgress(c, false),
  }
}

/* ============================== psychologist report ============================== */

function severity(score: number | null): { id: string; en: string } | null {
  if (score === null) return null
  return { id: SEVERITY.id[score] ?? '', en: SEVERITY.en[score] ?? '' }
}

/** Input of renderPsychologistReport: p1 (single check-up) and p5/p4r (longitudinal). */
export function buildPsychologistReportData(input: MhcuReportBuildInput): MhcuPsychologistReportData {
  const c = contextOf(input)
  const { r, wave } = c
  const rows: MhcuPsychologistRow[] = []
  const cat = (x: MhcuCategory | null): { id: string; en: string } | null => (x ? { id: x.id, en: x.en } : null)
  const index = (key: string, label: { id: string; en: string }, value: number | null, category: { id: string; en: string } | null, metric: Parameters<typeof percentile>[0], higherIsBetter: boolean, wbTotal?: number | null): MhcuPsychologistRow => ({
    kind: 'index',
    key,
    label,
    value,
    range: '0-100',
    category,
    percentile: percentile(metric, value),
    flagged: false,
    higherIsBetter,
    ...(wbTotal !== undefined ? { wbTotal } : {}),
  })
  rows.push(index('MHI', { id: 'Mental Health Index (MHI)', en: 'Mental Health Index (MHI)' }, wave.mhi, bandOf(r) ? { id: (bandOf(r) as { id: string }).id, en: (bandOf(r) as { en: string }).en } : null, 'mhi', true))
  rows.push(index('DI', { id: 'Distress Index (DI)', en: 'Distress Index (DI)' }, wave.di, cat(r.diCategory), 'di', false))
  r.domains.forEach((d) => {
    rows.push({
      kind: 'domain',
      key: d.id,
      label: { id: d.id, en: d.en },
      value: d.score,
      range: '0-4',
      category: severity(d.score),
      percentile: percentile(mhcuDomainMetric(d.n), d.score),
      flagged: d.flagged,
    })
  })
  const dimRows = (kind: 'wi' | 'bhi'): void => {
    const dims = kind === 'wi' ? r.wiDims : r.bhiDims
    const keys = kind === 'wi' ? (['wiPA', 'wiPF', 'wiPR'] as const) : (['bhiSC', 'bhiSO', 'bhiMA'] as const)
    const categories = kind === 'wi' ? 'wi' : 'bhi'
    dims.forEach((d, i) => {
      const value = round2(d.score)
      let category: { id: string; en: string } | null = null
      if (value !== null) {
        const lo = MHCU_CATEGORIES[categories].lo
        let k = 0
        for (let j = 0; j < lo.length; j++) if (value >= (lo[j] as number)) k = j
        category = { id: MHCU_CATEGORIES[categories].id[k] as string, en: MHCU_CATEGORIES[categories].en[k] as string }
      }
      rows.push({
        kind: 'dimension',
        key: d.id,
        label: { id: d.id, en: d.en },
        value,
        range: '0-100',
        category,
        percentile: percentile(keys[i] as (typeof keys)[number], value),
        flagged: false,
      })
    })
  }
  rows.push(index('WI', { id: 'Well-being Index (WI)', en: 'Well-being Index (WI)' }, wave.wi, cat(r.wiCategory), 'wi', true, r.wbTotal))
  dimRows('wi')
  rows.push(index('BHI', { id: 'Behavioral Health Index (BHI)', en: 'Behavioral Health Index (BHI)' }, wave.bhi, cat(r.bhiCategory), 'bhi', true))
  dimRows('bhi')
  const atiIndex = round2(r.ati.index)
  rows.push(index('ATI', { id: 'Attentive Index (ATI)', en: 'Attentive Index (ATI)' }, atiIndex, cat(r.ati.category), 'ati', true))

  const appendix: MhcuAppendixItem[] = MHCU_ITEMS.map((it) => ({
    part: it.part,
    n: it.n,
    text: { id: it.id, en: it.en },
    answer: typeof c.s.answers[it.code] === 'number' ? (c.s.answers[it.code] as number) : null,
  }))

  return {
    kind: c.waves.length > 1 ? 'psychologist_longitudinal' : 'psychologist_single',
    header: buildHeader(c, input.extras, true),
    summary: buildSummary(c),
    rows,
    reference: { ...MHCU_REFERENCE },
    triggers: {
      // the demo's English wording drops the "Warwick benchmark: " prefix of the scorer's text
      triggers: r.reasons.map((x) => ({ id: x.id, en: x.en.replace('Warwick benchmark: ', '') })),
      responseTime: { id: r.followUp.responseTimeId, en: r.followUp.responseTimeEn },
      followUp: { id: r.followUp.actionId, en: r.followUp.actionEn },
    },
    progress: buildProgress(c, true),
    appendix,
    clientNote: buildNote(c, input.extras),
    result: r,
  }
}
