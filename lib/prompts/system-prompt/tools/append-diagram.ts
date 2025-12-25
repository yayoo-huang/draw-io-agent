/**
 * append_diagram tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const appendDiagramSpec: ToolSpec = {
  name: "append_diagram",
  description:
    "Continue adding elements to an EXISTING diagram when the initial display_diagram exceeded size limits.\n\n" +
    "WHEN TO USE:\n" +
    "- ONLY after display_diagram has been called successfully\n" +
    "- When you need to add more components beyond the initial 8-12\n" +
    "- To build complex diagrams in batches\n\n" +
    "IMPORTANT CONSTRAINTS:\n" +
    "- Do NOT use this if display_diagram hasn't been called yet\n" +
    "- Use UNIQUE IDs that don't conflict with existing diagram elements\n" +
    "- Each append_diagram call can add 8-12 more components\n" +
    "- Follow the same XML rules as display_diagram\n\n" +
    "WORKFLOW:\n" +
    "1. First: display_diagram with initial 8-12 components\n" +
    "2. Then: append_diagram to add next batch (8-12 more)\n" +
    "3. Repeat: append_diagram for additional batches if needed\n" +
    "4. Finally: attempt_completion when done",
  parameters: [
    {
      name: "xml",
      required: true,
      instruction:
        "XML string containing only additional mxCell elements to append (no wrapper tags, no root cells). Use unique IDs that don't conflict with existing elements.",
      usage: "string",
    },
  ],
};

export function getAppendDiagramTool(): string {
  return formatToolSpec(appendDiagramSpec);
}
