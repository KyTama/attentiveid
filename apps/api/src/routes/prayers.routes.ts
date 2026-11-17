import { Elysia, t } from 'elysia';
import { validatePrayerInput } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { PrayersRepository } from '../repositories/prayers.repository';
import type { AdminToolsRepository } from '../repositories/admin-tools.repository';

export interface PrayersRateLimit {
    max: number;
    windowMs: number;
}

export interface PrayersRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    prayersRepository: PrayersRepository;
    /** Read for the moderation choice (auto / manual) set in the portal. */
    adminToolsRepository: Pick<AdminToolsRepository, 'getSiteSettings'>;
    rateLimit?: PrayersRateLimit;
    now?: () => number;
}

const DEFAULT_RATE_LIMIT: PrayersRateLimit = { max: 3, windowMs: 10 * 60 * 1000 };
/** The same prayer sent again within this time is the same click arriving twice. */
const SAME_PRAYER_WINDOW_MS = 24 * 60 * 60 * 1000;

// The ingress appends the real client address to X-Forwarded-For, so the last entry is the one the proxy vouches for.
const clientKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

export const createPrayersRoutes = (dependencies: PrayersRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.prayersRepository;
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

    return new Elysia({ name: 'prayers-routes' })
        .use(roleGuard)
        .post('/api/public/prayers', async ({ body, headers, set }: any) => {
            // Honeypot: pretend success so bots learn nothing, store nothing.
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { status: 'success' };
            }
            if (isRateLimited(clientKey(headers))) {
                set.status = 429;
                return { status: 'error', message: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
            }
            const result = validatePrayerInput(body);
            if (!result.ok) {
                set.status = 400;
                return { status: 'error', errors: result.errors };
            }
            // The same prayer sent twice (a double click) is saved once.
            const earlier = await repository.findRecentSameText(result.value.prayer, SAME_PRAYER_WINDOW_MS);
            if (earlier) {
                set.status = 201;
                return { status: 'success' };
            }
            let hidden = false;
            try {
                hidden = (await dependencies.adminToolsRepository.getSiteSettings()).gift.moderation === 'manual';
            } catch {
                hidden = false;
            }
            await repository.create(result.value, { hidden });
            set.status = 201;
            return { status: 'success', data: { pendingApproval: hidden } };
        }, {
            body: t.Any(),
            detail: { tags: ['Prayers'], summary: 'Send a prayer for others (Let There Be Light)' }
        })
        .get('/api/public/prayers/random', async ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
            const prayer = await repository.random();
            return { status: 'success', data: prayer };
        }, {
            detail: { tags: ['Prayers'], summary: 'One random visible prayer, for the gift' }
        })
        .get('/api/admin/prayers', async () => ({ status: 'success', data: await repository.listAdmin() }), {
            requireRole: ['admin'],
            detail: { tags: ['Prayers'], summary: 'List prayers (admin)' }
        })
        .put('/api/admin/prayers/:id/hidden', async ({ params, body, set }: any) => {
            const hidden = body?.hidden === true;
            const found = await repository.setHidden(params.id, hidden);
            if (!found) {
                set.status = 404;
                return { status: 'notFound', message: 'Doa tidak ditemukan.' };
            }
            return { status: 'success' };
        }, {
            requireRole: ['admin'],
            body: t.Any(),
            detail: { tags: ['Prayers'], summary: 'Hide or show a prayer' }
        })
        .delete('/api/admin/prayers/:id', async ({ params, set }: any) => {
            const found = await repository.remove(params.id);
            if (!found) {
                set.status = 404;
                return { status: 'notFound', message: 'Doa tidak ditemukan.' };
            }
            return { status: 'success' };
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Prayers'], summary: 'Delete a prayer' }
        });
};
