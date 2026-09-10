# Principle: PostgreSQL Enum Filter Strictness in Aggregations

## Context
When writing aggregation queries with Drizzle ORM (e.g. `count(*) filter (where column = 'value')`), passing a string that is not an explicitly registered member of a PostgreSQL `pgEnum` causes PostgreSQL to abort the query immediately (`invalid input value for enum ...: "..."`).

## Principle
1. **Enum Contract Alignment**: Always verify database enum definitions in `schema.ts` (e.g. `articleStatusEnum.enumValues`) before writing conditional aggregation filter clauses.
2. **Schema Separation**: Distinguish entity-level lifecycle states (e.g. `articles.status`: `draft`, `published`, `unpublished`, `archived`) from revision-level workflow states (e.g. `article_revisions.status`: `draft`, `inReview`, `approved`, `rejected`).
3. **Live Query Verification**: Never assume an aggregation query is valid based solely on TypeScript compilation; test the query against a live PostgreSQL instance.
