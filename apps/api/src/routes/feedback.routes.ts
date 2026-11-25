import { Elysia } from 'elysia';
import { validateFeedback, type UpdateLogEntry } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import { isOwnerUser } from '../security/owner';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { FeedbackRepository } from '../repositories/feedback.repository';
// Written by scripts/ci/write-update-log.ts when the images are built; empty in a local checkout.
import builtUpdateLog from '../data/update-log.json';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface FeedbackRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    feedbackRepository: FeedbackRepository;
    updateLog?: UpdateLogEntry[];
    rateLimit?: { max: number; windowMs: number };
    now?: () => number;
}

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
            await repository.create(result.value);
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
