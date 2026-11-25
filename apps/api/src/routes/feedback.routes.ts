import { Elysia } from 'elysia';
import { feedbackFilesProblem, validateFeedback, type UpdateLogEntry } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import { isOwnerUser } from '../security/owner';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { FeedbackRepository } from '../repositories/feedback.repository';
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

    const ownerOnly = (set: { status?: number | string }) => {
        set.status = 403;
        return { status: 'forbidden', message: 'Hanya akun pemilik yang dapat membuka laporan.' };
    };
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
            const { id } = await repository.create(result.value, uploads);
            // The visitor never waits for Google; a failed copy is recorded and can be sent again from the portal.
            if (dependencies.driveRequests) void copyReportToDrive(id, repository, dependencies.driveRequests);
            set.status = 201;
            return { status: 'success' };
        }, { detail: { tags: ['Feedback'], summary: 'Send a bug report or suggestion about the website' } })
        .get('/api/admin/feedback', async ({ set, currentUser }: any) => {
            if (!isOwnerUser(currentUser)) return ownerOnly(set);
            set.headers['cache-control'] = 'no-store';
            return { status: 'success', data: await repository.list() };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'List reports (owner account only)' } })
        .put('/api/admin/feedback/:id', async ({ params, body, set, currentUser }: any) => {
            if (!isOwnerUser(currentUser)) return ownerOnly(set);
            if (typeof body?.done !== 'boolean') {
                set.status = 400;
                return { status: 'badRequest', message: 'Status tidak valid.' };
            }
            if (!UUID.test(params.id) || !(await repository.setDone(params.id, body.done))) return notFound(set);
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Mark a report done or open (owner account only)' } })
        .post('/api/admin/feedback/:id/drive', async ({ params, set, currentUser }: any) => {
            if (!isOwnerUser(currentUser)) return ownerOnly(set);
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
            return { status: 'success', data: report };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Copy a report to Drive again (owner account only)' } })
        .delete('/api/admin/feedback/:id', async ({ params, set, currentUser }: any) => {
            if (!isOwnerUser(currentUser)) return ownerOnly(set);
            if (!UUID.test(params.id) || !(await repository.delete(params.id))) return notFound(set);
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Feedback'], summary: 'Delete a report (owner account only)' } })
        .get('/api/admin/update-log', async ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
            return { status: 'success', data: dependencies.updateLog ?? (builtUpdateLog as UpdateLogEntry[]) };
        }, { requireRole: 'admin', detail: { tags: ['Update log'], summary: 'History of website updates' } });
};
