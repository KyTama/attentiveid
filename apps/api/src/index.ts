import { createApp, type App } from './app';
import { env } from './config/env';
import { db } from './db';
import { createDrizzleLandingContentSource, createLandingContentRepository } from './repositories/landing-content.repository';
import { createDrizzlePsychologistQuerySource, createPsychologistsRepository } from './repositories/psychologists.repository';
import {
    createDrizzlePreviewCapabilityStore,
    createPreviewCapabilityService,
    createPreviewSessionService,
    requirePreviewHmacSecret
} from './security/preview-capability';

const previewSecret = requirePreviewHmacSecret(env.PREVIEW_HMAC_SECRET);
const previewStore = createDrizzlePreviewCapabilityStore(db);
const app = createApp({
    frontendOrigin: env.FRONTEND_URL || 'http://localhost:5173',
    landingRepository: createLandingContentRepository(createDrizzleLandingContentSource(db)),
    psychologistsRepository: createPsychologistsRepository(createDrizzlePsychologistQuerySource(db), { publicHosts: [] }),
    previewCapabilities: createPreviewCapabilityService({ secret: previewSecret, store: previewStore }),
    previewSessions: createPreviewSessionService({ secret: previewSecret, store: previewStore }),
    accessLog: ({ method, path, body }) => console.info({ method, path, body })
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
