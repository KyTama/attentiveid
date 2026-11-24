import type { AssessmentRow, AssessmentsRepository } from '../repositories/assessments.repository';
import type { MhcuOpsRepository } from '../repositories/mhcu-ops.repository';
import type { Mailer } from './mailer';
import { paymentToken } from './assessment-payment';
import { buildReportReadyEmail } from './mhcu-report-ready-email';
import { REPORT_READY_PAYMENT } from './mhcu-report-service';
import type { MhcuSettings } from './mhcu-settings';

export interface ReleaseDeps {
    repository: AssessmentsRepository;
    mailer?: Mailer;
    /** Secret that signs the participant's links. */
    secret?: string;
    siteOrigin?: string;
    onError?: (where: string, error: unknown) => void;
}

export type ReleaseResult =
    | { ok: true; released: boolean; emailed: boolean }
    | { ok: false; status: 409; message: string };

/** Why a check-up cannot be released yet, or null when it can. The same rule is shown to staff in the dashboard. */
export const releaseBlocker = (row: Pick<AssessmentRow, 'noteFinal' | 'paymentStatus' | 'psychologistId'>, options: { needPsychologist?: boolean } = {}): string | null => {
    if (!row.noteFinal) return 'Catatan psikolog belum ditandai final.';
    if (!(REPORT_READY_PAYMENT as readonly string[]).includes(row.paymentStatus)) return 'Pembayaran belum dikonfirmasi.';
    if (options.needPsychologist && !row.psychologistId) return 'Psikolog belum ditugaskan.';
    return null;
};

/** Releases the full report and e-mails the participant the signed link that opens it. */
export const releaseReport = async (deps: ReleaseDeps, row: AssessmentRow): Promise<ReleaseResult> => {
    const blocker = releaseBlocker(row);
    if (blocker) return { ok: false, status: 409, message: blocker };
    const released = await deps.repository.markReportReleased(row.id);
    let emailed = false;
    if (released && deps.secret && deps.mailer?.isConfigured) {
        const origin = (deps.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '');
        const link = `${origin}/api/public/assessments/report?id=${encodeURIComponent(row.code)}&t=${paymentToken(deps.secret, row.code)}`;
        try {
            await deps.mailer.send({
                to: row.email,
                ...buildReportReadyEmail({
                    name: row.name,
                    code: row.code,
                    lang: row.lang === 'en' ? 'en' : 'id',
                    scores: row.scores,
                    level: row.level,
                    reportLink: link,
                    submittedAt: new Date(row.createdAt),
                    siteOrigin: origin
                })
            });
            emailed = true;
        } catch (error) {
            deps.onError?.('release-email', error);
        }
    }
    return { ok: true, released: !!released, emailed };
};

export interface AutomationDeps extends ReleaseDeps {
    ops?: MhcuOpsRepository;
    getSettings: () => Promise<MhcuSettings>;
}

/**
 * Runs after staff change a note or a payment. With auto-assign on, a confirmed payment with nobody assigned gets a psychologist
 * (a returning person keeps theirs). With auto-send on, a check-up that is paid, assigned and has a final note is released.
 * Never throws: a failure here must not undo what staff just saved.
 */
export const runAutomation = async (deps: AutomationDeps, id: string): Promise<void> => {
    try {
        const settings = await deps.getSettings();
        let row = await deps.repository.get(id);
        if (!row || row.instrument !== 'mhcu' || row.status === 'released') return;
        const settled = (REPORT_READY_PAYMENT as readonly string[]).includes(row.paymentStatus);
        if (settings.autoAssign && settled && !row.psychologistId && deps.ops) {
            const picked = await deps.ops.pickPsychologist();
            if (picked) row = (await deps.repository.assign(id, picked)) ?? row;
        }
        if (settings.autoSend && !releaseBlocker(row, { needPsychologist: true })) await releaseReport(deps, row);
    } catch (error) {
        deps.onError?.('automation', error);
    }
};
