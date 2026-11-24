/**
 * The raw-answers sheet in Drive: one row per Mental Health Check-Up with who answered (meta data), the scores, and every answer in
 * its own column (CC01 ... ATI06), exactly as the person gave it. It lives in the Reports folder next to the report PDFs.
 */

import { MHCU_ITEMS } from '@attentiveid/shared'
import type { AssessmentRow } from '../repositories/assessments.repository'
import { toJakartaIso } from './free-session-sheet'

export const RAW_SHEET_TITLE = 'MHCU Raw Answers'
export const RAW_SHEET_TAB = 'Answers'

const META_HEADERS = [
    'Code', 'Submitted (WIB)', 'Language', 'Track', 'Name', 'Sex', 'Age', 'WhatsApp', 'Email',
    'Research consent', 'Guardian', 'Consent version', 'Consent acknowledgements', 'Duration (sec)',
    'Participant', 'Check-up no. (T)', 'Level', 'MHI', 'DI', 'WI', 'BHI', 'ATI',
]

export const rawAnswerHeaders = (): string[] => [...META_HEADERS, ...MHCU_ITEMS.map((item) => item.code)]

const text = (value: unknown): string => (value === null || value === undefined ? '' : String(value))

const scoreOf = (scores: unknown, key: string): string => {
    const record = scores && typeof scores === 'object' ? (scores as Record<string, unknown>) : {}
    const raw = record[key]
    // The self-image index is stored as { total, index, category }.
    const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>).total : raw
    return typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value * 10) / 10) : ''
}

/** The values of one row, in the order of rawAnswerHeaders(). */
export const rawAnswerRow = (row: AssessmentRow, extra: { participantNo?: number | null } = {}): string[] => {
    const answers = row.answers && typeof row.answers === 'object' ? (row.answers as Record<string, unknown>) : {}
    const participant = typeof extra.participantNo === 'number' ? `P${String(extra.participantNo).padStart(5, '0')}` : ''
    return [
        row.code,
        toJakartaIso(row.createdAt),
        row.lang,
        row.track,
        row.name,
        text(row.sex),
        text(row.age),
        row.phone,
        row.email,
        row.researchConsent ? 'Ya' : 'Tidak',
        row.guardian ? 'Ya' : '',
        row.consentVersion,
        Array.isArray(row.consentAck) ? row.consentAck.join(', ') : '',
        text(row.durationSec),
        participant,
        text(row.waveNo),
        text(row.level),
        scoreOf(row.scores, 'mhi'),
        scoreOf(row.scores, 'di'),
        scoreOf(row.scores, 'wi'),
        scoreOf(row.scores, 'bhi'),
        scoreOf(row.scores, 'ati'),
        ...MHCU_ITEMS.map((item) => text(answers[item.code])),
    ]
}
