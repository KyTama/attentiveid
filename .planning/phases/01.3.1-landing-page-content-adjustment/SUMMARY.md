# Phase 01.3.1-landing-page-content-adjustment Summary

## Outcomes
- Updated i18n translation files (`en.json` and `id.json`) to include WhyUs, Psychologists (17 entries), Insights, CtaScreening, and Locations data.
- Created new section components: `WhyUs.tsx`, `Insights.tsx`, and `CtaScreening.tsx`, fully integrated with `react-i18next`.
- Updated existing components (`Products.tsx`, `Psychologists.tsx`, `Contact.tsx`) to handle new requirements such as catalog downloads, dynamic locations, and a horizontal carousel for psychologists.
- Re-assembled `LandingPage.tsx` with all components in the exact required flow and replaced `Services` with `WhyUs`.

## Commits
- feat(01.3.1-01): update i18n translation files with landing page content
- feat(01.3.1-02): create new section components
- feat(01.3.1-03): update existing components with new UI requirements
- feat(01.3.1-04): assemble LandingPage with new sections
