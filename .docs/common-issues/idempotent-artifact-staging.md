# Make Artifact Staging Safe When Source Already Equals Destination

**When this applies:** An orchestrator and a worker share responsibility for staging the same artifact path.

**Rule:** Detect file identity before copying or installing an artifact into its canonical destination.

**Why:** Tools such as `install` reject source and destination that resolve to the same file, turning a valid pre-staged artifact into a deployment failure.

**How to apply:**
- Use Bash `-ef` to compare existing source and destination files.
- Normalize permissions in the same-file branch instead of copying.
- Continue all later operations from the canonical staged path.
