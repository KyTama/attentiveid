# Create Pipeline Output Directories Before Concurrent Consumers Start

**When this applies:** A shell pipeline writes an artifact through a consumer such as `tee` while the producer is expected to create the artifact directory.

**Rule:** Create the shared output directory before starting the pipeline.

**Why:** Pipeline processes start concurrently. A consumer can try to open its output before the producer reaches its directory-creation step, causing an intermittent or CI-only failure.

**How to apply:**
- Run `mkdir -p` before launching the pipeline.
- Keep directory ownership in the orchestration layer when multiple processes share it.
- Reproduce from an empty working directory rather than one containing stale build artifacts.
