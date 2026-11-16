import { Elysia } from 'elysia';
import {
    dedupeFreeSessionRecords,
    freeSessionRecordsToCsv,
    validateFreeSessionSubmission
} from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { FreeSessionRepository } from '../repositories/free-session.repository';
import type { FreeSessionSheetSync } from '../services/free-session-sheet-sync';

export interface FreeSessionRateLimit {
    max: number;
    windowMs: number;
}

export interface FreeSessionRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    freeSessionRepository: FreeSessionRepository;
    /** Writes submissions to the Google Sheet (optional; without it submissions stay in the database only). */
    sheetSync?: FreeSessionSheetSync;
    rateLimit?: FreeSessionRateLimit;
    now?: () => number;
}

const DEFAULT_RATE_LIMIT: FreeSessionRateLimit = { max: 5, windowMs: 10 * 60 * 1000 };

// The ingress appends the real client address to X-Forwarded-For, so the last
// entry is the one the proxy vouches for; earlier entries are client-supplied.
const clientKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

export const createFreeSessionRoutes = (dependencies: FreeSessionRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.freeSessionRepository;
    const limit = dependencies.rateLimit ?? DEFAULT_RATE_LIMIT;
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();

    const isRateLimited = (key: string) => {
        const cutoff = now() - limit.windowMs;
        const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
        if (recent.length >= limit.max) {
            hits.set(key, recent);
            return true;
        }
        recent.push(now());
        hits.set(key, recent);
        return false;
    };

    return new Elysia({ name: 'free-session-routes' })
        .use(roleGuard)
        .post('/api/public/free-session', async ({ body, headers, set }: any) => {
            // Honeypot: pretend success so bots learn nothing, store nothing.
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { status: 'success' };
            }

            if (isRateLimited(clientKey(headers))) {
                set.status = 429;
                return { status: 'error', message: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
            }

            const result = validateFreeSessionSubmission(body);
            if (!result.ok) {
                set.status = 400;
                return { status: 'error', errors: result.errors };
            }

            const created = await repository.create(result.value);
            // The visitor never waits for Google; failures stay queued and are retried (next submission or portal button).
            void dependencies.sheetSync?.syncPending().catch(() => undefined);
            set.status = 201;
            return { status: 'success', data: { id: created.id } };
        }, {
            detail: {
                tags: ['Free Session'],
                summary: 'Submit the free session registration form'
            }
        })
        .get('/api/admin/free-session/submissions', async () => {
            const all = await repository.listAll();
            const records = dedupeFreeSessionRecords(all);
            return {
                status: 'success',
                data: {
                    total: all.length,
                    unique: records.length,
                    duplicates: all.length - records.length,
                    records
                }
            };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'List deduplicated free session submissions' }
        })
        .get('/api/admin/free-session/sheet-status', async () => {
            const sync = dependencies.sheetSync;
            if (!sync) return { status: 'success', data: { configured: false, pending: 0, failed: 0, spreadsheetUrl: null } };
            return { status: 'success', data: await sync.status() };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'How many submissions are not in the Google Sheet yet' }
        })
        .post('/api/admin/free-session/sync-sheet', async () => {
            const sync = dependencies.sheetSync;
            if (!sync) return { status: 'success', data: { configured: false, synced: 0, pending: 0, failed: 0, error: 'Google Sheet sync is not set up.' } };
            return { status: 'success', data: await sync.syncPending() };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'Send every submission not yet in the Google Sheet' }
        })
        .get('/api/admin/free-session/export.csv', async ({ set }: any) => {
            const records = dedupeFreeSessionRecords(await repository.listAll());
            const stamp = new Date(now()).toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
            set.headers['content-type'] = 'text/csv; charset=utf-8';
            set.headers['content-disposition'] = `attachment; filename="sesi-gratis-report-${stamp}.csv"`;
            set.headers['cache-control'] = 'no-store';
            return freeSessionRecordsToCsv(records);
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'Download the deduplicated report as CSV' }
        });
};
