# Distinguish Git cleanup from local deletion
**When this applies:** a user asks to clean repository metadata, generated artifacts, editor settings, or agent tooling from Git.
**Principle:** clarify whether cleanup means deleting local files or only removing them from version control; when local tools must remain usable, prefer index-only removal plus explicit ignore rules.
**Why:** repository cleanliness and local workspace cleanliness are separate concerns. Treating them as identical can destroy useful local state.
**How to apply:**
- Inventory tracked state and local presence separately.
- Use `git rm --cached` for index-only cleanup.
- Add precise `.gitignore` patterns before untracking.
- Verify ignored files still exist locally after the Git change.
