import { t } from 'elysia';
import { Value } from '@sinclair/typebox/value';

const EnvSchema = t.Object({
    DATABASE_URL: t.String({ minLength: 1 }),
    PORT: t.Optional(t.String()),
    FRONTEND_URL: t.Optional(t.String())
});

export const env = Value.Cast(EnvSchema, process.env);
const errors = [...Value.Errors(EnvSchema, process.env)];

if (errors.length > 0) {
    console.error("❌ Invalid environment variables:", errors);
    process.exit(1);
}
