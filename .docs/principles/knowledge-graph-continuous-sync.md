# Knowledge graph continuous sync — read first, rebuild on done
**When this applies:** any task involving codebase exploration, architectural changes, refactoring, or file modifications.
**Principle:** query the AST knowledge graph (`code-review-graph`) before inspecting raw files, and rebuild/update the graph when finishing modifications.
**Why:** querying Tree-sitter AST nodes and structural relationships (callers, callees, test coverage, blast radius) is token-efficient and prevents architectural blind spots. Keeping the index synchronized prevents stale graph drifts.
**How to apply:**
- **Turn 1 (Exploration)**: use `code-review-graph` MCP tools (`semantic_search_nodes_tool`, `query_graph_tool`, `get_impact_radius_tool`) to trace impact radius and callers.
- **Turn 2..N (Execution)**: keep code changes aligned with graph topology.
- **Final Turn (Completion)**: call `build_or_update_graph_tool` or CLI `code-review-graph update` so `.code-review-graph/graph.db` matches the latest commit/HEAD.
- **Git Hooks**: automated via `.git/hooks/post-commit`, `.git/hooks/post-merge`, and `.git/hooks/post-checkout`.
