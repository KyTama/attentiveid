import { Elysia, t } from 'elysia';
import { createRoleGuardPlugin } from '../security/role-guard';
import { createAdminCapability } from '../services/authorization-capability';
import type { HeroSection, LandingHistory } from '../services/landing-history';
import type { AuthTokenService, AuthUserRepository } from './auth';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PENDING = 5;

export interface LandingHistoryRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    history: LandingHistory;
    now?: () => Date;
}

type Set = { status?: number | string; headers: Record<string, string | number> };

export const createLandingHistoryRoutes = (dependencies: LandingHistoryRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({ tokenService: dependencies.tokenService, userRepository: dependencies.userRepository });
    const { history } = dependencies;
    const now = dependencies.now ?? (() => new Date());
    const fail = (set: Set, status: number, message: string) => {
        set.status = status;
        return { status: 'error', message };
    };
    const heroOf = async (id: unknown) => (typeof id === 'string' && UUID.test(id) ? history.hero(id) : null);

    return new Elysia({ name: 'landing-history-routes' })
        .use(roleGuard)
        .get('/api/admin/landing/history', async ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
            return { status: 'success', data: { versions: await history.versions(), schedules: await history.schedules() } };
        }, { requireRole: 'admin', detail: { tags: ['Landing CMS'], summary: 'Published versions and scheduled highlights' } })
        .get('/api/admin/landing/history/:id', async ({ params, set }: any) => {
            const hero = await heroOf(params.id);
            return hero ? { status: 'success', data: { hero } } : fail(set, 404, 'Versi ini tidak bisa dibaca.');
        }, { requireRole: 'admin', detail: { tags: ['Landing CMS'], summary: 'The highlight of one published version' } })
        .post('/api/admin/landing/history/:id/restore-highlight', async ({ params, set, currentUser }: any) => {
            const hero = await heroOf(params.id);
            if (!hero) return fail(set, 404, 'Versi ini tidak bisa dibaca.');
            try {
                await history.publishHero(createAdminCapability(currentUser.id), hero);
            } catch {
                return fail(set, 409, 'Highlight versi ini tidak bisa diterbitkan. Tidak ada yang berubah.');
            }
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Landing CMS'], summary: 'Put an earlier highlight live again' } })
        .post('/api/admin/landing/schedule', async ({ body, set, currentUser }: any) => {
            const publishAt = new Date(typeof body?.publishAt === 'string' ? body.publishAt : '');
            if (Number.isNaN(publishAt.getTime())) return fail(set, 400, 'Pilih tanggal dan jam tayang.');
            const ahead = publishAt.getTime() - now().getTime();
            if (ahead < 60_000) return fail(set, 400, 'Waktu tayang harus di masa depan.');
            if (ahead > 365 * 24 * 60 * 60 * 1000) return fail(set, 400, 'Paling jauh satu tahun ke depan.');
            // Either a published version, or the highlight as it is in the editor now.
            const hero: HeroSection | null = body?.revisionId !== undefined ? await heroOf(body.revisionId) : (body?.hero?.key === 'hero' ? body.hero : null);
            if (!hero || !(await history.fits(createAdminCapability(currentUser.id), hero))) return fail(set, 400, 'Isi highlight belum lengkap atau tidak valid.');
            if ((await history.schedules()).filter((item) => item.status === 'pending').length >= MAX_PENDING) return fail(set, 409, `Maksimal ${MAX_PENDING} jadwal menunggu.`);
            const id = await history.schedule(hero, publishAt, currentUser.email);
            set.status = 201;
            return { status: 'success', data: { id } };
        }, { requireRole: 'admin', body: t.Any(), detail: { tags: ['Landing CMS'], summary: 'Publish a highlight later' } })
        .delete('/api/admin/landing/schedule/:id', async ({ params, set }: any) =>
            UUID.test(params.id) && (await history.cancel(params.id)) ? { status: 'success' } : fail(set, 404, 'Jadwal tidak ditemukan atau sudah tayang.'),
        { requireRole: 'admin', detail: { tags: ['Landing CMS'], summary: 'Cancel a scheduled highlight' } });
};
