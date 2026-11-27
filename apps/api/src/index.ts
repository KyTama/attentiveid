import { createEmailCampaignsRepository } from './repositories/email-campaigns.repository';
import { createEmailSender } from './services/email-sender';
import { createLandingHistory } from './services/landing-history';
import { createAdminCapability } from './services/authorization-capability';
import { createGmailReader, syncInbox } from './services/email-inbox';
import { createEmailMessagesRepository } from './repositories/email-messages.repository';
import { createEmailContactsRepository } from './repositories/email-contacts.repository';
import { createApp, type App } from './app';
import { env } from './config/env';
import { db } from './db';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';
import { createDrizzleLandingContentSource, createLandingContentRepository } from './repositories/landing-content.repository';
import { createDrizzlePsychologistQuerySource, createPsychologistsRepository } from './repositories/psychologists.repository';
import { createArticlesRepository, createDrizzleArticleQuerySource } from './repositories/articles.repository';
import { createBookingRepository } from './repositories/booking.repository';
import { createFreeSessionRepository } from './repositories/free-session.repository';
import { createFreeSessionSheetSync } from './services/free-session-sheet-sync';
import { createAssessmentsRepository } from './repositories/assessments.repository';
import { createAssessmentsSheetSync } from './services/assessments-sheet-sync';
import { createMailer } from './services/mailer';
import { createDriveReports } from './services/drive-reports';
import { createFeedbackSheet } from './services/feedback-sheet';
import { createReviewSheet } from './services/review-sheet';
import { createReviewImportsRepository } from './repositories/review-imports.repository';
import { createFeedbackRepository } from './repositories/feedback.repository';
import { createMhcuOpsRepository } from './repositories/mhcu-ops.repository';
import { createMhcuSettingsStore } from './services/mhcu-settings-store';
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
const bookingRepository = createBookingRepository(db);

// Excel previews of the Email menu hold contact details: remove them when they expire, not only on the next upload.
const emailImportCleanup = createEmailContactsRepository(db);
const purgeEmailImports = () => void emailImportCleanup.purgeImports(new Date()).catch(() => console.error('[email] preview cleanup failed'));
purgeEmailImports();
setInterval(purgeEmailImports, 10 * 60 * 1000).unref();

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

// Free Session form -> Google Sheet ("Report Data Free Session", tab Sheet1). Uses the same Google
// credentials as the booking sync; the sheet must be editable by that Google account.
const FREE_SESSION_SHEET_DEFAULT_ID = '1ui7kFznMj7Jh16D7hJXMxnRiZK-SgZQJd2yA6xdpBHM';
const freeSessionRepository = createFreeSessionRepository(db);
const freeSessionSheetSync = createFreeSessionSheetSync({
    repository: freeSessionRepository,
    config: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN
        ? {
              google: {
                  clientId: env.GOOGLE_CLIENT_ID,
                  clientSecret: env.GOOGLE_CLIENT_SECRET,
                  refreshToken: env.GOOGLE_REFRESH_TOKEN,
                  spreadsheetId: env.FREE_SESSION_SHEET_ID || FREE_SESSION_SHEET_DEFAULT_ID
              },
              spreadsheetId: env.FREE_SESSION_SHEET_ID || FREE_SESSION_SHEET_DEFAULT_ID,
              sheetName: env.FREE_SESSION_SHEET_NAME || 'Sheet1'
          }
        : undefined,
    onError: (error) => console.error('[free-session] Google Sheet sync failed:', error instanceof Error ? error.message : error)
});

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

// Released MHCU reports -> Google Drive (Reports / MHCU / year / month / code). Only when GOOGLE_DRIVE_REFRESH_TOKEN is set.
const driveReports = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_DRIVE_REFRESH_TOKEN
    ? createDriveReports({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          refreshToken: env.GOOGLE_DRIVE_REFRESH_TOKEN,
          rootName: env.GOOGLE_DRIVE_ROOT_FOLDER_NAME,
          rootFolderId: env.GOOGLE_DRIVE_ROOT_FOLDER_ID
      })
    : undefined;

// Make "Web App Development / Update Request" exist as soon as the server runs, before the first request arrives.
void driveReports?.ensureRequestFolder().catch((error) => console.error('[feedback] Drive folder not ready:', error instanceof Error ? error.message : 'error'));

// Feedback reports -> a Google Sheet beside "Update Request". Written once at start, then after every change.
const feedbackRepository = createFeedbackRepository(db);
const feedbackSheet = driveReports ? createFeedbackSheet(() => feedbackRepository.list(), driveReports) : undefined;
void feedbackSheet?.sync();

// Reviews pasted into a Google Sheet -> the portal (hidden until an admin shows them). Read at start and every 30 minutes.
const reviewImportsRepository = createReviewImportsRepository(db);
const reviewSheet = driveReports ? createReviewSheet(reviewImportsRepository, driveReports) : undefined;
const importReviews = () => void reviewSheet?.importNow().catch((error) => console.error('[reviews] Import failed:', error instanceof Error ? error.message : 'error'));
importReviews();
setInterval(importReviews, 30 * 60 * 1000).unref();

// Assessments (Mental Health Check-Up...) -> a PRIVATE Google Sheet. Only runs when ASSESSMENTS_SHEET_ID is set.
const assessmentsRepository = createAssessmentsRepository(db);
const assessmentsSheetSync = createAssessmentsSheetSync({
    repository: assessmentsRepository,
    config: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN && env.ASSESSMENTS_SHEET_ID
        ? {
              google: {
                  clientId: env.GOOGLE_CLIENT_ID,
                  clientSecret: env.GOOGLE_CLIENT_SECRET,
                  refreshToken: env.GOOGLE_REFRESH_TOKEN,
                  spreadsheetId: env.ASSESSMENTS_SHEET_ID
              },
              spreadsheetId: env.ASSESSMENTS_SHEET_ID,
              mhcuSheetName: env.ASSESSMENTS_MHCU_SHEET_NAME || 'MHCU'
          }
        : undefined,
    onError: (error) => console.error('[assessments] Google Sheet sync failed:', error instanceof Error ? error.message : error)
});

// E-mail sent by the site (the result e-mail of the Mental Health Check-Up). Only active when SMTP_USER and SMTP_PASS are set.
const mhcuOpsRepository = createMhcuOpsRepository(db);
const mhcuSettings = createMhcuSettingsStore(mhcuOpsRepository, env.ASSESSMENTS_ALERT_EMAIL || 'contact@attentiveid.com');
// Load the stored MHCU prices and promo date once at start (a failure keeps the built-in defaults).
void mhcuSettings.get();

const mailer = createMailer({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
    fromName: env.SMTP_FROM_NAME || 'Attentive',
    replyTo: env.SMTP_REPLY_TO
});

// Bulk e-mail of the Email menu. Off unless EMAIL_BULK_ENABLED is "true" and the site has a mail account.
const emailSiteOrigin = env.FRONTEND_URL || 'http://localhost:5173';
const emailFrom = env.SMTP_FROM || env.SMTP_USER || '';
// Reading replies needs its own read-only permission (scripts/google-gmail-token.ts). Without it nothing is read.
const gmailRead = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GMAIL_READ_REFRESH_TOKEN
    ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, refreshToken: env.GMAIL_READ_REFRESH_TOKEN }
    : null;
const emailBulk = {
    inbox: Boolean(gmailRead),
    enabled: env.EMAIL_BULK_ENABLED === 'true',
    mailer,
    secret: jwtSecretValue!,
    siteOrigin: emailSiteOrigin,
    replyTo: env.EMAIL_BULK_REPLY_TO || emailFrom.replace('@', '+bulk@')
};
const emailCampaignsRepository = createEmailCampaignsRepository(db);
const emailMessagesRepository = createEmailMessagesRepository(db);
if (gmailRead && emailBulk.replyTo) {
    const reader = createGmailReader(gmailRead);
    let reading = false;
    // Every two minutes, one run at a time.
    setInterval(() => {
        if (reading) return;
        reading = true;
        void syncInbox({
            reader,
            messages: emailMessagesRepository,
            replyAddress: emailBulk.replyTo,
            contactIdByEmail: async (email) =>
                (await db.select({ id: schema.emailContacts.id }).from(schema.emailContacts).where(eq(schema.emailContacts.email, email)).limit(1))[0]?.id ?? null
        })
            .catch((error) => console.error('[email-inbox] reading replies failed:', error instanceof Error ? error.message : 'error'))
            .finally(() => { reading = false; });
    }, 120_000).unref();
}
if (!(emailBulk.enabled && mailer.isConfigured)) {
    // Switched off: whatever was running is paused and waits for an admin, even after it is switched on again.
    void emailCampaignsRepository.parkQueued().catch(() => console.error('[email-bulk] could not pause queued sends'));
} else {
    const sender = createEmailSender({
        queue: emailCampaignsRepository,
        mailer,
        secret: emailBulk.secret,
        siteOrigin: emailSiteOrigin,
        replyTo: emailBulk.replyTo,
        messageDomain: emailFrom.split('@')[1] || 'attentiveid.com'
    });
    // One e-mail every 3 seconds at most.
    setInterval(() => {
        void sender.tick().catch((error) => console.error('[email-bulk] sender failed:', error instanceof Error ? error.name : 'error'));
    }, 3000).unref();
}

// Earlier homepage versions, and highlight cards waiting for their time (checked every minute).
const landingHistory = createLandingHistory(db, contentTransitions, async (id) => {
    const read = await landingRepository.getRevision(id);
    return read ? { content: read.content, publishedAt: read.revision.publishedAt } : null;
});
setInterval(() => {
    void landingHistory.runDue(createAdminCapability('scheduler'), new Date())
        .catch((error) => console.error('[landing-schedule] failed:', error instanceof Error ? error.name : 'error'));
}, 60_000).unref();

const app = createApp({
    mailer,
    emailBulk,
    emailCampaignsRepository,
    emailMessagesRepository,
    alertEmail: env.ASSESSMENTS_ALERT_EMAIL || 'contact@attentiveid.com',
    mhcuSettings,
    mhcuOpsRepository,
    paymentSecret: jwtSecretValue,
    assessmentsRepository,
    assessmentsSheetSync,
    driveReports,
    driveRequests: driveReports,
    feedbackRepository,
    feedbackSheet,
    reviewImportsRepository,
    reviewSheet,
    freeSessionRepository,
    freeSessionSheetSync,
    frontendOrigin: env.FRONTEND_URL || 'http://localhost:5173',
    landingRepository,
    landingContentRepository: landingRepository,
    psychologistsRepository: createPsychologistsRepository(createDrizzlePsychologistQuerySource(db), { publicHosts: [] }),
    articlesRepository,
    contentTransitions,
    landingHistory,
    previewCapabilities: createPreviewCapabilityService({ secret: previewSecret, store: previewStore }),
    previewSessions: createPreviewSessionService({ secret: previewSecret, store: previewStore }),
    userRepository,
    tokenService,
    verifyPassword,
    bookingRepository,
    triggerOutboxDrain,
    db
})
    // Listen
    .listen({
        hostname: '0.0.0.0',
        port: Number(env.PORT) || 3000,
        // Bun accepts 128 MB by default. The biggest legitimate request is an image upload (5 MB), so cap it well below that.
        maxRequestBodySize: 8 * 1024 * 1024,
    });

console.log(
    `🦊 AttentiveId API is running at ${app.server?.hostname}:${app.server?.port}`
);
if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger docs available at http://localhost:${app.server?.port}/swagger`);
}

export type { App };
