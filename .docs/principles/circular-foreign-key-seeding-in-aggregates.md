# Circular Foreign Key Seeding in Aggregate Roots

## Context
When relational schemas model Aggregate Roots with active pointer revisions (e.g. `articles.published_revision_id` pointing to `article_revisions.id`, while `article_revisions.article_id` is a non-null foreign key pointing to `articles.id`), an insertion deadlock occurs if one tries to insert either entity completely in a single step with strict foreign key constraints (`onDelete: 'restrict'`).

## The Mechanics of Circular References
1. Inserting `article_revisions` first fails because `article_id` must reference an existing row in `articles`.
2. Inserting `articles` with `published_revision_id` directly fails because the referenced revision row does not exist yet.
3. PostgreSQL enforces constraints per row/statement unless deferred constraints are explicitly defined on transaction boundaries.

## Durable Pattern: Three-Step Aggregate Insertion
To seed or insert aggregate entities safely without disabling database foreign key constraints or relying on deferred constraints:

1. **Insert Aggregate Root First with Null Pointer**:
   Insert the parent row (`articles`) with its pointer columns set to `null` (`publishedRevisionId: null`, `draftRevisionId: null`).
2. **Insert Child Revision Row**:
   Insert the child row (`article_revisions`) with `article_id` referencing the freshly inserted aggregate root.
3. **Link Revision Pointer Back to Aggregate Root**:
   Execute a targeted `UPDATE articles SET published_revision_id = $revision_id WHERE id = $article_id` to establish the active publication pointer.

## Example (Drizzle ORM)
```typescript
// 1. Insert article root with null pointer
await tx.insert(schema.articles).values({
  id: articleId,
  ownerPsychologistId: psychologistId,
  slug: item.slug,
  status: 'published',
  publishedRevisionId: null,
});

// 2. Insert revision referencing article
await tx.insert(schema.articleRevisions).values({
  id: revisionId,
  articleId: articleId,
  revisionNumber: 1,
  status: 'approved',
  ...content,
});

// 3. Link published revision
await tx.update(schema.articles)
  .set({ publishedRevisionId: revisionId })
  .where(eq(schema.articles.id, articleId));
```

This ensures transactional atomicity, satisfies all relational foreign key checks, and preserves strict referential integrity.
