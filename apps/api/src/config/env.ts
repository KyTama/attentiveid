import { t } from 'elysia';
import { Value } from '@sinclair/typebox/value';

const EnvSchema = t.Object({
    DATABASE_URL: t.String({ minLength: 1 }),
    PORT: t.Optional(t.String()),
    FRONTEND_URL: t.Optional(t.String()),
    PREVIEW_HMAC_SECRET: t.Optional(t.String()),
    JWT_SECRET: t.Optional(t.String())
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
