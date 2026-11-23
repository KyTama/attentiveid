import { Elysia, t } from 'elysia';
import { buildHistory, type MhcuSessionInput } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { AssessmentRow, AssessmentsRepository } from '../repositories/assessments.repository';
import type { MhcuOpsRepository } from '../repositories/mhcu-ops.repository';
import type { Mailer } from '../services/mailer';
import { paymentLink } from '../services/assessment-payment';
import { buildMhcuResultEmail } from '../services/mhcu-result-email';
import { validateSettings, type MhcuSettings } from '../services/mhcu-settings';

export interface MhcuSettingsStore {
    get(): Promise<MhcuSettings>;
    set(value: MhcuSettings): Promise<void>;
}

export interface MhcuOpsRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    assessmentsRepository: AssessmentsRepository;
    ops: MhcuOpsRepository;
    settings: MhcuSettingsStore;
    mailer?: Mailer;
    paymentSecret?: string;
    siteOrigin?: string;
    /** Written for every change staff make (who did what to which check-up, no personal data). */
    audit?: (entry: { actor: string; action: string; submissionId: string | null; detail: string }) => Promise<void> | void;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_FOUND = { status: 'notFound', message: 'Data tidak ditemukan.' };

const logFailure = (where: string, error: unknown) => {
    console.error(`[mhcu-ops] ${where} failed:`, error instanceof Error ? error.name : 'error');
};

const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

/** A psychologist reads only the check-ups assigned to them; an admin reads all. */
const canAccess = (user: any, row: Pick<AssessmentRow, 'instrument' | 'psychologistId'>): boolean =>
    user?.role === 'admin' || (!!user?.psychologistId && row.psychologistId === user.psychologistId);

/**
 * The extras the MHCU dashboard needs next to the list and the detail: overview numbers, the person's history over time,
 * re-sending the result e-mail, and the settings (prices, alert level, automation).
 */
export const createMhcuOpsRoutes = (dependencies: MhcuOpsRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.assessmentsRepository;

    const audit = async (actor: string, action: string, submissionId: string | null, detail: string) => {
        try {
            await dependencies.audit?.({ actor, action, submissionId, detail });
        } catch (error) {
            logFailure('audit', error);
        }
    };

    return new Elysia({ name: 'mhcu-ops-routes' })
        .use(roleGuard)
        .get('/api/admin/assessments/mhcu/overview', async ({ set, currentUser }: any) => {
            try {
                const scope = currentUser.role === 'admin' ? {} : { psychologistId: currentUser.psychologistId ?? '00000000-0000-0000-0000-000000000000' };
                set.headers['cache-control'] = 'no-store';
                return { status: 'success', data: await dependencies.ops.overview(scope) };
            } catch (error) {
                logFailure('overview', error);
                set.status = 503;
                return { status: 'error', message: 'Ringkasan belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: 'Overview numbers for the MHCU dashboard (staff; a psychologist counts only their own)' }
        })
        .get('/api/admin/assessments/:id/history', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return NOT_FOUND;
            }
            try {
                const row = await repository.get(params.id);
                if (!row || row.instrument !== 'mhcu' || !canAccess(currentUser, row)) {
                    set.status = 404;
                    return NOT_FOUND;
                }
                set.headers['cache-control'] = 'no-store';
                if (!row.participantId) return { status: 'success', data: { participantNo: null, nSessions: 1, current: row.id, waves: [] } };
                const rows = await repository.listHistory(row.participantId);
                const inputs: MhcuSessionInput[] = rows.map((r) => {
                    const scores = (r.scores && typeof r.scores === 'object' ? r.scores : {}) as Record<string, unknown>;
                    return {
                        sessionId: r.id,
                        reportCode: r.code,
                        submittedAt: new Date(r.createdAt).toISOString(),
                        mhi: num(scores.mhi),
                        level: typeof r.level === 'number' ? r.level : 1,
                        di: num(scores.di),
                        wi: num(scores.wi),
                        bhi: num(scores.bhi)
                    };
                });
                const history = buildHistory(inputs, row.participantId);
                return {
                    status: 'success',
                    data: {
                        participantNo: rows[0]?.participantNo ?? null,
                        nSessions: history.n,
                        spanDays: history.spanDays,
                        current: row.id,
                        waves: history.waves.map((w) => ({
                            id: w.sessionId,
                            code: w.reportCode ?? '',
                            waveNo: w.waveNo,
                            date: w.submittedDate,
                            mhi: w.mhi,
                            di: w.di,
                            wi: w.wi,
                            bhi: w.bhi,
                            level: w.level,
                            deltaMhi: w.delta.mhi,
                            daysSincePrev: w.daysSincePrev
                        }))
                    }
                };
            } catch (error) {
                logFailure('history', error);
                set.status = 503;
                return { status: 'error', message: 'Riwayat belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: "One person's check-ups over time (T1..Tn) with changes (staff)" }
        })
        .post('/api/admin/assessments/:id/resend-result', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return NOT_FOUND;
            }
            const mailer = dependencies.mailer;
            const secret = dependencies.paymentSecret;
            if (!mailer?.isConfigured || !secret) {
                set.status = 503;
                return { status: 'error', message: 'E-mail belum diatur di server.' };
            }
            try {
                const row = await repository.get(params.id);
                if (!row || row.instrument !== 'mhcu') {
                    set.status = 404;
                    return NOT_FOUND;
                }
                const origin = (dependencies.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '');
                const lang = row.lang === 'en' ? 'en' : 'id';
                const mail = buildMhcuResultEmail({
                    name: row.name,
                    code: row.code,
                    lang,
                    scores: row.scores,
                    level: row.level,
                    reportLink: paymentLink(origin, secret, row.code, lang),
                    submittedAt: new Date(row.createdAt),
                    siteOrigin: origin
                });
                await mailer.send({ to: row.email, ...mail });
                await repository.markResultEmailSent(row.id);
                await audit(currentUser.id, 'resend_result', row.id, row.code);
                return { status: 'success', data: { sent: true } };
            } catch (error) {
                logFailure('resend', error);
                set.status = 503;
                return { status: 'error', message: 'E-mail belum terkirim.' };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Send the result e-mail to the participant again (admin)' }
        })
        .get('/api/admin/assessments/mhcu/settings', async ({ set }: any) => {
            try {
                set.headers['cache-control'] = 'no-store';
                return { status: 'success', data: await dependencies.settings.get() };
            } catch (error) {
                logFailure('settings-get', error);
                set.status = 503;
                return { status: 'error', message: 'Pengaturan belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'MHCU settings: prices, promo date, alert level, automation (admin)' }
        })
        .put('/api/admin/assessments/mhcu/settings', async ({ body, set, currentUser }: any) => {
            const checked = validateSettings(body);
            if (!checked.ok) {
                set.status = 400;
                return { status: 'error', message: checked.error };
            }
            try {
                await dependencies.settings.set(checked.value);
                await audit(currentUser.id, 'settings', null, 'mhcu settings changed');
                return { status: 'success', data: checked.value };
            } catch (error) {
                logFailure('settings-put', error);
                set.status = 503;
                return { status: 'error', message: 'Pengaturan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Change the MHCU settings (admin)' }
        });
};
