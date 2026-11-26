import { MHCU_LEVELS, buildClientReportData, buildPsychologistReportData } from '@attentiveid/shared';
import type { MhcuStoredSession } from '@attentiveid/shared';
import type { AssessmentRow } from '../repositories/assessments.repository';
import { renderClientReport } from '../reports/mhcu/client-report';
import { renderPsychologistReport } from '../reports/mhcu/psychologist-report';
import { wrapReportPage } from '../reports/mhcu/report-page';

type HistoryRow = AssessmentRow & { participantNo: number };

export const participantLabel = (participantNo: number): string => `P${String(participantNo).padStart(5, '0')}`;

const toStored = (row: HistoryRow, lang: 'id' | 'en'): MhcuStoredSession => ({
    sessionId: row.id,
    reportNo: row.code,
    participantId: participantLabel(row.participantNo),
    submittedAt: new Date(row.createdAt).toISOString(),
    lang,
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
    /** Language of the report. Left out = the language the participant filled the form in. The same check-up can be opened in both. */
    lang?: 'id' | 'en';
}

const langOf = (input: ReportInput): 'id' | 'en' => input.lang ?? (input.row.lang === 'en' ? 'en' : 'id');

/**
 * Said in a report when the psychologist wrote their own text for one language only: that text is never printed in the other
 * language and nothing is translated by machine, so the reader is told where to find it.
 */
export const NOTE_ONLY_IN_OTHER_LANGUAGE = {
    en: 'Your psychologist also wrote a personal note, which appears in the Indonesian version of this report.',
    id: 'Psikolog Anda juga menulis catatan pribadi, yang dapat dibaca pada versi bahasa Inggris laporan ini.'
} as const;

/**
 * The recommendation printed in the report: the level's standard text of that language (or the psychologist's own version in
 * that language) plus the special note in that language.
 */
export const recommendationOf = (
    row: Pick<HistoryRow, 'noteTemplate' | 'noteCustom' | 'noteTemplateEn' | 'noteCustomEn'>,
    level: number,
    lang: 'id' | 'en'
): string => {
    const def = MHCU_LEVELS[Math.min(5, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5];
    const clean = (value: string | null | undefined) => value?.trim() || '';
    const indonesian = { template: clean(row.noteTemplate), custom: clean(row.noteCustom) };
    const english = { template: clean(row.noteTemplateEn), custom: clean(row.noteCustomEn) };
    const own = lang === 'en' ? english : indonesian;
    const other = lang === 'en' ? indonesian : english;
    const missing = Boolean((other.template && !own.template) || (other.custom && !own.custom));
    return [own.template || (lang === 'en' ? def.actionEn : def.actionId), own.custom, missing ? NOTE_ONLY_IN_OTHER_LANGUAGE[lang] : '']
        .filter(Boolean)
        .join(' ');
};

const buildInput = (input: ReportInput) => {
    const { row, history, psychologistName, finalizedBy } = input;
    const lang = langOf(input);
    const level = typeof row.level === 'number' ? row.level : 1;
    return {
        session: toStored(row, lang),
        history: history.map((h) => toStored(h, lang)),
        extras: {
            psychologist: psychologistName ? { name: psychologistName, sipp: null } : null,
            note: { recommendation: recommendationOf(row, level, lang), status: row.noteFinal ? ('final' as const) : ('draft' as const), finalizedBy: row.noteFinal ? finalizedBy : null },
            reportDate: todayJakarta()
        }
    };
};

export const renderClientReportHtml = (input: ReportInput): string => {
    const lang = langOf(input);
    return renderClientReport(buildClientReportData(buildInput(input)), { lang, title: `${input.row.code} · Mental Health Check-Up` });
};

/** The client report inside the report page (title, print and copy buttons, what is in it): the public page and the staff preview. */
export const renderClientReportPage = (input: ReportInput, mode: 'public' | 'staff' | 'file'): string =>
    wrapReportPage(renderClientReportHtml(input), {
        lang: langOf(input),
        name: input.row.name,
        code: input.row.code,
        createdAt: new Date(input.row.createdAt).toISOString(),
        mode
    });

export const renderPsychologistReportHtml = (input: ReportInput): string => {
    const lang = langOf(input);
    return renderPsychologistReport(buildPsychologistReportData(buildInput(input)), { lang, title: `${input.row.code} · MHCU (internal)` });
};

/** A full report is released only after the psychologist marked the note final and staff confirmed the payment (or it is free / included). */
export const REPORT_READY_PAYMENT = ['PAID', 'FREE', 'INCLUDED', 'LEGACY'] as const;
