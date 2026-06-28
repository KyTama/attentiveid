import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';

const queryClient = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 30
});

export const db = drizzle(queryClient);
