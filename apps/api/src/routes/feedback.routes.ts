import { Elysia } from 'elysia';
import {
    FEEDBACK_KINDS, FEEDBACK_NOTE_MAX, FEEDBACK_STATUSES, feedbackFilesProblem, guessFeedbackKind, validateFeedback,
    type FeedbackKind, type FeedbackStatus, type UpdateLogEntry
} from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import { isOwnerUser } from '../security/owner';
import { canHandleFeedback, feedbackHandlers } from '../security/feedback-handlers';
import type { FeedbackSheet } from '../services/feedback-sheet';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { FeedbackChange, FeedbackEventInput, FeedbackRepository } from '../repositories/feedback.repository';
import type { DriveRequests } from '../services/drive-reports';
import { copyReportToDrive, readUploads } from '../services/feedback-files';
// Written by scripts/ci/write-update-log.ts when the images are built; empty in a local checkout.
import builtUpdateLog from '../data/update-log.json';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface FeedbackRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    feedbackRepository: FeedbackRepository;
    updateLog?: UpdateLogEntry[];
    /** Copies each report and its files into Drive (optional; without it they stay in the database). */
    driveRequests?: DriveRequests;
    /** The Google Sheet mirror (optional). */
    sheet?: FeedbackSheet;
    rateLimit?: { max: number; windowMs: number };
    now?: () => number;
}

/** Files waiting for Drive may not pile up in the database (and fill the disk) if Drive keeps failing. */
const MAX_PENDING_BYTES = 150 * 1024 * 1024;
/** Reports with files accepted per hour, from everyone together. */
const FILE_REPORTS_PER_HOUR = 30;

const FILE_PROBLEMS = {
    count: 'Maksimal 3 berkas.',
    type: 'Jenis berkas tidak didukung. Pakai gambar, PDF, video MP4/MOV, Word, Excel, PowerPoint, atau TXT.',
    empty: 'Ada berkas yang kosong.',
    size: 'Satu berkas maksimal 5 MB.',
    total: 'Total semua berkas maksimal 7 MB.',
    content: 'Isi berkas tidak sesuai dengan jenisnya.',
    busy: 'Sedang tidak bisa menerima berkas. Kirim tanpa berkas atau coba lagi nanti.'
};

// The ingress appends the real client address, so the last entry is the one to trust.
const clientKey = (headers: Record<string, string | undefined>) =>
    headers['x-forwarded-for']?.split(',').map((part) => part.trim()).filter(Boolean).pop() ?? 'unknown';

export const createFeedbackRoutes = (dependencies: FeedbackRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.feedbackRepository;
    const limit = dependencies.rateLimit ?? { max: 5, windowMs: 10 * 60 * 1000 };
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();

    const isRateLimited = (key: string) => {
        const recent = (hits.get(key) ?? []).filter((at) => at > now() - limit.windowMs);
        const limited = recent.length >= limit.max;
        if (!limited) recent.push(now());
        hits.set(key, recent);
        return limited;
    };

    let fileReports: number[] = [];
    const isFileFlood = () => {
        fileReports = fileReports.filter((at) => at > now() - 3600_000);
        if (fileReports.length >= FILE_REPORTS_PER_HOUR) return true;
        fileReports.push(now());
        return false;
    };

    const forbidden = (set: { status?: number | string }, message: string) => {
        set.status = 403;
        return { status: 'forbidden', message };
    };
    const handlersOnly = (set: { status?: number | string }) => forbidden(set, 'Hanya penanggung jawab laporan yang dapat mengubahnya.');
    const badRequest = (set: { status?: number | string }, message: string) => {
        set.status = 400;
        return { status: 'badRequest', message };
    };
    const syncSheet = () => void dependencies.sheet?.sync();
    const notFound = (set: { status?: number | string }) => {
        set.status = 404;
        return { status: 'notFound', message: 'Laporan tidak ditemukan.' };
    };

    return new Elysia({ name: 'feedback-routes' })
        .use(roleGuard)
        .post('/api/public/feedback', async ({ body, headers, set }: any) => {
            // Honeypot: pretend success so bots learn nothing, store nothing.
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { status: 'success' };
            }
            if (isRateLimited(clientKey(headers))) {
                set.status = 429;
                return { status: 'error', message: 'Terlalu banyak kiriman. Coba lagi beberapa menit lagi.' };
            }
            const result = validateFeedback(body);
            if (!result.ok) {
                set.status = 400;
                return { status: 'error', errors: result.errors };
            }
            const refuse = (reason: keyof typeof FILE_PROBLEMS) => {
                set.status = 400;
                return { status: 'error', errors: { files: FILE_PROBLEMS[reason] } };
            };
            const attached: File[] = [body.files].flat().filter((file): file is File => file instanceof File);
            const problem = feedbackFilesProblem(attached);
            if (problem) return refuse(problem);
            if (attached.length > 0) {
                const incoming = attached.reduce((sum, file) => sum + file.size, 0);
                if (isFileFlood() || (await repository.pendingBytes()) + incoming > MAX_PENDING_BYTES) return refuse('busy');
            }
            const uploads = await readUploads(attached);
            if (!uploads) return refuse('content');
            // When the text clearly points to the other type, use that one and keep a record; a handler can switch it back.
            const chosen = result.value.kind;
            const kind = guessFeedbackKind(result.value.message) ?? chosen;
            const events: FeedbackEventInput[] = [{ actor: '', action: 'received' }];
            if (kind !== chosen) events.push({ actor: '', action: 'auto_kind', detail: `${chosen} > ${kind}` });
            const { id } = await repository.create({ ...result.value, kind }, uploads, events);
            // The visitor never waits for Google; a failed copy is recorded and can be sent again from the portal.
            void (async () => {
                if (dependencies.driveRequests) await copyReportToDrive(id, repository, dependencies.driveRequests);
                await dependencies.sheet?.sync();
            })();
            set.status = 201;
            return { status: 'success' };
        }, { detail: { tags: ['Feedback'], summary: 'Send a bug report or suggestion about the website' } })
        .get('/api/admin/feedback', async ({ set, currentUser }: any) => {
            set.headers['cache-control'] = 'no-store';
            return {
                status: 'success',
                data: {
                    reports: await repository.list(),
                    handlers: feedbackHandlers(),
                    canHandle: canHandleFeedback(currentUser),
                    canDelete: isOwnerUser(currentUser),
                    sheetUrl: dependencies.sheet?.url() ?? ''
                }
            };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'List reports (admins)' } })
        .put('/api/admin/feedback/:id', async ({ params, body, set, currentUser }: any) => {
            if (!canHandleFeedback(currentUser)) return handlersOnly(set);
            const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
            const { status, kind, assignee } = input;
            if (status !== undefined && !FEEDBACK_STATUSES.includes(status as FeedbackStatus)) return badRequest(set, 'Status tidak valid.');
            if (kind !== undefined && !FEEDBACK_KINDS.includes(kind as FeedbackKind)) return badRequest(set, 'Jenis tidak valid.');
            if (assignee !== undefined && assignee !== '' && !feedbackHandlers().includes(String(assignee))) return badRequest(set, 'Orang itu bukan penanggung jawab laporan.');
            if (status === undefined && kind === undefined && assignee === undefined) return badRequest(set, 'Tidak ada yang diubah.');
            const report = UUID.test(params.id) ? await repository.get(params.id) : null;
            if (!report) return notFound(set);

            const actor = currentUser.email as string;
            const change: FeedbackChange = {};
            const events: FeedbackEventInput[] = [];
            const record = (action: FeedbackEventInput['action'], from: string, to: string) => events.push({ actor, action, detail: `${from} > ${to}` });
            if (status !== undefined && status !== report.status) {
                change.status = status as FeedbackStatus;
                record('status', report.status, change.status);
            }
            if (kind !== undefined && kind !== report.kind) {
                change.kind = kind as FeedbackKind;
                record('kind', report.kind, change.kind);
            }
            // Starting work on a report nobody has taken gives it to the person who started it.
            const nextAssignee = assignee !== undefined ? String(assignee) : change.status === 'in_progress' && !report.assignee ? actor.toLowerCase() : undefined;
            if (nextAssignee !== undefined && nextAssignee !== report.assignee) {
                change.assignee = nextAssignee;
                record('assignee', report.assignee || '-', nextAssignee || '-');
            }
            if (events.length > 0) {
                await repository.update(params.id, change, events);
                syncSheet();
            }
            return { status: 'success', data: await repository.get(params.id) };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Change status, type or who processes a report (handlers)' } })
        .post('/api/admin/feedback/:id/notes', async ({ params, body, set, currentUser }: any) => {
            if (!canHandleFeedback(currentUser)) return handlersOnly(set);
            const text = typeof body?.body === 'string' ? body.body.trim() : '';
            const attached: File[] = [body?.files].flat().filter((file): file is File => file instanceof File);
            if (text.length > FEEDBACK_NOTE_MAX) return badRequest(set, `Catatan maksimal ${FEEDBACK_NOTE_MAX} karakter.`);
            if (!text && attached.length === 0) return badRequest(set, 'Tulis catatan atau lampirkan berkas.');
            const problem = feedbackFilesProblem(attached);
            if (problem) return badRequest(set, FILE_PROBLEMS[problem]);
            const report = UUID.test(params.id) ? await repository.get(params.id) : null;
            if (!report) return notFound(set);
            if (attached.length > 0) {
                const incoming = attached.reduce((sum, file) => sum + file.size, 0);
                if ((await repository.pendingBytes()) + incoming > MAX_PENDING_BYTES) return badRequest(set, FILE_PROBLEMS.busy);
            }
            // A name already used by this report would overwrite that file in Drive.
            const taken = [...report.files, ...report.notes.flatMap((note) => note.files)].map((file) => file.name);
            const uploads = await readUploads(attached, taken);
            if (!uploads) return badRequest(set, FILE_PROBLEMS.content);
            await repository.addNote(params.id, { author: currentUser.email, body: text }, uploads);
            if (uploads.length > 0 && dependencies.driveRequests) await copyReportToDrive(params.id, repository, dependencies.driveRequests);
            syncSheet();
            set.status = 201;
            return { status: 'success', data: await repository.get(params.id) };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Add a note and files to a report (handlers)' } })
        .post('/api/admin/feedback/:id/drive', async ({ params, set, currentUser }: any) => {
            if (!canHandleFeedback(currentUser)) return handlersOnly(set);
            if (!UUID.test(params.id) || !(await repository.get(params.id))) return notFound(set);
            if (!dependencies.driveRequests) {
                set.status = 503;
                return { status: 'error', message: 'Google Drive belum diatur di server.' };
            }
            const copied = await copyReportToDrive(params.id, repository, dependencies.driveRequests);
            const report = await repository.get(params.id);
            if (!copied) {
                set.status = 502;
                return { status: 'error', message: `Gagal menyalin ke Drive: ${report?.driveError ?? 'error'}` };
            }
            syncSheet();
            return { status: 'success', data: report };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Copy a report to Drive again (handlers)' } })
        .delete('/api/admin/feedback/:id', async ({ params, set, currentUser }: any) => {
            if (!isOwnerUser(currentUser)) return forbidden(set, 'Hanya akun pemilik yang dapat menghapus laporan.');
            if (!UUID.test(params.id) || !(await repository.delete(params.id))) return notFound(set);
            syncSheet();
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Delete a report (owner account only)' } })
        .get('/api/admin/update-log', async ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
            return { status: 'success', data: dependencies.updateLog ?? (builtUpdateLog as UpdateLogEntry[]) };
        }, { requireRole: 'admin', detail: { tags: ['Update log'], summary: 'History of website updates' } });
};
