import { Elysia } from 'elysia';
import type { UserDto, UserRole } from '@attentiveid/shared';
import type { AuthTokenService, AuthUserRepository } from '../routes/auth';

export interface AuthGuardDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
}

export type AuthResult =
    | { user: UserDto; error: null }
    | { user: null; error: { status: 401; body: { status: 'unauthorized'; message: string } } };

export const authenticateBearerToken = async (
    authorizationHeader: string | undefined,
    dependencies: AuthGuardDependencies
): Promise<AuthResult> => {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return {
            user: null,
            error: {
                status: 401,
                body: { status: 'unauthorized', message: 'Authorization header missing or invalid.' },
            },
        };
    }

    const token = authorizationHeader.slice(7).trim();
    if (!token) {
        return {
            user: null,
            error: {
                status: 401,
                body: { status: 'unauthorized', message: 'Authorization token missing.' },
            },
        };
    }

    try {
        const payload = dependencies.tokenService.verifyAccessToken(token);
        const user = await dependencies.userRepository.findById(payload.sub);

        if (!user || user.status !== 'active') {
            return {
                user: null,
                error: {
                    status: 401,
                    body: { status: 'unauthorized', message: 'User account inactive or missing.' },
                },
            };
        }

        return { user, error: null };
    } catch {
        return {
            user: null,
            error: {
                status: 401,
                body: { status: 'unauthorized', message: 'Invalid or expired access token.' },
            },
        };
    }
};

export const createRoleGuardPlugin = (dependencies: AuthGuardDependencies) =>
    new Elysia({ name: 'role-guard-plugin' })
        .derive({ as: 'scoped' }, async ({ headers }) => {
            const auth = await authenticateBearerToken(headers.authorization, dependencies);
            return {
                currentUser: auth.user,
                authError: auth.error,
            };
        })
        .macro({
            requireAuth(enabled: boolean) {
                if (!enabled) return {};
                return {
                    async beforeHandle(ctx: any) {
                        const auth = await authenticateBearerToken(ctx.headers.authorization, dependencies);
                        if (auth.error || !auth.user) {
                            ctx.set.status = auth.error?.status || 401;
                            return auth.error?.body || { status: 'unauthorized', message: 'Unauthorized.' };
                        }
                        ctx.currentUser = auth.user;
                    },
                };
            },
            requireRole(roles: UserRole | UserRole[]) {
                const allowedRoles = Array.isArray(roles) ? roles : [roles];
                return {
                    async beforeHandle(ctx: any) {
                        const auth = await authenticateBearerToken(ctx.headers.authorization, dependencies);
                        if (auth.error || !auth.user) {
                            ctx.set.status = auth.error?.status || 401;
                            return auth.error?.body || { status: 'unauthorized', message: 'Unauthorized.' };
                        }
                        if (!allowedRoles.includes(auth.user.role)) {
                            ctx.set.status = 403;
                            return { status: 'forbidden', message: 'Insufficient permissions.' };
                        }
                        ctx.currentUser = auth.user;
                    },
                };
            },
            requireSelfOrRole({ paramName = 'userId', roles }: { paramName?: string; roles: UserRole | UserRole[] }) {
                const allowedRoles = Array.isArray(roles) ? roles : [roles];
                return {
                    async beforeHandle(ctx: any) {
                        const auth = await authenticateBearerToken(ctx.headers.authorization, dependencies);
                        if (auth.error || !auth.user) {
                            ctx.set.status = auth.error?.status || 401;
                            return auth.error?.body || { status: 'unauthorized', message: 'Unauthorized.' };
                        }
                        const targetId = ctx.params?.[paramName];
                        if (auth.user.id === targetId || allowedRoles.includes(auth.user.role)) {
                            ctx.currentUser = auth.user;
                            return;
                        }
                        ctx.set.status = 403;
                        return { status: 'forbidden', message: 'Insufficient permissions.' };
                    },
                };
            },
        });
