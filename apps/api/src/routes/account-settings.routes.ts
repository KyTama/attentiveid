import { Elysia, t } from 'elysia';
import { and, eq, isNull } from 'drizzle-orm';
import { IDLE_TIMEOUT_MAX_MINUTES, IDLE_TIMEOUT_MIN_MINUTES } from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import * as schema from '../db/schema';
import { hashPassword, verifyPassword } from '../repositories/users.repository';
import { MIN_STAFF_PASSWORD_LENGTH } from '../security/user-management-policy';

export interface AccountSettingsDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    /** Saves the value for one user; returns false when the user does not exist. */
    saveIdleTimeout?: (userId: string, minutes: number) => Promise<boolean>;
    /** Changes the person's own password after checking the current one; also ends their other sign-ins. */
    changePassword?: (userId: string, currentPassword: string, newPassword: string) => Promise<'ok' | 'wrong' | 'notFound'>;
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

    const changePassword =
        dependencies.changePassword ??
        (async (userId: string, currentPassword: string, newPassword: string) => {
            const [row] = await dependencies.db
                .select({ hash: schema.users.passwordHash })
                .from(schema.users)
                .where(eq(schema.users.id, userId))
                .limit(1);
            if (!row) return 'notFound' as const;
            if (!(await verifyPassword(currentPassword, row.hash))) return 'wrong' as const;
            await dependencies.db
                .update(schema.users)
                .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date().toISOString() })
                .where(eq(schema.users.id, userId));
            // the old password may be known to someone else: every sign-in made with it ends
            await dependencies.db
                .update(schema.userRefreshTokens)
                .set({ revokedAt: new Date().toISOString() })
                .where(and(eq(schema.userRefreshTokens.userId, userId), isNull(schema.userRefreshTokens.revokedAt)));
            return 'ok' as const;
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
        })
        .post('/api/auth/me/password', async ({ body, set, currentUser }: any) => {
            const current = body?.currentPassword;
            const next = body?.newPassword;
            if (typeof current !== 'string' || typeof next !== 'string' || current.length === 0 || current.length > 128) {
                set.status = 400;
                return { status: 'error', message: 'Isi password saat ini dan password baru.' };
            }
            if (next.length < MIN_STAFF_PASSWORD_LENGTH || next.length > 128) {
                set.status = 400;
                return { status: 'error', message: `Password baru minimal ${MIN_STAFF_PASSWORD_LENGTH} karakter.` };
            }
            if (next === current) {
                set.status = 400;
                return { status: 'error', message: 'Password baru harus berbeda dari yang sekarang.' };
            }
            try {
                const result = await changePassword(currentUser.id, current, next);
                if (result === 'notFound') {
                    set.status = 404;
                    return { status: 'notFound', message: 'Akun tidak ditemukan.' };
                }
                if (result === 'wrong') {
                    set.status = 403;
                    return { status: 'forbidden', message: 'Password saat ini salah.' };
                }
                return { status: 'success', message: 'Password diganti. Silakan masuk lagi.' };
            } catch {
                set.status = 503;
                return { status: 'error', message: 'Password belum bisa diganti.' };
            }
        }, {
            requireAuth: true,
            body: t.Any(),
            detail: { tags: ['Auth'], summary: 'Change my own password (needs the current one; ends all sign-ins)' }
        });
};
