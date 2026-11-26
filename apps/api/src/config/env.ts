import { t } from 'elysia';
import { Value } from '@sinclair/typebox/value';

const EnvSchema = t.Object({
    DATABASE_URL: t.String({ minLength: 1 }),
    PORT: t.Optional(t.String()),
    FRONTEND_URL: t.Optional(t.String()),
    PREVIEW_HMAC_SECRET: t.Optional(t.String()),
    JWT_SECRET: t.Optional(t.String()),
    MEDIA_DIR: t.Optional(t.String()),
    N8N_BOOKING_WEBHOOK_URL: t.Optional(t.String()),
    N8N_WEBHOOK_SECRET: t.Optional(t.String()),
    GOOGLE_CLIENT_ID: t.Optional(t.String()),
    GOOGLE_CLIENT_SECRET: t.Optional(t.String()),
    GOOGLE_REFRESH_TOKEN: t.Optional(t.String()),
    GOOGLE_SHEET_ID: t.Optional(t.String()),
    /** Refresh token of the Google account that owns the Drive folder for released reports (scope drive.file). Empty = reports are not saved to Drive. */
    GOOGLE_DRIVE_REFRESH_TOKEN: t.Optional(t.String()),
    /** Name of the top folder in My Drive (default: Reports). */
    GOOGLE_DRIVE_ROOT_FOLDER_NAME: t.Optional(t.String()),
    /** Id of the Drive folder the reports go into (a folder this app created; it can be moved anywhere in Drive). Empty = a Reports folder in My Drive. */
    GOOGLE_DRIVE_ROOT_FOLDER_ID: t.Optional(t.String()),
    /** Path of the Chromium binary that prints the report PDFs (default: found automatically). */
    CHROMIUM_PATH: t.Optional(t.String()),
    GOOGLE_SHEET_NAME: t.Optional(t.String()),
    FREE_SESSION_SHEET_ID: t.Optional(t.String()),
    FREE_SESSION_SHEET_NAME: t.Optional(t.String()),
    /** Private Google Sheet that mirrors assessment answers (empty = no mirror). */
    /** SMTP for the e-mails the site sends (Gmail: smtp.gmail.com, port 587, an app password). Empty = no e-mail is sent. */
    SMTP_HOST: t.Optional(t.String()),
    SMTP_PORT: t.Optional(t.String()),
    SMTP_USER: t.Optional(t.String()),
    SMTP_PASS: t.Optional(t.String()),
    SMTP_FROM: t.Optional(t.String()),
    SMTP_FROM_NAME: t.Optional(t.String()),
    SMTP_REPLY_TO: t.Optional(t.String()),
    /** "true" lets the Email menu really send bulk e-mail. Anything else: it cannot. */
    EMAIL_BULK_ENABLED: t.Optional(t.String()),
    /** Where replies to bulk e-mail go (default: the sending address with +bulk, e.g. contact+bulk@attentiveid.com). */
    EMAIL_BULK_REPLY_TO: t.Optional(t.String()),
    /** Where the alert goes when a Mental Health Check-Up result is Level 4 or 5 (default: contact@attentiveid.com). */
    ASSESSMENTS_ALERT_EMAIL: t.Optional(t.String()),
    ASSESSMENTS_SHEET_ID: t.Optional(t.String()),
    ASSESSMENTS_MHCU_SHEET_NAME: t.Optional(t.String()),
    BOOKING_NOTIFY_EMAIL: t.Optional(t.String())
});

export const parseEnv = (source: Record<string, string | undefined>) => {
    const errors = [...Value.Errors(EnvSchema, source)];
    if (errors.length > 0) {
        const invalidKeys = [...new Set(errors.map(({ path }) => path.replace(/^\//, '') || 'environment'))];
        throw new Error(`Invalid environment variables: ${invalidKeys.join(', ')}`);
    }
    return Value.Cast(EnvSchema, source);
};

export const env = parseEnv(process.env);
