/**
 * MHCU report data: the input every report render function needs. Interfaces only (no logic, no I/O).
 *
 * Derived from the six report pages of the team's v7 demo (extracted in docs/assessments-work/mhcu-v7-docs/):
 *   c1  / c1en   client report, single check-up (T1), 1 page
 *   c5  / c5en   client report, longitudinal (T2..Tn), 2 pages: latest result with the previous one, then the progress page
 *   c4r          client report that starts from a Priority (level 5) first result; same layout as c5
 *   p1           psychologist report, single check-up (T1), 3 pages: summary, triggers, response appendix
 *   p5 / p4r     psychologist report, longitudinal, 4 pages: summary, triggers + trend + comparison, response appendix
 * "r" in c4r / p4r only names the demo participant, not a different layout.
 *
 * A render function takes one of MhcuClientReportData / MhcuPsychologistReportData. All numbers are the raw scorer
 * output (no rounding); the renderer rounds to 1 decimal and uses a decimal comma for Indonesian.
 */

import type { MhcuCategory, MhcuResult } from './mhcu'
import type { MhcuChange, MhcuDomainChange, MhcuLevelChange } from './mhcu-longitudinal'

export type MhcuReportLang = 'id' | 'en'

/** Which layout a report uses (see the file header) */
export type MhcuReportKind = 'client_single' | 'client_longitudinal' | 'psychologist_single' | 'psychologist_longitudinal'

/** Header block shared by all six pages ("NAMA", "NO. LAPORAN", "USIA/JENIS KELAMIN", ...) */
export interface MhcuReportHeader {
  lang: MhcuReportLang
  name: string
  /** AT-MHCU-2026-122 */
  reportNo: string
  /** P00001. Printed on the psychologist report ("NO. LAPORAN/ID PESERTA") and on the client progress page */
  participantId: string
  age: number
  /** "Perempuan" / "Laki-laki" (already translated for the report language) */
  sex: string
  /** Moment of the check-up, "YYYY-MM-DD HH:MM:SS"; the client report prints the date only, the psychologist report date and time */
  examinedAt: string
  /** Position of this check-up in the person's history: T1, T2, ... "T5 (5/5)" on the psychologist report */
  waveNo: number
  /** How many check-ups the person has up to and including this one */
  waveCount: number
  /** "2 minggu terakhir" / "Past 2 weeks" */
  period: { id: string; en: string }
  psychologist: {
    name: string
    /** "No. SIPP: ____" is printed blank on the demo; fill when known */
    sipp: string | null
  }
  /** WHATSAPP/EMAIL line (psychologist report only) */
  clientContact: { whatsapp: string; email: string }
  /** TANGGAL LAPORAN (client report, signature block): "YYYY-MM-DD" */
  reportDate: string
}

/** The Mental Health Index block: number, status, the sentence why this level, and the position marker on the reference bar. */
export interface MhcuReportSummary {
  mhi: number | null
  level: 1 | 2 | 3 | 4 | 5
  levelName: { id: string; en: string }
  /** "Level 2 ditetapkan karena ada area yang mencapai ambang peninjauan, walaupun skor MHI ..." (built from redFlags/triggers) */
  reason: { id: string; en: string }
  /** MHI band of the reference bar: Perlu Perhatian Serius 0-40, Perlu Perhatian 40-55, Perlu Dipantau 55-70, Baik 70-100 */
  band: MhcuResult['mhiBand']
  /** Incomplete data (MHI null) must be printed as such instead of a number */
  incomplete: boolean
}

/** One row of the "HASIL PER INDEKS" table of the client report (DI, WI, BHI). */
export interface MhcuClientIndexRow {
  key: 'di' | 'wi' | 'bhi'
  value: number | null
  category: MhcuCategory | null
  higherIsBetter: boolean
  /** "NILAI RUJUKAN": the category bands as text, e.g. "Minimal 0-9,9; Ringan 10-24,9; ..." (derive from MHCU_CATEGORIES) */
  referenceRanges: { id: string; en: string }
  /** Previous check-up (T(n-1)) and the change to it: only on longitudinal reports, null on T1 */
  previous: { waveNo: number; value: number | null; change: MhcuChange } | null
}

/** "KETERANGAN PSIKOLOG": the psychologist's note shown to the client (template paragraph edited by the psychologist + custom text). */
export interface MhcuPsychologistNote {
  /** Paragraph 1: what the check-up looked at and where the result falls (auto text, with the "previous check-up" sentence from T2 on) */
  explanation: string
  /** Paragraph 2: recommendation (template for the level + the psychologist's special advice) */
  recommendation: string
  /** final = released; reports are only sent when the note is final */
  status: 'draft' | 'final'
  finalizedBy: string | null
}

/** Progress block shared by the client page 2 and the psychologist page 2 (trend chart + comparison table). */
export interface MhcuProgressWave {
  waveNo: number
  /** YYYY-MM-DD (printed dd/mm/yy in the table header) */
  date: string
  mhi: number | null
  level: number
  di: number | null
  wi: number | null
  bhi: number | null
  /** Psychologist report only: the 13 domain scores and the WI / BHI dimensions of this wave */
  domains?: (number | null)[]
  wiDims?: (number | null)[]
  bhiDims?: (number | null)[]
}

export interface MhcuProgressData {
  /** T1..Tn in order. The MHI trend chart draws these against the bands (RENTANG RUJUKAN): Baik 70-100, Perlu Dipantau 55-70, Perlu Perhatian 40-55, Perlu Perhatian Serius 0-40 */
  waves: MhcuProgressWave[]
  /** "RENTANG PEMANTAUAN": first and last date */
  firstDate: string
  lastDate: string
  /** "Selama 112 hari dan 5 kali pengukuran" */
  spanDays: number
  waveCount: number
  /** First -> last comparison ("PERUBAHAN T1 ke Tn"); each index with its word (Membaik bermakna ...) */
  firstToLast: {
    mhi: MhcuChange
    di: MhcuChange
    wi: MhcuChange
    bhi: MhcuChange
    level: MhcuLevelChange
    /** Psychologist report: change per WI dimension (3), BHI dimension (3) and Part A domain (13) */
    wiDims?: MhcuChange[]
    bhiDims?: MhcuChange[]
    domains?: MhcuDomainChange[]
  }
  /** "RINGKASAN PERKEMBANGAN" paragraph inputs (the renderer writes the sentence): from/to level and MHI */
  summary: {
    mhiFrom: number | null
    mhiTo: number | null
    levelFrom: number
    levelTo: number
  }
}

/** c1, c1en (single) and c5, c5en, c4r (longitudinal): the CLIENT report. */
export interface MhcuClientReportData {
  kind: 'client_single' | 'client_longitudinal'
  header: MhcuReportHeader
  summary: MhcuReportSummary
  /** DI, WI, BHI rows; WI shows the WEMWBS total in the psychologist report only */
  indices: MhcuClientIndexRow[]
  note: MhcuPsychologistNote
  /** Page 2 of the longitudinal report; null for a single check-up (c1 has one page) */
  progress: MhcuProgressData | null
}

/* ============================== psychologist report ============================== */

/**
 * Percentile of a score against the Attentive reference sample ("P93"). Null when the reference sample is not available.
 * Higher percentile = higher score; for DI and symptom areas a high percentile means more symptoms.
 */
export type MhcuPercentile = number | null

export interface MhcuReferenceNote {
  /** n = 87 */
  n: number
  /** "2026-11-05 s.d. 2026-11-20" */
  from: string
  to: string
}

/** One row of the psychologist's "HASIL PER INDEKS, DIMENSI, DAN AREA" table (23 rows: MHI, DI + 13 areas, WI + 3 dims, BHI + 3 dims, ATI). */
export interface MhcuPsychologistRow {
  kind: 'index' | 'domain' | 'dimension'
  /** MHI, DI, WI, BHI, ATI, or domain/dimension key */
  key: string
  label: { id: string; en: string }
  value: number | null
  /** "0-100" or "0-4" */
  range: '0-100' | '0-4'
  /** Category text (Baik, Ringan, Rata-rata, Sangat ringan ...); for domains the severity word of the 0-4 score */
  category: { id: string; en: string } | null
  percentile: MhcuPercentile
  /** Asterisk: the area reached its review threshold (domains only) */
  flagged: boolean
  /** WEMWBS total printed next to WI ("WEMWBS 57/70") */
  wbTotal?: number | null
  /** DI/WI/BHI hint ("semakin rendah semakin baik") */
  higherIsBetter?: boolean
}

export interface MhcuTriggerBlock {
  /** "PEMICU STATUS DAN TINDAK LANJUT": the trigger sentence(s), both languages (MhcuResult.reasons) */
  triggers: { id: string; en: string }[]
  /** Waktu respons: "2 minggu" */
  responseTime: { id: string; en: string }
  /** Tindak lanjut */
  followUp: { id: string; en: string }
}

/** One answered item for the "Lampiran 1: Respons Kuesioner" pages (58 items: A 23, B 14, C 15, D 6). */
export interface MhcuAppendixItem {
  part: 'cc' | 'wb' | 'hb' | 'ati'
  n: number
  text: { id: string; en: string }
  /** The chosen answer; null = not answered */
  answer: number | null
}

/** p1 (single, 3 pages) and p5, p4r (longitudinal, 4 pages): the PSYCHOLOGIST report. Internal document, never given to the client. */
export interface MhcuPsychologistReportData {
  kind: 'psychologist_single' | 'psychologist_longitudinal'
  header: MhcuReportHeader
  summary: MhcuReportSummary
  /** The percentile table */
  rows: MhcuPsychologistRow[]
  reference: MhcuReferenceNote | null
  triggers: MhcuTriggerBlock
  /** Pages 2-3 of the longitudinal report (trend + full comparison); null for a single check-up */
  progress: MhcuProgressData | null
  /** Appendix: every answer as given */
  appendix: MhcuAppendixItem[]
  /** "KETERANGAN YANG DITERIMA KLIEN": exactly what the client gets, plus "Status catatan: final, <psychologist>" */
  clientNote: MhcuPsychologistNote
  /** The scorer output this report was built from, for traceability */
  result: MhcuResult
}

export type MhcuReportData = MhcuClientReportData | MhcuPsychologistReportData
