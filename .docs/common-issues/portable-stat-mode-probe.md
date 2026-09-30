# Probe GNU Stat Before BSD Stat in Portable Scripts

**When this applies:** A shell script must read file permissions on both GNU/Linux and BSD/macOS.

**Rule:** Try GNU `stat -c` first, then fall back to BSD `stat -f`.

**Why:** GNU `stat` accepts `-f` for filesystem status, so a BSD-first command can succeed with unintended output and prevent the GNU fallback from running.

**How to apply:**
- Use `stat -c '%a' "$path" 2>/dev/null || stat -f '%Lp' "$path"`.
- Validate the probe on both operating-system families.
- Test the actual security gate, not only fixture paths that skip permission checks.
