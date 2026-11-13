# Never Auto-Seed or Reseed Live Databases During Deployment

**When this applies:** Configuring deployment pipelines (`scripts/deploy/deploy.sh`), maintenance seed services (`compose.production.yml`), or managing CMS-editable tables (`psychologists`, `landing_*`) on staging/production VPS.

**Rule:**
1. **Deployment runs schema migrations only:** `scripts/deploy/deploy.sh` must run `migrate` only, and must **never** invoke `seed-landing`, `seed-psychologists`, `--upsert`, or `--force` automatically on deployment.
2. **CMS is the source of truth in live environments:** Any manual seeding, initial bootstrap, or fixture backfill against staging/production databases must be executed explicitly by an operator via `docker compose --profile maintenance ... run --rm --no-deps <service>` or dedicated SQL migrations.
3. **CI guard:** `scripts/ci/verify-runtime-config.sh` enforces that `deploy.sh` contains no `seed-landing`, `seed-psychologists`, `--upsert`, or `--force` invocations.

**Why:**
Passing `--upsert` to `seed-psychologists` in `deploy.sh` caused every CI/CD deployment to execute `resetFeaturedOrders()`, `onConflictDoUpdate`, and `deleteSupportAreas()`, overwriting live psychologist edits made through the CMS dashboard back to hardcoded `psychologistSeedFixtures`.
