# JSX Inline Sibling Whitespace Collapsing and Testing-Library Accessible Name Matching

**Symptoms:**
- Unit or integration tests querying buttons by accessible name (e.g. `screen.getByRole('button', { name: /jeanette adult clinical/i })`) fail with `Unable to find an accessible element with the role "button" and name "/jeanette adult clinical/i"`.
- Buttons appear visually separated with flex gap (`gap-2`), but text nodes are glued together in the accessibility tree without spaces (`"JeanetteAdult clinical"`).

**Root Cause:**
- In JSX, when adjacent inline elements (e.g. `<span>{name}</span><span>{area}</span>`) are placed on separate lines without an explicit whitespace literal `{' '}`, React collapses the adjacent DOM text nodes into a continuous string without whitespace.

**Rule:**
- When rendering adjacent inline text elements that represent distinct words inside buttons or headings, always include an explicit whitespace delimiter `{' '}` between them.
- Provide explicit `title` or `aria-label` attributes on composite interactive elements to guarantee deterministic accessible names regardless of styling or layout wrappers.
