# Active Task Checklist: Phase 1.21 — Closing Invitation Card Separation & Psychologist Carousel Photo Centering

> **Status:** IN PROGRESS  
> **Milestone:** Milestone 1.9 (IA Streamlining, Mobile Framing & Brand Cohesion)  
> **Active Focus:** Eliminate visual collision between ClosingInvitation and Navy Footer by transforming ClosingInvitation into a floating arched navy card with generous cream canvas breathing room, and eliminate rightward shift of Haykal and Nuzul photos by centering carousel slides and applying custom focal coordinates.

---

## Task Checklist
- [ ] **Step 1: Frame ClosingInvitation as a Floating Bento Invitation Card**:
  - In `ClosingInvitation.tsx`: Move the canvas background to warm cream (`bg-[#fbf8f2] px-5 py-12 sm:py-16 lg:px-8 lg:py-20`).
  - Wrap the content in an elegant rounded navy container (`max-w-7xl rounded-3xl bg-secondary shadow-lg overflow-hidden`) with the landscape art.
  - This creates clean, generous warm cream spacing before the Navy Footer begins, eliminating the monolithic navy collision completely.
- [ ] **Step 2: Calibrate Psychologist Carousel Alignment & Focal Points**:
  - In `FeaturedPsychologists.tsx`: Change Carousel options to `align: 'center'` and set `CarouselContent` to `ml-0` and `CarouselItem` to `pl-0` to remove asymmetric track margins.
  - Apply tailored horizontal focal coordinates: `object-[60%_10%]` for Haykal (centering his face from the right-shifted pose), `object-[42%_10%]` for Nuzul, and `object-[center_12%]` for default.
- [ ] **Step 3: Verification & Atomic Push**:
  - Run full test suite (56 tests) and verify linter and build.
  - Stage and commit atomically, then push to `origin/master`.

---

# Active Task Checklist: Phase 1.20 — Knowledge Graph Read-First & Continuous Rebuild Automation

> **Status:** COMPLETED  
> **Milestone:** Architecture & DX Governance  
> **Active Focus:** Enforce continuous reading and rebuilding of `code-review-graph` across git lifecycle, autopilot agent instructions, and workspace principles.

## Task Checklist
- [x] **Step 1: Git-Native Automation Hooks**:
  - Fix `.git/hooks/pre-commit` to execute `code-review-graph detect-changes --brief` before harvest gate exit.
  - Create executable `.git/hooks/post-commit` to run background `code-review-graph update` on successful commit.
  - Create executable `.git/hooks/post-merge` and `.git/hooks/post-checkout` for pull/switch branch updates.
- [x] **Step 2: Autopilot Agent Rule Enforcement**:
  - In `AGENTS.md`: Update Turn 1 to mandate querying the knowledge graph first and Turn 3 to mandate graph rebuilding upon task completion.
  - In `GEMINI.md`: Add graph rebuild mandate to Verification section and update workflow table.
  - In `.agent/rules/GEMINI.md`: Add File Dependency Awareness & Knowledge Graph Protocol to universal rules.
- [x] **Step 3: Document Workspace Principle**:
  - Add `.docs/principles/knowledge-graph-continuous-sync.md` (read first, rebuild on done).
  - Register Principle 10 in `.docs/principles/README.md`.
- [x] **Step 4: Verification & Graph Sync**:
  - Verify git hooks execution.
  - Run MCP `build_or_update_graph_tool` and `list_graph_stats_tool` to confirm zero drift with current commit.







