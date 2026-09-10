import { Elysia, t } from 'elysia';
import { eq, desc } from 'drizzle-orm';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import { hashPassword } from '../repositories/users.repository';
import { db as defaultDb } from '../db';
import { users, psychologists } from '../db/schema';

export interface UsersManagementDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    db?: typeof defaultDb;
}

export const createUsersManagementRoutes = (dependencies: UsersManagementDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository,
    });
    const db = dependencies.db || defaultDb;

    return new Elysia({ name: 'users-management-routes' })
        .use(roleGuard)
        .get(
            '/api/admin/users',
            async () => {
                const rows = await db
                    .select({
                        id: users.id,
                        email: users.email,
                        name: users.name,
                        role: users.role,
                        status: users.status,
                        psychologistId: users.psychologistId,
                        psychologistName: psychologists.name,
                        lastLoginAt: users.lastLoginAt,
                        createdAt: users.createdAt
                    })
                    .from(users)
                    .leftJoin(psychologists, eq(users.psychologistId, psychologists.id))
                    .orderBy(desc(users.createdAt));

                return {
                    status: 'success',
                    data: rows
                };
            },
            {
                requireRole: 'admin'
            }
        )
        .post(
            '/api/admin/users',
            async ({ body, set }: any) => {
                const email = body.email.trim().toLowerCase();

                // Check existing
                const existing = await db
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (existing.length > 0) {
                    set.status = 400;
                    return {
                        status: 'error',
                        message: 'Email sudah terdaftar untuk pengguna lain.'
                    };
                }

                const passwordHash = await hashPassword(body.password);

                const newUsers = await db
                    .insert(users)
                    .values({
                        email,
                        name: body.name.trim(),
                        passwordHash,
                        role: body.role,
                        psychologistId: body.psychologistId || null,
                        status: 'active'
                    })
                    .returning({
                        id: users.id,
                        email: users.email,
                        name: users.name,
                        role: users.role,
                        status: users.status
                    });

                return {
                    status: 'success',
                    message: 'Pengguna baru berhasil ditambahkan!',
                    data: newUsers[0]
                };
            },
            {
                requireRole: 'admin',
                body: t.Object({
                    email: t.String(),
                    name: t.String(),
                    password: t.String({ minLength: 8 }),
                    role: t.Union([t.Literal('admin'), t.Literal('psychologist')]),
                    psychologistId: t.Optional(t.Nullable(t.String()))
                })
            }
        )
        .patch(
            '/api/admin/users/:id/status',
            async ({ params, body, set }: any) => {
                const updated = await db
                    .update(users)
                    .set({
                        status: body.status,
                        updatedAt: new Date().toISOString()
                    })
                    .where(eq(users.id, params.id))
                    .returning({ id: users.id, status: users.status });

                if (updated.length === 0) {
                    set.status = 404;
                    return { status: 'error', message: 'Pengguna tidak ditemukan.' };
                }

                return {
                    status: 'success',
                    message: `Status pengguna berhasil diubah menjadi ${body.status}!`,
                    data: updated[0]
                };
            },
            {
                requireRole: 'admin',
                body: t.Object({
                    status: t.Union([t.Literal('active'), t.Literal('suspended')])
                })
            }
        )
        .post(
            '/api/admin/users/:id/reset-password',
            async ({ params, body, set }: any) => {
                const newHash = await hashPassword(body.password);

                const updated = await db
                    .update(users)
                    .set({
                        passwordHash: newHash,
                        updatedAt: new Date().toISOString()
                    })
                    .where(eq(users.id, params.id))
                    .returning({ id: users.id });

                if (updated.length === 0) {
                    set.status = 404;
                    return { status: 'error', message: 'Pengguna tidak ditemukan.' };
                }

                return {
                    status: 'success',
                    message: 'Password pengguna berhasil direset!'
                };
            },
            {
                requireRole: 'admin',
                body: t.Object({
                    password: t.String({ minLength: 8 })
                })
            }
        );
};
