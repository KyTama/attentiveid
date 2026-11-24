import { createHash } from 'node:crypto';
import { Elysia, t } from 'elysia';
import { scoreMhcu, validateGscSubmission, validateMhcuSubmission } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import { isOwnerUser } from '../security/owner';
import type { AuthTokenService, AuthUserRepository } from './auth';
import { InviteUnavailableError, type AssessmentRow, type AssessmentsRepository, type AssessmentStatus } from '../repositories/assessments.repository';
import { INVITE_TOKEN } from '../repositories/mhcu-invites.repository';
import type { MhcuTrack } from '../services/mhcu-tracks';
import type { AssessmentsSheetSync } from '../services/assessments-sheet-sync';
import type { Mailer } from '../services/mailer';
import { buildMhcuResultEmail } from '../services/mhcu-result-email';
import { PAYMENT_OPTIONS, PROMO_UNTIL, paymentLink, priceFor, verifyPaymentToken } from '../services/assessment-payment';
import { buildAdminAlertEmail } from '../services/mhcu-admin-alert';
import { buildGscReceivedEmail, buildGscStaffEmail } from '../services/form-notice-emails';
import { renderClientReportHtml, renderClientReportPage, renderPsychologistReportHtml } from '../services/mhcu-report-service';
import { renderPdf, type PdfRenderer } from '../services/pdf-render';
import { releaseReport, runAutomation } from '../services/mhcu-release';
import type { DriveReports } from '../services/drive-reports';
import { loadReportAssets, makeStandaloneReport } from '../services/mhcu-report-file';
import type { MhcuOpsRepository } from '../repositories/mhcu-ops.repository';
import type { MhcuSettings } from '../services/mhcu-settings';

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
    /** Staff address that gets the alert for a Level 4-5 result. */
    alertEmail?: string;
    /** Settings staff can change (alert level and address, automation). When missing the defaults above apply. */
    settings?: { get(): Promise<MhcuSettings> };
    ops?: MhcuOpsRepository;
    /** Secret that signs the links in the e-mail (the API's JWT secret). */
    paymentSecret?: string;
    /** The public address of the site, used in the links of the e-mail. */
    siteOrigin?: string;
    /** Saves released reports to Google Drive (optional; without it nothing is saved there). */
    driveReports?: DriveReports;
    /** Prints a report page to PDF (default: headless Chromium). Replaceable in tests. */
    pdfRenderer?: PdfRenderer;
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
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'FREE', 'INCLUDED', 'LEGACY'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INVITE_ERROR =
    'Tautan undangan tidak valid atau sudah dipakai. Hubungi admin Attentive. / This invitation link is not valid or has already been used. Please contact the Attentive admin.';
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
    const sendResultEmail = (row: { id: string; code: string }, input: { name: string; email: string; lang: 'id' | 'en'; scores: unknown; level: number | null; track?: string; psychologistId?: string | null; creditsRemaining?: number; waveNo?: number | null }) => {
        const mailer = dependencies.mailer;
        const secret = dependencies.paymentSecret;
        if (!mailer?.isConfigured || !secret) return;
        void (async () => {
            try {
                const origin = dependencies.siteOrigin || 'https://attentiveid.com';
                // The invited tracks, the package and 'lanjutan' have their own e-mail (no prices, who reviews the report).
                const psychologistName = input.psychologistId ? await repository.getPsychologistName(input.psychologistId) : null;
                const mail = buildMhcuResultEmail({
                    name: input.name,
                    code: row.code,
                    lang: input.lang,
                    scores: input.scores,
                    level: input.level,
                    reportLink: paymentLink(origin, secret, row.code, input.lang),
                    submittedAt: new Date(),
                    siteOrigin: origin,
                    track: (input.track ?? 'mandiri') as MhcuTrack,
                    psychologistName,
                    creditsRemaining: input.creditsRemaining,
                    waveNo: input.waveNo
                });
                await mailer.send({ to: input.email, ...mail });
                await repository.markResultEmailSent(row.id);
            } catch (error) {
                logFailure('result-email', error);
            }
        })();
    };

    /** Copies every new result to the admin inbox; a Level 4-5 result carries the urgent subject (same-day contact). Never blocks or fails the submission. */
    const sendAdminAlert = (row: { id: string; code: string; waveNo: number | null }, input: { level: number; mhi: number | null; name: string; phone: string; email: string; lang: string }) => {
        const mailer = dependencies.mailer;
        if (!mailer?.isConfigured) return;
        void (async () => {
            try {
                const settings = dependencies.settings ? await dependencies.settings.get() : null;
                const to = settings?.alertEmail || dependencies.alertEmail;
                if (!to) return;
                const origin = (dependencies.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '');
                const mail = buildAdminAlertEmail({ ...input, code: row.code, waveNo: row.waveNo, submittedAt: new Date(), portalUrl: `${origin}/dashboard/assessments/mhcu/${row.id}`, urgentFrom: settings?.alertLevel });
                await mailer.send({ to, ...mail });
                await repository.markAdminAlertSent(row.id);
            } catch (error) {
                logFailure('admin-alert', error);
            }
        })();
    };

    /** Goal System Compass: "we received it" to the person and a heads-up to the admin inbox. Never blocks or fails the submission. */
    const sendGscEmails = (row: { id: string; code: string }, input: { name: string; age: number; phone: string; email: string; lang: 'id' | 'en' }) => {
        const mailer = dependencies.mailer;
        if (!mailer?.isConfigured) return;
        void (async () => {
            const siteOrigin = dependencies.siteOrigin || 'https://attentiveid.com';
            try {
                await mailer.send({ to: input.email, ...buildGscReceivedEmail({ name: input.name, code: row.code, lang: input.lang, siteOrigin }) });
            } catch (error) {
                logFailure('gsc-received-email', error);
            }
            try {
                const settings = dependencies.settings ? await dependencies.settings.get() : null;
                const to = settings?.alertEmail || dependencies.alertEmail;
                if (!to) return;
                await mailer.send({ to, ...buildGscStaffEmail({ ...input, code: row.code, submissionId: row.id, siteOrigin }) });
            } catch (error) {
                logFailure('gsc-staff-email', error);
            }
        })();
    };

    /** The superadmin is an admin too (the role guard already lets them through every admin route). */
    const isAdminRole = (user: any): boolean => user?.role === 'admin' || user?.role === 'superadmin';
    /** Admins see everything; a psychologist sees only the Mental Health Check-Ups assigned to them. */
    const canAccess = (user: any, row: { instrument: string; psychologistId: string | null }): boolean =>
        isAdminRole(user) || row.instrument !== 'mhcu' || (!!user?.psychologistId && row.psychologistId === user.psychologistId);
    /** undefined = no limit (admin); null = nothing visible (a psychologist profile that is not linked); else the psychologist's id. */
    const ownScope = (user: any): string | null | undefined => (isAdminRole(user) ? undefined : user?.psychologistId ?? null);

    /** After staff change a note or a payment: auto-assign and auto-release when the settings say so. Never fails the request. */
    const automate = async (id: string) => {
        if (!dependencies.settings) return;
        await runAutomation({
            repository,
            mailer: dependencies.mailer,
            secret: dependencies.paymentSecret,
            siteOrigin: dependencies.siteOrigin,
            staffEmail: staffInbox,
            saveFiles: saveReportFiles,
            onError: logFailure,
            ops: dependencies.ops,
            getSettings: () => (dependencies.settings as { get(): Promise<MhcuSettings> }).get()
        }, id);
    };

    /** ?lang=id or ?lang=en picks the language of a report; anything else keeps the participant's own. */
    const reportLang = (value: unknown): 'id' | 'en' | undefined => (value === 'en' ? 'en' : value === 'id' ? 'id' : undefined);

    /** Both language versions of a released report as plain PDFs (the report pages only, no buttons), saved to Drive. Only when Drive is set up. */
    const saveReportFiles = dependencies.driveReports
        ? async (row: AssessmentRow) => {
            const loaded = await loadReportInput(row.id);
            if (!loaded) return null;
            const assets = await loadReportAssets(dependencies.siteOrigin || 'https://attentiveid.com');
            const print = dependencies.pdfRenderer ?? renderPdf;
            const files = [];
            // One after the other: each print starts a browser, and two at once would use a lot of memory.
            for (const lang of ['id', 'en'] as const) {
                const html = makeStandaloneReport(renderClientReportHtml({ ...loaded.input, lang }), assets);
                files.push({ name: `${row.code} - MHCU (${lang.toUpperCase()}).pdf`, mimeType: 'application/pdf', data: await print(html) });
            }
            const saved = await (dependencies.driveReports as DriveReports).saveReport({ code: row.code, at: new Date(), files });
            return { path: saved.path };
        }
        : undefined;

    /** Where release e-mails to staff go: the MHCU settings inbox, else the general alert address. */
    const staffInbox = async (): Promise<string | undefined> => {
        const settings = dependencies.settings ? await dependencies.settings.get() : null;
        return settings?.alertEmail || dependencies.alertEmail || undefined;
    };

    /** Loads a check-up and the person's other check-ups, ready for a report. */
    const loadReportInput = async (id: string) => {
        const row = await repository.get(id);
        if (!row || row.instrument !== 'mhcu' || !row.participantId) return null;
        const history = await repository.listHistory(row.participantId);
        const current = history.find((h) => h.id === row.id);
        if (!current) return null;
        const psychologistName = row.psychologistId ? await repository.getPsychologistName(row.psychologistId) : null;
        return { raw: row, input: { row: current, history, psychologistName, finalizedBy: psychologistName } };
    };
    /** Headers for a served report page. The page needs its own styles, the logo and font from this site, and one inline script (print / copy link), which is allowed by its hash only. */
    const htmlHeaders = (set: any, html: string) => {
        const scriptHashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`);
        set.headers['content-security-policy'] = [
            "default-src 'none'",
            "style-src 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self'",
            `script-src ${scriptHashes.length ? scriptHashes.join(' ') : "'none'"}`,
            "frame-ancestors 'none'",
            "base-uri 'none'",
            "form-action 'none'"
        ].join('; ');
        set.headers['content-type'] = 'text/html; charset=utf-8';
        set.headers['cache-control'] = 'no-store';
        set.headers['x-robots-tag'] = 'noindex, nofollow';
        set.headers['referrer-policy'] = 'no-referrer';
    };

    /** An audit row never holds a name, e-mail, phone or score; a failed row is logged and never blocks the action. */
    const auditSafely = async (entry: { actor: string | null; action: string; submissionId?: string | null; detail?: string | null }) => {
        try {
            await repository.audit(entry);
        } catch (error) {
            logFailure('audit', error);
        }
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
            if (value.invite && !INVITE_TOKEN.test(value.invite)) {
                set.status = 400;
                return { ok: false, status: 'error', error: INVITE_ERROR };
            }
            if (isRateLimited(`email:${value.email.toLowerCase()}`, PER_EMAIL_LIMIT)) return tooMany();
            try {
                const scores = scoreMhcu(value.answers);
                const created = await repository.create(
                    {
                        instrument: 'mhcu',
                        lang: value.lang,
                        // The repository decides the track: a valid invitation (asesmen awal / free session), a package credit, 'lanjutan' or 'mandiri'.
                        track: 'mandiri',
                        inviteToken: value.invite || null,
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
                    sendAdminAlert(created, { level: typeof scores.level === 'number' ? scores.level : 0, mhi: typeof scores.mhi === 'number' ? scores.mhi : null, name: value.name, phone: value.phone, email: value.email, lang: value.lang });
                    sendResultEmail(created, { name: value.name, email: value.email, lang: value.lang, scores, level: typeof scores.level === 'number' ? scores.level : null, track: created.track, psychologistId: created.psychologistId, creditsRemaining: created.creditsRemaining, waveNo: created.waveNo });
                }
                set.status = 201;
                // What the thank-you page needs to offer the full report: the signed link to the report page and the current prices.
                const track = created.track ?? 'mandiri';
                const secret = dependencies.paymentSecret;
                const origin = (dependencies.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '');
                const buyable = track === 'mandiri' || track === 'lanjutan';
                const today = new Date();
                return {
                    ok: true,
                    status: 'success',
                    code: created.code,
                    email: value.email,
                    track,
                    reportLink: secret ? paymentLink(origin, secret, created.code, value.lang) : null,
                    pricing: track === 'mandiri'
                        ? {
                            single: { price: priceFor('single', today), normal: PAYMENT_OPTIONS.single.normal },
                            package3: { price: priceFor('package3', today), normal: PAYMENT_OPTIONS.package3.normal },
                            promoUntil: PROMO_UNTIL,
                            promoActive: priceFor('single', today) < PAYMENT_OPTIONS.single.normal
                        }
                        : null,
                    canBuy: buyable
                };
            } catch (error) {
                // A used, cancelled or unknown invitation link: nothing was saved, the person is told clearly.
                if (error instanceof InviteUnavailableError) {
                    set.status = 400;
                    return { ok: false, status: 'error', error: INVITE_ERROR };
                }
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
                if (!created.duplicate) {
                    sync();
                    sendGscEmails(created, { name: value.name, age: value.age, phone: value.phone, email: value.email, lang: value.lang });
                }
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
        .get('/api/admin/assessment-lists/:instrument', async ({ params, query, set, currentUser }: any) => {
            if (params.instrument !== 'mhcu' && params.instrument !== 'gsc') {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            const status = STATUSES.includes(query?.status) ? (query.status as AssessmentStatus) : undefined;
            try {
                // A failed copy to the Google Sheet is tried again whenever staff open the list.
                sync();
                const own = params.instrument === 'mhcu' ? ownScope(currentUser) : undefined;
                if (own === null) return { status: 'success', data: [] };
                return { status: 'success', data: await repository.list(params.instrument, { status, psychologistId: own }) };
            } catch (error) {
                logFailure('list', error);
                set.status = 503;
                return { status: 'error', message: 'Data belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: 'List submissions of one assessment (staff)' }
        })
        .get('/api/admin/assessments/:id', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            try {
                const row = await repository.get(params.id);
                if (!row || !canAccess(currentUser, row)) {
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
                if (!current || !canAccess(currentUser, current)) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                // A Mental Health Check-Up is released only through the release-report step (final note + confirmed payment).
                if (current.instrument === 'mhcu' && status === 'released' && current.status !== 'released') {
                    set.status = 409;
                    return { status: 'error', message: 'Gunakan tombol rilis laporan.' };
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
        .get('/api/admin/assessment-psychologists', async () => ({ status: 'success', data: await repository.listPsychologists() }), {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Psychologists a check-up can be assigned to (admin)' }
        })
        .put('/api/admin/assessments/:id/psychologist', async ({ params, body, set, currentUser }: any) => {
            const psychologistId = body?.psychologistId ?? null;
            if (!UUID.test(params.id) || (psychologistId !== null && (typeof psychologistId !== 'string' || !UUID.test(psychologistId)))) {
                set.status = 400;
                return { status: 'error', message: 'Data tidak valid.' };
            }
            try {
                if (psychologistId && !(await repository.getPsychologistName(psychologistId))) {
                    set.status = 400;
                    return { status: 'error', message: 'Psikolog tidak ditemukan.' };
                }
                const row = await repository.assign(params.id, psychologistId);
                if (!row) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                await auditSafely({ actor: currentUser?.id ?? null, action: 'assign', submissionId: row.id, detail: psychologistId ? 'assigned' : 'cleared' });
                return { status: 'success', data: row };
            } catch (error) {
                logFailure('assign', error);
                set.status = 503;
                return { status: 'error', message: 'Perubahan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Assign (or clear) the psychologist of a check-up (admin)' }
        })
        .put('/api/admin/assessments/:id/note', async ({ params, body, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            const text = (value: unknown, max: number): string | null | undefined =>
                value === undefined || value === null ? null : typeof value === 'string' ? (value.trim().length <= max ? value.trim() || null : undefined) : undefined;
            const template = text(body?.template, 4000);
            const custom = text(body?.custom, 500);
            if (template === undefined || custom === undefined || typeof body?.final !== 'boolean') {
                set.status = 400;
                return { status: 'error', message: 'Catatan tidak valid (catatan khusus maksimal 500 karakter).' };
            }
            try {
                const current = await repository.get(params.id);
                if (!current || current.instrument !== 'mhcu' || !canAccess(currentUser, current)) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                const row = await repository.saveNote(params.id, { template, custom, final: body.final, userId: currentUser.id });
                await auditSafely({ actor: currentUser?.id ?? null, action: 'note', submissionId: params.id, detail: body.final ? 'final' : 'draft' });
                await automate(params.id);
                return { status: 'success', data: (await repository.get(params.id)) ?? row };
            } catch (error) {
                logFailure('note', error);
                set.status = 503;
                return { status: 'error', message: 'Perubahan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: "Save the psychologist's note for the full report (staff)" }
        })
        .put('/api/admin/assessments/:id/payment', async ({ params, body, set, currentUser }: any) => {
            const status = body?.status;
            const amount = body?.amount === undefined || body?.amount === null ? null : Number(body.amount);
            // The package is free text as before ('1x' / '3x' from the dashboard); only a confirmed '3x' gives the person package credits.
            const packageName = typeof body?.package === 'string' ? body.package.trim().slice(0, 40) || null : null;
            const ref = typeof body?.ref === 'string' ? body.ref.trim().slice(0, 120) || null : null;
            if (!UUID.test(params.id) || !PAYMENT_STATUSES.includes(status) || (amount !== null && (!Number.isInteger(amount) || amount < 0 || amount > 100_000_000))) {
                set.status = 400;
                return { status: 'error', message: 'Data pembayaran tidak valid.' };
            }
            try {
                const row = await repository.setPayment(params.id, { status, package: packageName, amount, ref });
                if (!row) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                await automate(params.id);
                await auditSafely({ actor: currentUser?.id ?? null, action: 'payment', submissionId: row.id, detail: `${status}${packageName ? ` ${packageName}` : ''}${row.paymentAmount !== null ? ` Rp${row.paymentAmount}` : ''}` });
                return { status: 'success', data: (await repository.get(params.id)) ?? row };
            } catch (error) {
                logFailure('payment', error);
                set.status = 503;
                return { status: 'error', message: 'Perubahan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Set the payment status after checking the proof (admin)' }
        })
        .put('/api/admin/assessments/:id/price', async ({ params, body, set, currentUser }: any) => {
            const raw = body?.price;
            const price = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d{1,9}$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN;
            if (!UUID.test(params.id) || !Number.isInteger(price) || price < 0 || price > 100_000_000) {
                set.status = 400;
                return { status: 'error', message: 'Harga tidak valid.' };
            }
            try {
                const result = await repository.setPrice(params.id, price);
                if (result.status === 'notFound') {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                if (result.status === 'wrongTrack') {
                    set.status = 409;
                    return { status: 'error', message: 'Harga hanya dapat diisi untuk jalur lanjutan.' };
                }
                await auditSafely({ actor: currentUser?.id ?? null, action: 'price', submissionId: result.row.id, detail: String(price) });
                return { status: 'success', data: result.row };
            } catch (error) {
                logFailure('price', error);
                set.status = 503;
                return { status: 'error', message: 'Perubahan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: "Set the psychologist's report price for a 'lanjutan' check-up (admin)" }
        })
        .get('/api/admin/assessments/:id/report/:kind', async ({ params, query, set, currentUser }: any) => {
            if (!UUID.test(params.id) || (params.kind !== 'client' && params.kind !== 'psychologist')) {
                set.status = 404;
                return 'Not found';
            }
            try {
                const loaded = await loadReportInput(params.id);
                if (!loaded || !canAccess(currentUser, loaded.raw)) {
                    set.status = 404;
                    return 'Not found';
                }
                // The internal report holds comparisons for psychologists only; each opening is logged (who, which check-up).
                if (params.kind === 'psychologist') await auditSafely({ actor: currentUser?.id ?? null, action: 'psychologist_report', submissionId: loaded.raw.id, detail: 'opened' });
                const input = { ...loaded.input, lang: reportLang(query?.lang) };
                const page = params.kind === 'client' ? renderClientReportPage(input, 'staff') : renderPsychologistReportHtml(input);
                htmlHeaders(set, page);
                return page;
            } catch (error) {
                logFailure('report', error);
                set.status = 503;
                return 'Laporan belum bisa dimuat.';
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: 'Preview the client or psychologist report as a print-ready page (staff)' }
        })
        .post('/api/admin/assessments/:id/release-report', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            try {
                const row = await repository.get(params.id);
                if (!row || row.instrument !== 'mhcu') {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                const result = await releaseReport({
                    repository,
                    mailer: dependencies.mailer,
                    secret: dependencies.paymentSecret,
                    siteOrigin: dependencies.siteOrigin,
                    staffEmail: staffInbox,
                    saveFiles: saveReportFiles,
                    onError: logFailure
                }, row);
                if (!result.ok) {
                    set.status = result.status;
                    return { status: 'error', message: result.message };
                }
                await auditSafely({ actor: currentUser?.id ?? null, action: 'send', submissionId: row.id, detail: `${result.emailed ? 'released, e-mailed' : 'released'}${result.drivePath ? `, saved to Drive: ${result.drivePath}` : ''}` });
                return { status: 'success', data: { released: result.released, emailed: result.emailed, drivePath: result.drivePath ?? null, drive: result.drive, driveError: result.driveError ?? null } };
            } catch (error) {
                logFailure('release', error);
                set.status = 503;
                return { status: 'error', message: 'Laporan belum dirilis.' };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Release the full report to the participant: needs final note and confirmed payment (admin)' }
        })
        .get('/api/public/assessments/report', async ({ query, set }: any) => {
            const code = typeof query?.id === 'string' ? query.id : '';
            const token = typeof query?.t === 'string' ? query.t : '';
            const secret = dependencies.paymentSecret;
            const gone = () => {
                set.status = 404;
                set.headers['cache-control'] = 'no-store';
                return 'Not found';
            };
            if (!secret || !/^AT-MHCU-\d{4}-\d{3,}$/.test(code) || !verifyPaymentToken(secret, code, token)) return gone();
            try {
                const row = await repository.getByCode(code);
                if (!row || row.status !== 'released') return gone();
                const loaded = await loadReportInput(row.id);
                if (!loaded) return gone();
                const page = renderClientReportPage({ ...loaded.input, lang: reportLang(query?.lang) }, 'public');
                htmlHeaders(set, page);
                return page;
            } catch (error) {
                logFailure('public-report', error);
                set.status = 503;
                return 'Laporan belum bisa dimuat.';
            }
        }, {
            detail: { tags: ['Assessments'], summary: 'The released client report, opened with the signed link from the e-mail (public)' }
        })
        .delete('/api/admin/assessments/:id', async ({ params, set, currentUser }: any) => {
            // Owner only: the superadmin on the owner list. Everyone else, other admins included, gets 403.
            if (!isOwnerUser(currentUser)) {
                set.status = 403;
                return { status: 'forbidden', message: 'Hanya akun pemilik yang dapat menghapus data.' };
            }
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            try {
                const removed = await repository.deleteSubmission(params.id);
                if (!removed) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                // The audit trail keeps the fact (who, which code), never the person's data.
                await auditSafely({ actor: currentUser?.id ?? null, action: 'delete', submissionId: params.id, detail: removed.code });
                return { status: 'success', data: { id: params.id, code: removed.code } };
            } catch (error) {
                logFailure('delete', error);
                set.status = 503;
                return { status: 'error', message: 'Data belum terhapus.' };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Permanently delete one result and its proof of transfer (owner account only)' }
        })
        .post('/api/admin/assessments/:id/save-to-drive', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            if (!saveReportFiles) {
                set.status = 503;
                return { status: 'error', message: 'Google Drive belum diatur di server (GOOGLE_DRIVE_REFRESH_TOKEN kosong).' };
            }
            const row = await repository.get(params.id);
            if (!row || row.instrument !== 'mhcu') {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            if (row.status !== 'released') {
                set.status = 409;
                return { status: 'error', message: 'Laporan belum dirilis.' };
            }
            try {
                const saved = await saveReportFiles(row);
                if (!saved) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data tidak ditemukan.' };
                }
                await auditSafely({ actor: currentUser?.id ?? null, action: 'drive', submissionId: row.id, detail: `saved to Drive: ${saved.path}` });
                return { status: 'success', data: { path: saved.path } };
            } catch (error) {
                logFailure('save-to-drive', error);
                set.status = 502;
                return { status: 'error', message: `Drive menolak permintaan: ${error instanceof Error ? error.message.slice(0, 300) : 'error'}` };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Save (or save again) the released report to Google Drive (admin)' }
        })
        .post('/api/admin/assessments/sync', async () => {
            if (!dependencies.sheetSync) return { status: 'success', data: { configured: false, synced: 0, error: 'Not configured.' } };
            return { status: 'success', data: await dependencies.sheetSync.syncPending() };
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Copy pending submissions to the Google Sheet now' }
        });
};
