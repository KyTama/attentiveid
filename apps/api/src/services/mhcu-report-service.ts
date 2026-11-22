import { MHCU_LEVELS, buildClientReportData, buildPsychologistReportData } from '@attentiveid/shared';
import type { MhcuStoredSession } from '@attentiveid/shared';
import type { AssessmentRow } from '../repositories/assessments.repository';
import { renderClientReport } from '../reports/mhcu/client-report';
import { renderPsychologistReport } from '../reports/mhcu/psychologist-report';

type HistoryRow = AssessmentRow & { participantNo: number };

export const participantLabel = (participantNo: number): string => `P${String(participantNo).padStart(5, '0')}`;

const toStored = (row: HistoryRow): MhcuStoredSession => ({
    sessionId: row.id,
    reportNo: row.code,
    participantId: participantLabel(row.participantNo),
    submittedAt: new Date(row.createdAt).toISOString(),
    lang: row.lang === 'en' ? 'en' : 'id',
    name: row.name,
    sex: row.sex ?? '',
    age: row.age,
    phone: row.phone,
    email: row.email,
    answers: (row.answers && typeof row.answers === 'object' ? row.answers : {}) as Record<string, number>
});

const todayJakarta = (): string => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

export interface ReportInput {
    row: HistoryRow;
    history: HistoryRow[];
    psychologistName: string | null;
    /** Name of whoever marked the note final. */
    finalizedBy: string | null;
}

/** The recommendation printed in the report: the level's standard text (or the psychologist's edited version) plus the special note. */
const recommendationOf = (row: HistoryRow, level: number): string => {
    const lang = row.lang === 'en' ? 'en' : 'id';
    const def = MHCU_LEVELS[Math.min(5, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5];
    const template = row.noteTemplate?.trim() || (lang === 'en' ? def.actionEn : def.actionId);
    return [template, row.noteCustom?.trim()].filter(Boolean).join(' ');
};

const buildInput = ({ row, history, psychologistName, finalizedBy }: ReportInput) => {
    const level = typeof row.level === 'number' ? row.level : 1;
    return {
        session: toStored(row),
        history: history.map(toStored),
        extras: {
            psychologist: psychologistName ? { name: psychologistName, sipp: null } : null,
            note: { recommendation: recommendationOf(row, level), status: row.noteFinal ? ('final' as const) : ('draft' as const), finalizedBy: row.noteFinal ? finalizedBy : null },
            reportDate: todayJakarta()
        }
    };
};

export const renderClientReportHtml = (input: ReportInput): string => {
    const lang = input.row.lang === 'en' ? 'en' : 'id';
    return renderClientReport(buildClientReportData(buildInput(input)), { lang, title: `${input.row.code} · Mental Health Check-Up` });
};

export const renderPsychologistReportHtml = (input: ReportInput): string => {
    const lang = input.row.lang === 'en' ? 'en' : 'id';
    return renderPsychologistReport(buildPsychologistReportData(buildInput(input)), { lang, title: `${input.row.code} · MHCU (internal)` });
};

/** A full report is released only after the psychologist marked the note final and staff confirmed the payment (or it is free / included). */
export const REPORT_READY_PAYMENT = ['PAID', 'FREE', 'INCLUDED', 'LEGACY'] as const;
