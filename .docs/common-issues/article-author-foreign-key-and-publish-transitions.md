# Article Author Foreign Key & Revision Publish Transitions

**When this applies:** Designing or implementing content revision workflows (articles, clinical resources) where both admins (without dedicated psychologist records) and psychologist authors draft, review, and publish content.

**Rule:**
1. **Entity ID separation in author capabilities:** Capabilities guarding content ownership MUST receive the actual entity ID (`psychologists.id`), never the caller's auth ID (`users.id`), to satisfy relational foreign key constraints (`articles.owner_psychologist_id -> psychologists.id`).
2. **Atomically chain revision approval and publishing:** In aggregate pointer-based content systems, approving a revision (`status: 'approved'`) does not update the aggregate's live pointer. Handlers publishing approved content must invoke `publishArticleRevision` immediately following approval.
3. **Inject concrete repositories into Elysia/Drizzle app factory:** Never leave mock stubs or incomplete defaults in `createApp({ ... })` without wiring the real repository implementations from `db`.

**Why:**
When an admin user (`currentUser.psychologistId === null`) submitted an article, passing `currentUser.id` violated the database foreign key constraint. Furthermore, when `approve` succeeded in transitioning revision status to `'approved'`, the article aggregate's `published_revision_id` remained unset, preventing it from appearing in public directory queries.

**How to apply:**
1. In the CMS route, accept `ownerPsychologistId` from the payload or resolve an active psychologist when the creator is an admin:
```ts
const ownerPsychologistId = currentUser.role === 'admin'
  ? (body.ownerPsychologistId || defaultPsychologist.id)
  : currentUser.psychologistId;

const authorCap = createPsychologistAuthorCapability(ownerPsychologistId);
```
2. When handling admin approval for publication, chain approval and publishing:
```ts
const approved = await contentTransitions.approveArticleRevision(adminCap, articleId, revisionId);
if (!approved.ok) return { status: 'error', message: approved.error };

const published = await contentTransitions.publishArticleRevision(adminCap, articleId, revisionId);
return { status: 'success', article: published.article };
```
3. Always supply repositories explicitly in server entrypoints:
```ts
const app = createApp({
  articlesRepository: drizzleArticlesRepository,
  contentTransitions,
  // ...
});
```
