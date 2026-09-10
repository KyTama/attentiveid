import { createApp, type App } from './app';
import { env } from './config/env';
import { db } from './db';
import { createDrizzleLandingContentSource, createLandingContentRepository } from './repositories/landing-content.repository';
import { createDrizzlePsychologistQuerySource, createPsychologistsRepository } from './repositories/psychologists.repository';
import { createDrizzleUserRepositorySource, createUserRepository, verifyPassword } from './repositories/users.repository';
import {
    createDrizzlePreviewCapabilityStore,
    createPreviewCapabilityService,
    createPreviewSessionService,
    requirePreviewHmacSecret
} from './security/preview-capability';
import {
    createDrizzleRefreshTokenStore,
    createTokenService,
    requireJwtSecret
} from './security/token-service';

const devFallbackSecret = 'attentive_dev_fallback_hmac_secret_32bytes_minimum_length_required!';

const previewSecretValue = env.PREVIEW_HMAC_SECRET
    || (process.env.NODE_ENV !== 'production' ? devFallbackSecret : undefined);
const previewSecret = requirePreviewHmacSecret(previewSecretValue);
const previewStore = createDrizzlePreviewCapabilityStore(db);

const jwtSecretValue = env.JWT_SECRET
    || (process.env.NODE_ENV !== 'production' ? devFallbackSecret : undefined);
const jwtSecret = requireJwtSecret(jwtSecretValue);
const tokenStore = createDrizzleRefreshTokenStore(db);
const tokenService = createTokenService({ secret: jwtSecret, store: tokenStore });
const userRepository = createUserRepository(createDrizzleUserRepositorySource(db));

const app = createApp({
    frontendOrigin: env.FRONTEND_URL || 'http://localhost:5173',
    landingRepository: createLandingContentRepository(createDrizzleLandingContentSource(db)),
    psychologistsRepository: createPsychologistsRepository(createDrizzlePsychologistQuerySource(db), { publicHosts: [] }),
    previewCapabilities: createPreviewCapabilityService({ secret: previewSecret, store: previewStore }),
    previewSessions: createPreviewSessionService({ secret: previewSecret, store: previewStore }),
    userRepository,
    tokenService,
    verifyPassword
})
    // Listen
    .listen({
        hostname: '0.0.0.0',
        port: Number(env.PORT) || 3000,
    });

console.log(
    `🦊 AttentiveId API is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📚 Swagger docs available at http://localhost:${app.server?.port}/swagger`);

export type { App };
