# Academic Publication Metadata Enrichment & Admin Content Governance

**When this applies:** Integrating academic/scientific publication datasets (Google Scholar profiles, research papers) with public directory listings, practitioner profiles, and CMS administrative controls.

**Principle:**
1. **Bibliographic Enrichment over Raw Scholar Scraping:** Google Scholar stores abstracts and citation counts but does not provide standardized DOI fields. Enrich scraped metadata with public bibliographic APIs (such as Crossref) using title-token overlap scoring to obtain verified DOI URLs.
2. **Asymmetric Lifecycle Governance:** Authors follow a strict review cycle (`draft` -> `submit` -> `inReview` -> `approved`), but administrators must be granted direct entry/publish capabilities (`publishImmediately: true`), live retraction (`unpublish` to remove from public indexing), and transactional deletion.
3. **Active Directory Linkage:** When publications link authors to psychologist/researcher profiles (e.g., `/psychologists/:slug`), ensure the corresponding seed fixtures have `status: 'active'` so public lookups resolve cleanly.

**Why:**
Academic publications elevate institutional credibility and clinical authority, but require verifiable links (DOI) and agile administrative management. Without direct entry and retraction controls, administrators are unnecessarily blocked by author-review state machines.

**How to apply:**
1. **Enrich DOIs via Crossref:**
   ```ts
   const url = `https://api.crossref.org/works?rows=3&query.bibliographic=${encodeURIComponent(title)}`;
   // Match with title-word overlap >= 0.6 to resolve DOI
   ```
2. **Provide Admin Direct Publish in API:**
   ```ts
   if (body.publishImmediately && currentUser.role === 'admin') {
     await contentTransitions.submitArticleRevision(authorCap, revision.id, now);
     await contentTransitions.approveArticleRevision(adminCap, revision.id, 'Direct admin publish', now);
     await contentTransitions.publishArticleRevision(adminCap, article.id, revision.id);
   }
   ```
3. **Expose Unpublish & Delete Endpoints:**
   - `POST /api/admin/articles/:id/unpublish` transitions live articles back to `'unpublished'`.
   - `DELETE /api/admin/articles/:id` atomically clears revision pointers and deletes records.
