# Seed Fixture Evolution & Exact Assertion Coupling in Integration Tests

**When this applies:** Updating seed fixtures or practitioner profiles (e.g. adding training modalities like Brainspotting or areas of experience) while integration test suites assert exact query result lists.

**Rule:**
1. **Be aware of test assertions on shared seed fixtures:** When adding certifications, modalities, or tags to canonical practitioner fixtures (e.g., adding Brainspotting credentials to Gisella Tani Pratiwi), check repository integration tests (`shared-content.integration.test.ts`) that query those terms.
2. **Account for all matching rows:** Tests performing localized search filter queries (e.g. `repository.list({ locale: 'en', search: 'Brainspotting', limit: 50 })`) return all matching active practitioners ordered canonically by display name. Update assertions to verify all matching entities (`['gita', 'gisella']`) or assert subset inclusion if only checking a specific fixture.

**Why:**
In `apps/api/src/db/shared-content.integration.test.ts`, the test checked:
```ts
const psychologists = await repository.list({ locale: 'en', search: 'Brainspotting', limit: 50 })
expect(psychologists.map(({ slug }) => slug)).toEqual(['gita'])
```
When Gisella (`gisella`) was activated with Brainspotting credentials in the seed data, the live search legitimately returned both `['gita', 'gisella']` (alphabetical by name: Anggita before Gisella), causing the CI test contract to fail with:
```
(fail) shared content live PostgreSQL contract > searches localized areas of experience through the canonical PostgreSQL source
- Expected: ["gita"]
+ Received: ["gita", "gisella"]
```

**How to fix:**
Update the contract assertion to expect both practitioners:
```ts
expect(psychologists.map(({ slug }) => slug)).toEqual(['gita', 'gisella'])
```
Or check containing subset:
```ts
expect(psychologists.map(({ slug }) => slug)).toContain('gita')
```
