import { Elysia, t } from 'elysia';
import type { UserDto, UserRole, UserStatus } from '@attentiveid/shared';
import { RefreshTokenReuseError, type JwtAccessTokenPayload, type RefreshTokenRecord } from '../security/token-service';
import { clientAddress, createLoginThrottle, type LoginThrottle } from '../security/login-throttle';

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
    /** False when the token had already been used or revoked. */
    revokeRefreshToken(token: string): Promise<boolean | void>;
    /** Signs the user out everywhere (used when a used refresh token is replayed). */
    revokeAllRefreshTokens?(userId: string): Promise<void>;
}

export interface AuthDependencies {
    userRepository: AuthUserRepository;
    tokenService: AuthTokenService;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    /** Limits wrong-password attempts; a default one is used when not given. */
    loginThrottle?: LoginThrottle;
}

const refreshCookieName = 'attentive_refresh';

// A browser only deletes a cookie when the path matches the one it was set with.
const clearRefreshCookie = (cookie: { set(options: Record<string, unknown>): unknown }) =>
    cookie.set({
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 0,
        expires: new Date(0)
    });

// A real argon2id hash of a random string nobody knows. Checking a password against it when the e-mail is unknown or the
// account is not active makes that answer take as long as a real one, so response time does not reveal which e-mails exist.
const UNKNOWN_USER_HASH = '$argon2id$v=19$m=65536,t=3,p=1$GWLWBKb5kj4Rt7Jz82qn76yGyDJ1OZ56E0jCMMGIkb8$FBo/fn57T1xfPAX+AqrvJrqOkIL/y+btAjYTB4AMk24';

// A refresh token used again within this time of its rotation is most likely a second tab or a retry, not theft.
const REUSE_GRACE_MS = 15_000;

export const createAuthRoutes = (dependencies: AuthDependencies) => {
    const throttle = dependencies.loginThrottle ?? createLoginThrottle();
    return new Elysia({ name: 'auth-routes' })
    .post('/api/auth/login', async ({ body, headers, cookie: { [refreshCookieName]: refreshCookie }, set }) => {
        const email = body.email.trim().toLowerCase();
        const address = clientAddress(headers);

        const gate = throttle.check(address, email);
        if (!gate.allowed) {
            set.status = 429;
            set.headers['retry-after'] = String(gate.retryAfterSeconds);
            return { status: 'error', message: 'Terlalu banyak percobaan masuk. Coba lagi beberapa menit lagi.' };
        }

        const user = await dependencies.userRepository.findByEmail(email);

        if (!user || user.status !== 'active') {
            await dependencies.verifyPassword(body.password, UNKNOWN_USER_HASH);
            throttle.recordFailure(address, email);
            set.status = 401;
            return { status: 'unauthorized', message: 'Invalid email or password.' };
        }

        const validPassword = await dependencies.verifyPassword(body.password, user.passwordHash);
        if (!validPassword) {
            throttle.recordFailure(address, email);
            set.status = 401;
            return { status: 'unauthorized', message: 'Invalid email or password.' };
        }
        throttle.recordSuccess(email);

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
                clearRefreshCookie(refreshCookie);
                set.status = 401;
                return { status: 'unauthorized', message: 'User account inactive.' };
            }

            // Rotate refresh token
            // Only the request that actually used up the token gets a new one. The cookie is left alone for the others,
            // because the winner has just given the browser a fresh one.
            if ((await dependencies.tokenService.revokeRefreshToken(rawRefreshToken)) === false) {
                set.status = 401;
                return { status: 'unauthorized', message: 'Invalid or expired refresh token.' };
            }
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
        } catch (error) {
            // Two tabs sending the same token moments apart is normal; the new cookie must survive it.
            const justRotated = error instanceof RefreshTokenReuseError && Date.now() - Date.parse(error.revokedAt) <= REUSE_GRACE_MS;
            // A token that was already used is shown again: it may have been copied. Sign that user out everywhere.
            if (error instanceof RefreshTokenReuseError && !justRotated) {
                try {
                    await dependencies.tokenService.revokeAllRefreshTokens?.(error.userId);
                } catch {
                    // the request is refused either way
                }
            }
            if (!justRotated) clearRefreshCookie(refreshCookie);
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
        clearRefreshCookie(refreshCookie);
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
};
