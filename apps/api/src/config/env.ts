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
    GOOGLE_SHEET_NAME: t.Optional(t.String()),
    FREE_SESSION_SHEET_ID: t.Optional(t.String()),
    FREE_SESSION_SHEET_NAME: t.Optional(t.String()),
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
