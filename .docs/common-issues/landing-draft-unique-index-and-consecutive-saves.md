# Landing Draft Unique Partial Index & Consecutive Save Superseding

**When this applies:** Working with content aggregate versioning in PostgreSQL where draft revisions are protected by a singleton partial unique index (e.g. `landing_revisions_one_draft_per_aggregate` on `(aggregate_id) WHERE status = 'draft'`).

**Rule:**
1. **Supersede previous active drafts before inserting a new draft revision:** When an administrator edits content multiple times before clicking publish, each "Save Draft" attempt creates a new revision record. If an existing revision still holds `status = 'draft'`, inserting another row with `status = 'draft'` violates the partial unique index. Always atomically update previous draft records to `status = 'superseded'` in the same transaction before inserting the new draft.
2. **Sanitize optional UUID foreign key parameters:** If `basedOnRevisionId` is optional or empty, explicitly convert empty string (`""`) or whitespace strings to `null`. PostgreSQL strictly enforces UUID syntax (`type uuid`) and will reject `""` with `invalid input syntax for type uuid: ""`.

**Why:**
Saving draft changes in the CMS multiple times failed with:
`duplicate key value violates unique constraint "landing_revisions_one_draft_per_aggregate"`
because the second draft creation attempted to insert another `draft` status row while the prior draft was still unapproved/unpublished. Superseding previous active drafts ensures the partial index is always satisfied while retaining an immutable audit trail.
