import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is required to run migrations.');
    process.exit(1);
}

let parsedDatabaseUrl: URL;

try {
    parsedDatabaseUrl = new URL(databaseUrl);
} catch {
    console.error('DATABASE_URL must be a valid PostgreSQL URL.');
    process.exit(1);
}

if (parsedDatabaseUrl.protocol !== 'postgres:' && parsedDatabaseUrl.protocol !== 'postgresql:') {
    console.error('DATABASE_URL must use the postgres or postgresql protocol.');
    process.exit(1);
}

const migrationClient = postgres(databaseUrl, { max: 1 });
const migrationDatabase = drizzle(migrationClient);
const migrationsFolder = process.env.MIGRATIONS_DIR
    ?? fileURLToPath(new URL('../../drizzle', import.meta.url));

try {
    await migrate(migrationDatabase, { migrationsFolder });
    console.info('Database migrations completed.');
} catch (error) {
    console.error('Database migration failed:', error);
    process.exitCode = 1;
} finally {
    await migrationClient.end();
}
