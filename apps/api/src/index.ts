import { createApp, type App } from './app';
import { env } from './config/env';
import { db } from './db';
import { createDrizzleLandingContentSource, createLandingContentRepository } from './repositories/landing-content.repository';
import { createDrizzlePsychologistQuerySource, createPsychologistsRepository } from './repositories/psychologists.repository';
import { createArticlesRepository, createDrizzleArticleQuerySource } from './repositories/articles.repository';
import { createBookingRepository } from './repositories/booking.repository';
import { createServicesRepository } from './repositories/services.repository';
import { createServicesInternalRepository } from './repositories/services-internal.repository';
import { processDueBookingOutbox } from './services/booking-outbox';
import { createContentTransitions, createDrizzleContentTransitionDatabase } from './services/content-transitions';
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
const articlesRepository = createArticlesRepository(createDrizzleArticleQuerySource(db));
const contentTransitions = createContentTransitions(createDrizzleContentTransitionDatabase(db));

const landingRepository = createLandingContentRepository(createDrizzleLandingContentSource(db));
const servicesRepository = createServicesRepository(db);
const servicesInternalRepository = createServicesInternalRepository(db);
const bookingRepository = createBookingRepository(db, { servicesRepository });

const googleOutboxConfig =
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_REFRESH_TOKEN &&
    env.GOOGLE_SHEET_ID
        ? {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
              refreshToken: env.GOOGLE_REFRESH_TOKEN,
              spreadsheetId: env.GOOGLE_SHEET_ID,
              sheetName: env.GOOGLE_SHEET_NAME || 'Sheet1',
              notifyEmail: env.BOOKING_NOTIFY_EMAIL || 'contact@attentiveid.com',
              sendEmail: true
          }
        : undefined;

let outboxDraining = false;
const triggerOutboxDrain = async () => {
    if (outboxDraining) return;
    outboxDraining = true;
    try {
        await processDueBookingOutbox({
            db,
            webhookUrl: env.N8N_BOOKING_WEBHOOK_URL,
            webhookSecret: env.N8N_WEBHOOK_SECRET,
            google: googleOutboxConfig,
            onError: (err) => console.error('[booking-outbox] Delivery error:', err)
        });
    } finally {
        outboxDraining = false;
    }
};

if (env.N8N_BOOKING_WEBHOOK_URL || googleOutboxConfig) {
    const outboxTimer = setInterval(() => {
        void triggerOutboxDrain();
    }, 30_000);
    outboxTimer.unref();
}

const app = createApp({
    frontendOrigin: env.FRONTEND_URL || 'http://localhost:5173',
    landingRepository,
    landingContentRepository: landingRepository,
    psychologistsRepository: createPsychologistsRepository(createDrizzlePsychologistQuerySource(db), { publicHosts: [] }),
    articlesRepository,
    contentTransitions,
    previewCapabilities: createPreviewCapabilityService({ secret: previewSecret, store: previewStore }),
    previewSessions: createPreviewSessionService({ secret: previewSecret, store: previewStore }),
    userRepository,
    tokenService,
    verifyPassword,
    bookingRepository,
    servicesRepository,
    servicesInternalRepository,
    triggerOutboxDrain,
    db
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
