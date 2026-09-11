# Common Issues Catalog

Deterministic facts, compile errors, test gotchas, and API rules that are settled by code or tools.

## How to add or refine a rule
Run the engine: [`how-to-learn.md`](../principles/how-to-learn.md) (7 steps).

## Active rules and gotchas

| # | Rule / Gotcha | Detail / Symptoms |
|---|---------------|-------------------|
| 1 | Create pipeline output directories before concurrent consumers start | [pipeline-output-directory-race.md](./pipeline-output-directory-race.md) |
| 2 | Probe GNU `stat` before BSD `stat` in portable scripts | [portable-stat-mode-probe.md](./portable-stat-mode-probe.md) |
| 3 | Make artifact staging safe when source already equals destination | [idempotent-artifact-staging.md](./idempotent-artifact-staging.md) |
| 4 | Match DB seed media references with public static media paths and case-sensitive Linux filesystems | [lowercase-static-media-paths.md](./lowercase-static-media-paths.md) |
| 5 | Return lifecycle hook objects from Elysia macros to ensure route interceptors attach | [elysia-macro-return-hooks.md](./elysia-macro-return-hooks.md) |
| 6 | Propagate auth bearer tokens to standalone service clients outside React component hooks | [standalone-service-auth-propagation.md](./standalone-service-auth-propagation.md) |
| 7 | Entity ID separation in author capabilities & atomic revision publish transitions | [article-author-foreign-key-and-publish-transitions.md](./article-author-foreign-key-and-publish-transitions.md) |

