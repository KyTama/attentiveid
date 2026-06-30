# Figma Visual Order vs Dump Order

**When this applies:** When extracting text or images from a Figma layout dump (`output.txt`) that represents a grid or flex row.

**Principle:** Always check the `x` and `y` coordinates (`locationRelativeToParent`) to determine the true visual order of elements. The order of elements in the text dump array often reflects the layer creation order, not the visual layout.

**Why:** I wrongly ordered features for a section because I assumed the array order in the dump matched the left-to-right visual order, requiring the user to correct the order.

**How to apply:**
- Scan the `locationRelativeToParent.x` values for horizontally aligned elements.
- Sort elements from smallest `x` to largest `x`.
- Match text content to images by correlating their visual positions.
