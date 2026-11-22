import { Elysia, t } from 'elysia';
import { scoreMhcu, validateGscSubmission, validateMhcuSubmission } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { AssessmentsRepository, AssessmentStatus } from '../repositories/assessments.repository';
import type { AssessmentsSheetSync } from '../services/assessments-sheet-sync';
import type { Mailer } from '../services/mailer';
import { buildMhcuResultEmail } from '../services/mhcu-result-email';
import { paymentLink } from '../services/assessment-payment';

export interface AssessmentsRateLimit {
    max: number;
    windowMs: number;
}

export interface AssessmentsRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    assessmentsRepository: AssessmentsRepository;
    sheetSync?: AssessmentsSheetSync;
    /** Sends the result e-mail to the participant. Without it (or without SMTP settings) no e-mail is sent. */
    mailer?: Mailer;
    /** Secret that signs the links in the e-mail (the API's JWT secret). */
    paymentSecret?: string;
    /** The public address of the site, used in the links of the e-mail. */
    siteOrigin?: string;
    rateLimit?: AssessmentsRateLimit;
    now?: () => number;
}

/** A person fills this in once; a handful of tries per address is plenty (an office or a school can share one address). */
const DEFAULT_RATE_LIMIT: AssessmentsRateLimit = { max: 6, windowMs: 15 * 60 * 1000 };
/** Limits that do not depend on the visitor's address (which a proxy misconfiguration or a spoofed header can blur). */
const GLOBAL_LIMIT: AssessmentsRateLimit = { max: 300, windowMs: 60 * 60 * 1000 };
const PER_EMAIL_LIMIT: AssessmentsRateLimit = { max: 4, windowMs: 24 * 60 * 60 * 1000 };
/** The same answers from the same e-mail inside this time are the same click arriving twice. */
const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;
/** The form sends a few KB; anything much larger is not a person filling it in. */
const MAX_BODY_BYTES = 64 * 1024;
/** A Goal System Compass session carries the whole goals map (packed) next to the profile. */
const MAX_GSC_BODY_BYTES = 160 * 1024;
const STATUSES: readonly AssessmentStatus[] = ['new', 'reviewed', 'released'];
/** A status staff may set. 'new' is only the starting state. */
const SETTABLE: readonly AssessmentStatus[] = ['reviewed', 'released'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERVER_ERROR =
    'Terjadi gangguan pada server. Jawaban Anda belum tersimpan, silakan coba lagi sebentar lagi. / Something went wrong on our side; your answers were not saved, please try again shortly.';

// The ingress appends the real client address to X-Forwarded-For, so the last entry is the one the proxy vouches for.
const clientKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

export const createAssessmentsRoutes = (dependencies: AssessmentsRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.assessmentsRepository;
    const limit = dependencies.rateLimit ?? DEFAULT_RATE_LIMIT;
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();

    const isRateLimited = (key: string, rule: AssessmentsRateLimit = limit) => {
        const cutoff = now() - rule.windowMs;
        const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
        if (recent.length >= rule.max) {
            hits.set(key, recent);
            return true;
        }
        recent.push(now());
        hits.set(key, recent);
        if (hits.size > 5000) hits.delete(hits.keys().next().value as string);
        return false;
    };

    /** Logs only what failed, never the request: the body holds a person's name, phone, e-mail and answers. */
    const logFailure = (where: string, error: unknown) => {
        console.error(`[assessments] ${where} failed:`, error instanceof Error ? error.name : 'error');
    };

    /** E-mails the result to the participant. Never blocks or fails the submission: the answers are already saved. */
    const sendResultEmail = (row: { id: string; code: string }, input: { name: string; email: string; lang: 'id' | 'en'; scores: unknown; level: number | null }) => {
        const mailer = dependencies.mailer;
        const secret = dependencies.paymentSecret;
        if (!mailer?.isConfigured || !secret) return;
        void (async () => {
            try {
                const origin = dependencies.siteOrigin || 'https://attentiveid.com';
                const mail = buildMhcuResultEmail({
                    name: input.name,
                    code: row.code,
                    lang: input.lang,
                    scores: input.scores,
                    level: input.level,
                    reportLink: paymentLink(origin, secret, row.code, input.lang)
                });
                await mailer.send({ to: input.email, ...mail });
                await repository.markResultEmailSent(row.id);
            } catch (error) {
                logFailure('result-email', error);
            }
        })();
    };

    const sync = () => {
        // Fire and forget: the person's answers are already safe in the database; a failed copy is tried again next time.
        void dependencies.sheetSync?.syncPending().catch(() => undefined);
    };

    return new Elysia({ name: 'assessments-routes' })
        .use(roleGuard)
        // Health information: never kept by a browser cache or a shared proxy.
        .onAfterHandle({ as: 'local' }, ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
            set.headers.pragma = 'no-cache';
        })
        .post('/api/public/assessments/mhcu', async ({ body, headers, set }: any) => {
            // Honeypot: pretend success so bots learn nothing, store nothing.
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { ok: true, status: 'success', code: 'AT-MHCU-PENDING', email: '' };
            }
            const declared = Number(headers['content-length']);
            if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
                set.status = 413;
                return { ok: false, status: 'error', error: 'Data terlalu besar. / Request too large.' };
            }
            const tooMany = () => {
                set.status = 429;
                return {
                    ok: false,
                    status: 'error',
                    error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi. / Too many attempts, please try again in a few minutes.'
                };
            };
            if (isRateLimited(`ip:${clientKey(headers)}`) || isRateLimited('all', GLOBAL_LIMIT)) return tooMany();
            const parsed = validateMhcuSubmission(body);
            if (!parsed.ok) {
                set.status = 400;
                return { ok: false, status: 'error', error: parsed.error };
            }
            const value = parsed.value;
            if (isRateLimited(`email:${value.email.toLowerCase()}`, PER_EMAIL_LIMIT)) return tooMany();
            try {
                const scores = scoreMhcu(value.answers);
                const created = await repository.create(
                    {
                        instrument: 'mhcu',
                        lang: value.lang,
                        // Invite tracks (asesmen awal / free session) are not enabled yet: everyone arrives by the public link.
                        track: 'mandiri',
                        consentVersion: value.consentVersion,
                        researchConsent: value.consent === 'research',
                        guardian: value.guardian,
                        consentAck: value.ack,
                        name: value.name,
                        sex: value.sex || null,
                        age: value.age,
                        phone: value.phone,
                        email: value.email,
                        answers: value.answers,
                        scores,
                        level: typeof scores.level === 'number' ? scores.level : null,
                        durationSec: typeof value.durationSec === 'number' ? value.durationSec : null
                    },
                    { dedupeMs: DUPLICATE_WINDOW_MS }
                );
                if (!created.duplicate) {
                    sync();
                    sendResultEmail(created, { name: value.name, email: value.email, lang: value.lang, scores, level: typeof scores.level === 'number' ? scores.level : null });
                }
                set.status = 201;
                return { ok: true, status: 'success', code: created.code, email: value.email };
            } catch (error) {
                logFailure('submit', error);
                set.status = 503;
                return { ok: false, status: 'error', error: SERVER_ERROR };
            }
        }, {
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Submit the Mental Health Check-Up (public)' }
        })
        .post('/api/public/assessments/gsc', async ({ body, headers, set }: any) => {
            // Honeypot (the page has no such field, so any value means a script filled it in).
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { ok: true, status: 'success', code: 'AT-GSC-PENDING' };
            }
            const declared = Number(headers['content-length']);
            if (Number.isFinite(declared) && declared > MAX_GSC_BODY_BYTES) {
                set.status = 413;
                return { ok: false, status: 'error', error: 'Data terlalu besar. / Request too large.' };
            }
            const tooMany = () => {
                set.status = 429;
                return { ok: false, status: 'error', error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi. / Too many attempts, please try again in a few minutes.' };
            };
            if (isRateLimited(`gsc-ip:${clientKey(headers)}`) || isRateLimited('gsc-all', GLOBAL_LIMIT)) return tooMany();
            const parsed = validateGscSubmission(body);
            if (!parsed.ok) {
                set.status = 400;
                return { ok: false, status: 'error', error: parsed.error };
            }
            const value = parsed.value;
            if (isRateLimited(`gsc-email:${value.email.toLowerCase()}`, PER_EMAIL_LIMIT)) return tooMany();
            try {
                const created = await repository.create(
                    {
                        instrument: 'gsc',
                        lang: value.lang,
                        track: 'mandiri',
                        consentVersion: 'GSC-2026.11',
                        researchConsent: false,
                        guardian: value.age < 18,
                        consentAck: [],
                        name: value.name,
                        sex: value.sex || null,
                        age: value.age,
                        phone: value.phone,
                        email: value.email,
                        // The packed session is what the counselor console opens; the brief is only for the staff list.
                        answers: { clientId: value.clientId, goals: value.goals, code: value.code },
                        scores: { brief: value.brief, edu: value.edu, minutes: value.minutes },
                        level: null,
                        durationSec: value.minutes === null ? null : value.minutes * 60
                    },
                    { dedupeMs: DUPLICATE_WINDOW_MS }
                );
                if (!created.duplicate) sync();
                set.status = 201;
                return { ok: true, status: 'success', code: created.code };
            } catch (error) {
                logFailure('submit-gsc', error);
                set.status = 503;
                return { ok: false, status: 'error', error: SERVER_ERROR };
            }
        }, {
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Submit the Goal System Compass (public)' }
        })
        .get('/api/admin/assessment-lists/:instrument', async ({ params, query, set }: any) => {
            if (params.instrument !== 'mhcu' && params.instrument !== 'gsc') {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            const status = STATUSES.includes(query?.status) ? (query.status as AssessmentStatus) : undefined;
            try {
                // A failed copy to the Google Sheet is tried again whenever staff open the list.
                sync();
                return { status: 'success', data: await repository.list(params.instrument, { status }) };
            } catch (error) {
                logFailure('list', error);
                set.status = 503;
                return { status: 'error', message: 'Data belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: 'List submissions of one assessment (staff)' }
        })
        .get('/api/admin/assessments/:id', async ({ params, set }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            try {
                const row = await repository.get(params.id);
                if (!row) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                return { status: 'success', data: row };
            } catch (error) {
                logFailure('get', error);
                set.status = 503;
                return { status: 'error', message: 'Data belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: 'One submission with scores and answers (staff)' }
        })
        .put('/api/admin/assessments/:id/review', async ({ params, body, set, currentUser }: any) => {
            const status = body?.status;
            if (!SETTABLE.includes(status)) {
                set.status = 400;
                return { status: 'error', message: 'Status tidak valid.' };
            }
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 4000) : '';
            try {
                const current = await repository.get(params.id);
                if (!current) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                // A released result stays released: moving it back would hide that it was already shared.
                if (current.status === 'released' && status !== 'released') {
                    set.status = 409;
                    return { status: 'error', message: 'Hasil yang sudah dirilis tidak dapat dikembalikan.' };
                }
                const row = await repository.review(params.id, { status, note: note || null, reviewerId: currentUser.id });
                return { status: 'success', data: row };
            } catch (error) {
                logFailure('review', error);
                set.status = 503;
                return { status: 'error', message: 'Perubahan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Mark a submission reviewed or released (staff)' }
        })
        .post('/api/admin/assessments/sync', async () => {
            if (!dependencies.sheetSync) return { status: 'success', data: { configured: false, synced: 0, error: 'Not configured.' } };
            return { status: 'success', data: await dependencies.sheetSync.syncPending() };
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Copy pending submissions to the Google Sheet now' }
        });
};
