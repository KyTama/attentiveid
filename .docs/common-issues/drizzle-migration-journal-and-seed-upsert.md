# Drizzle ORM Migration Journaling & Seed Upsert Synchronization

**When this applies:** Modifying Drizzle schemas (e.g. adding columns like `short_bio` to `psychologist_profile_translations`) and propagating changes to live PostgreSQL databases and existing seed data.

**Rule:**
1. **Never write raw migration SQL files manually:** Always run `drizzle-kit generate` (`bunx drizzle-kit generate --name=<slug>`) so Drizzle generates the SQL migration, the schema snapshot (`000x_snapshot.json`), and updates `drizzle/meta/_journal.json`.
2. **`drizzle-orm/migrator` silently ignores unindexed SQL files:** If a `.sql` file exists in `drizzle/` without a corresponding entry in `_journal.json`, `migrate()` will succeed without applying the SQL, leading to runtime PostgreSQL errors (`column "x" does not exist`).
3. **Use `--force` or `--upsert` when seeding updated columns:** When relational tables are already populated, seed bootstrap guards (`count(*) > 0`) skip execution. Always pass `--force` to run the upsert loop (`onConflictDoUpdate`) so existing rows receive newly added column values.

**Why:**
When adding `short_bio` to `psychologist_profile_translations`, creating `0005_psychologist_short_bio.sql` manually bypassed `_journal.json`. Subsequent database queries failed with `column "short_bio" does not exist`. Even after running the SQL migration, existing seeded psychologists lacked `short_bio` because the seed script exited early with `"Psychologist content already initialized."`

**How to apply:**
1. Generate the migration properly through the CLI:
```bash
bunx drizzle-kit generate --name=psychologist_short_bio
```
2. Apply the migration using the migrator runner:
```bash
DATABASE_URL="postgres://..." bun src/db/migrate.ts
```
3. Run the seed script with `--force` to update existing records:
```bash
DATABASE_URL="postgres://..." bun src/db/seed-psychologists.ts --force
```
