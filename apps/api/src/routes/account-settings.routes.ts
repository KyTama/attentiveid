import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { IDLE_TIMEOUT_MAX_MINUTES, IDLE_TIMEOUT_MIN_MINUTES } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import * as schema from '../db/schema';

export interface AccountSettingsDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    /** Saves the value for one user; returns false when the user does not exist. */
    saveIdleTimeout?: (userId: string, minutes: number) => Promise<boolean>;
    db?: any;
}

/** Each signed-in person's own settings. Only the person themself can change them. */
export const createAccountSettingsRoutes = (dependencies: AccountSettingsDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });

    const save =
        dependencies.saveIdleTimeout ??
        (async (userId: string, minutes: number) => {
            const rows = await dependencies.db
                .update(schema.users)
                .set({ idleTimeoutMinutes: minutes, updatedAt: new Date().toISOString() })
                .where(eq(schema.users.id, userId))
                .returning({ id: schema.users.id });
            return rows.length > 0;
        });

    return new Elysia({ name: 'account-settings-routes' })
        .use(roleGuard)
        .put('/api/auth/me/settings', async ({ body, set, currentUser }: any) => {
            const minutes = body?.idleTimeoutMinutes;
            if (!Number.isInteger(minutes) || minutes < IDLE_TIMEOUT_MIN_MINUTES || minutes > IDLE_TIMEOUT_MAX_MINUTES) {
                set.status = 400;
                return {
                    status: 'error',
                    message: `Batas waktu tidak aktif harus antara ${IDLE_TIMEOUT_MIN_MINUTES} dan ${IDLE_TIMEOUT_MAX_MINUTES} menit.`
                };
            }
            try {
                if (!(await save(currentUser.id, minutes))) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Akun tidak ditemukan.' };
                }
                return { status: 'success', data: { idleTimeoutMinutes: minutes } };
            } catch {
                set.status = 503;
                return { status: 'error', message: 'Pengaturan belum tersimpan.' };
            }
        }, {
            requireAuth: true,
            body: t.Any(),
            detail: { tags: ['Auth'], summary: 'Change my own settings (inactivity sign-out time)' }
        });
};
