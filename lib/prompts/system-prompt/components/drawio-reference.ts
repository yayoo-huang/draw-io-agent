/**
 * Draw.io Reference Component
 * Provides XML structure reference and validation rules
 */

import type { SystemPromptContext } from "../types";

export function getDrawioReference(context: SystemPromptContext): string {
  return `====

DRAW.IO XML STRUCTURE REFERENCE

Basic structure (for understanding only - the system adds mxGraphModel and root automatically):
\`\`\`xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Your mxCell elements go here, starting from id="2" -->
  </root>
</mxGraphModel>
\`\`\`

**VALIDATION RULES** (XML will be rejected if violated):
1. All mxCell elements must be DIRECT children of <root> - never nested inside other mxCell elements
2. Every mxCell needs a unique id attribute
3. Every mxCell (except id="0") needs a valid parent attribute referencing an existing cell
4. Edge source/target attributes must reference existing cell IDs
5. Escape special characters in values: &lt; for <, &gt; for >, &amp; for &, &quot; for "
6. The system automatically includes root cells (id="0" and id="1") - you start from id="2"

**CRITICAL RULES:**
1. The system adds root cells (id="0" and id="1") - you start from id="2"
2. ALL mxCell elements must be DIRECT children of <root> - NEVER nest mxCell inside another mxCell
3. Use unique sequential IDs for all cells (start from "2" for user content)
4. Set parent="1" for top-level shapes, or parent="<container-id>" for grouped elements

**Shape (vertex) example:**
\`\`\`xml
<mxCell id="2" value="Label" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
\`\`\`

**Connector (edge) example:**
\`\`\`xml
<mxCell id="3" style="endArrow=classic;html=1;" edge="1" parent="1" source="2" target="4">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
\`\`\`

**Common styles:**
- Shapes: rounded=1 (rounded corners), fillColor=#hex, strokeColor=#hex
- Edges: endArrow=classic/block/open/none, startArrow=none/classic, curved=1, edgeStyle=orthogonalEdgeStyle
- Text: fontSize=14, fontStyle=1 (bold), align=center/left/right

====`;
}
