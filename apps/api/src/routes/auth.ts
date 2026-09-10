import { Elysia, t } from 'elysia';
import type { UserDto, UserRole, UserStatus } from '@attentiveid/shared';
import type { JwtAccessTokenPayload, RefreshTokenRecord } from '../security/token-service';

export interface AuthUserRepository {
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        role: UserRole;
        status: UserStatus;
        psychologistId: string | null;
        lastLoginAt: string | null;
        createdAt: string;
        updatedAt: string;
    } | null>;
    findById(id: string): Promise<UserDto | null>;
    updateLastLogin(userId: string): Promise<void>;
}

export interface AuthTokenService {
    issueAccessToken(user: UserDto, ttlSeconds?: number): { accessToken: string; expiresAt: string };
    verifyAccessToken(token: string): JwtAccessTokenPayload;
    issueRefreshToken(userId: string, ttlSeconds?: number): Promise<{ refreshToken: string; expiresAt: string }>;
    verifyRefreshToken(token: string): Promise<RefreshTokenRecord>;
    revokeRefreshToken(token: string): Promise<void>;
}

export interface AuthDependencies {
    userRepository: AuthUserRepository;
    tokenService: AuthTokenService;
    verifyPassword(password: string, hash: string): Promise<boolean>;
}

const refreshCookieName = 'attentive_refresh';

export const createAuthRoutes = (dependencies: AuthDependencies) => new Elysia({ name: 'auth-routes' })
    .post('/api/auth/login', async ({ body, cookie: { [refreshCookieName]: refreshCookie }, set }) => {
        const email = body.email.trim().toLowerCase();
        const user = await dependencies.userRepository.findByEmail(email);

        if (!user || user.status !== 'active') {
            set.status = 401;
            return { status: 'unauthorized', message: 'Invalid email or password.' };
        }

        const validPassword = await dependencies.verifyPassword(body.password, user.passwordHash);
        if (!validPassword) {
            set.status = 401;
            return { status: 'unauthorized', message: 'Invalid email or password.' };
        }

        await dependencies.userRepository.updateLastLogin(user.id);

        const userDto: UserDto = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            psychologistId: user.psychologistId,
            lastLoginAt: new Date().toISOString(),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        const { accessToken, expiresAt: accessExpiresAt } = dependencies.tokenService.issueAccessToken(userDto);
        const { refreshToken, expiresAt: refreshExpiresAt } = await dependencies.tokenService.issueRefreshToken(user.id);

        refreshCookie.set({
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/api/auth',
            expires: new Date(refreshExpiresAt)
        });

        return {
            status: 'success',
            accessToken,
            expiresAt: accessExpiresAt,
            user: userDto
        };
    }, {
        body: t.Object({
            email: t.String({ minLength: 3, maxLength: 254 }),
            password: t.String({ minLength: 1, maxLength: 128 })
        }),
        detail: {
            tags: ['Auth'],
            summary: 'Authenticate user',
            description: 'Verifies email and password, sets HttpOnly refresh cookie, and issues access token.'
        }
    })
    .post('/api/auth/refresh', async ({ cookie: { [refreshCookieName]: refreshCookie }, set }) => {
        const rawRefreshToken = refreshCookie.value;
        if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
            set.status = 401;
            return { status: 'unauthorized', message: 'Refresh token missing.' };
        }

        try {
            const tokenRecord = await dependencies.tokenService.verifyRefreshToken(rawRefreshToken);
            const user = await dependencies.userRepository.findById(tokenRecord.userId);
            if (!user || user.status !== 'active') {
                await dependencies.tokenService.revokeRefreshToken(rawRefreshToken);
                refreshCookie.remove();
                set.status = 401;
                return { status: 'unauthorized', message: 'User account inactive.' };
            }

            // Rotate refresh token
            await dependencies.tokenService.revokeRefreshToken(rawRefreshToken);
            const { refreshToken: newRefreshToken, expiresAt: refreshExpiresAt } = await dependencies.tokenService.issueRefreshToken(user.id);
            const { accessToken, expiresAt: accessExpiresAt } = dependencies.tokenService.issueAccessToken(user);

            refreshCookie.set({
                value: newRefreshToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/api/auth',
                expires: new Date(refreshExpiresAt)
            });

            return {
                status: 'success',
                accessToken,
                expiresAt: accessExpiresAt,
                user
            };
        } catch {
            refreshCookie.remove();
            set.status = 401;
            return { status: 'unauthorized', message: 'Invalid or expired refresh token.' };
        }
    }, {
        detail: {
            tags: ['Auth'],
            summary: 'Rotate refresh token',
            description: 'Verifies refresh token cookie, rotates refresh token, and returns new access token.'
        }
    })
    .post('/api/auth/logout', async ({ cookie: { [refreshCookieName]: refreshCookie } }) => {
        const rawRefreshToken = refreshCookie.value;
        if (rawRefreshToken && typeof rawRefreshToken === 'string') {
            await dependencies.tokenService.revokeRefreshToken(rawRefreshToken);
        }
        refreshCookie.remove();
        return { status: 'success' };
    }, {
        detail: {
            tags: ['Auth'],
            summary: 'User logout',
            description: 'Revokes refresh token in database and clears HttpOnly refresh cookie.'
        }
    })
    .get('/api/auth/me', async ({ headers, set }) => {
        const authorization = headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            set.status = 401;
            return { status: 'unauthorized', message: 'Authorization header missing or invalid.' };
        }

        const token = authorization.slice(7).trim();
        try {
            const payload = dependencies.tokenService.verifyAccessToken(token);
            const user = await dependencies.userRepository.findById(payload.sub);
            if (!user || user.status !== 'active') {
                set.status = 401;
                return { status: 'unauthorized', message: 'User account inactive.' };
            }
            return { status: 'success', user };
        } catch {
            set.status = 401;
            return { status: 'unauthorized', message: 'Invalid or expired access token.' };
        }
    }, {
        detail: {
            tags: ['Auth'],
            summary: 'Get current user profile',
            description: 'Verifies Bearer access token and returns authenticated user DTO.'
        }
    });
