# Active Task Checklist: Add Psychology Scientist Category & Wording Updates

> **Status:** COMPLETED  
> **Milestone:** Psychologist Categorization & Scientific Article Wording  
> **Active Focus:** Add "ilmuwan psikologi" (Psychology Scientist) category for psychologists, categorize Dr. Haykal as Psychology Scientist, and update articles page title wording to "Artikel Ilmiah" / "Scientific Article". (No commits).

---

## Action Items
- [x] **Add "psychologyScientist" category / support area**:
  - Update `packages/shared/src/content.ts` (`PSYCHOLOGIST_SUPPORT_AREAS`)
  - Update `apps/web/src/features/psychologists/types.ts` & `query.ts`
  - Update `apps/web/src/data/psychologists.ts` (`PsychologistCategory`)
  - Update `apps/web/src/i18n/locales/id.json` & `en.json` with "Ilmuwan Psikologi" / "Psychology Scientist"
- [x] **Categorize Dr. Haykal as Psychology Scientist**:
  - Update `apps/api/src/db/seed-psychologists.ts` (`supportArea: 'psychologyScientist'`)
  - Add Dr. Haykal to `apps/web/src/data/psychologists.ts` with `category: 'psychologyScientist'`
- [x] **Update Articles Page Wording**:
  - In `apps/web/src/pages/ArticlesPage.tsx`: change header wording to "Artikel Ilmiah" / "Scientific Article"
  - In `apps/web/src/pages/ArticleDetailPage.tsx`: update breadcrumb and badge wording
  - In `apps/web/src/i18n/locales/id.json` and `en.json`: update `headerTitle` and related keys
  - In `apps/web/tests/articles-pages.test.tsx`: update test assertion
- [x] **Verification**:
  - Run `bun test packages/shared/src/content.test.ts`
  - Run `bun test apps/api/src/db/`
  - Run `bun run test:web`
  - Run `bun run build`
