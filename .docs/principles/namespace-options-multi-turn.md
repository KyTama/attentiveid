# Namespace Numbered Options in Multi-Turn Dialogs

**When this applies:**
When presenting multiple sets of options, sub-options, or nested choices over a multi-turn conversation with the user.

**Principle:**
Label options uniquely across context shifts, and always clarify the specific context of the choice rather than relying on bare numbers (e.g., "Opsi 1" or "Opsi 2").

**Why:**
Reusing generic labels like "Opsi 1" or "Opsi 2" across different context turns leads to confusion where the user references a previous set's option while the agent thinks they are referring to the current set's option.

**How to apply:**
- When shifting from main options to sub-options, rename the labels or prefix them (e.g. change Opsi 1/2 to Network Option A/B or Connection Opsi 1/2).
- Explicitly echo the full option context when confirming the user's choice (e.g., "Menyetujui Opsi 1 (Shared Network)...").
- Do not assume that a bare number in a user's reply always references the most recent turn if there are multiple active option lists in the chat history.
