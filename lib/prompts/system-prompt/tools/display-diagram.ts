/**
 * display_diagram tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const displayDiagramSpec: ToolSpec = {
  name: "display_diagram",
  description:
    "Display a NEW diagram on draw.io. Use this when creating a diagram from scratch or when major structural changes are needed.\n\n" +
    "CRITICAL SIZE CONSTRAINTS:\n" +
    "- Keep diagrams FOCUSED and MINIMAL - show only 8-12 most important components\n" +
    "- Bedrock has strict tool input size limits - large XML will be REJECTED\n" +
    "- Create HIGH-LEVEL diagrams showing main components and relationships\n" +
    "- Avoid excessive details, labels, or deeply nested structures\n\n" +
    "CRITICAL RULES:\n" +
    "1. Generate ONLY mxCell elements - NO wrapper tags (<mxfile>, <mxGraphModel>, <root>)\n" +
    "2. Do NOT include root cells (id=\"0\" or id=\"1\") - they are added automatically\n" +
    "3. All mxCell elements must be siblings - never nested\n" +
    "4. Every mxCell needs a unique id (start from \"2\")\n" +
    "5. Every mxCell needs a valid parent attribute (use \"1\" for top-level)\n" +
    "6. Escape special chars in values: &lt; &gt; &amp; &quot;",
  parameters: [
    {
      name: "xml",
      required: true,
      instruction: "XML string containing only mxCell elements (MUST be concise - max 8-12 components)",
      usage: "string",
    },
  ],
};

export function getDisplayDiagramTool(): string {
  return formatToolSpec(displayDiagramSpec);
}
