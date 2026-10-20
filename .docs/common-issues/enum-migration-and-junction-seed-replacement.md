# PostgreSQL Enum Migrations and Junction Table Seed Replacement

**When this applies:** Adding new enum values (e.g. `'psychologyScientist'` to `psychologist_support_area`) or changing a record's categorical relationship in relational junction tables that enforce multi-column unique constraints (such as `(psychologist_id, position)`).

**Rule:**
1. **PostgreSQL Enums Require Explicit Migrations:** PostgreSQL enums are static DB types. Adding a TypeScript union value to shared schemas will crash DB insertions unless an `ALTER TYPE ... ADD VALUE '...'` migration is generated and executed first.
2. **Junction Table Re-seeding Must Delete Stale Rows First:** When a junction table has a composite unique constraint like `(psychologist_id, position)` in addition to `(psychologist_id, support_area)`, updating a category fixture causes `ON CONFLICT (psychologist_id, support_area)` to attempt an `INSERT` (since the support area key is new), which collides with the existing row at `position = 0`. Seed routines must clear existing junction rows for that parent entity before re-inserting the updated list.

**Why:**
When Dr. Haykal was re-categorized from `adultClinical` to `psychologyScientist`:
- Drizzle needed migration `0006_psychology_scientist_support_area.sql` to register the new enum value in PostgreSQL.
- Running `db:seed:psychologists --force` threw `duplicate key value violates unique constraint "psychologist_support_areas_psychologist_position_unique"` because Haykal already possessed a row at `position: 0` with `adultClinical`. Adding `deleteSupportAreas(psychologistId)` prior to the insertion loop made the upsert completely idempotent and clean.

**How to apply:**
1. Generate migration using Drizzle Kit:
```bash
cd apps/api && bun x drizzle-kit generate
```
2. In junction table seed logic, ensure existing child rows are cleared for the target parent ID before looping over new fixtures:
```typescript
if (transaction.deleteSupportAreas) {
    await transaction.deleteSupportAreas(psychologistId);
}
```
3. Execute migration and force-seed with root env:
```bash
bun --env-file=../../.env run db:migrate
bun --env-file=../../.env run db:seed:psychologists -- --force
```
