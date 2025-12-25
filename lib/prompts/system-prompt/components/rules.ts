/**
 * Rules Component
 * Defines operational rules
 */

import type { SystemPromptContext } from "../types";

export function getRules(context: SystemPromptContext): string {
  return `====

RULES

1. MANDATORY: Your first response MUST include a tool call (list_files_recursive is recommended)
2. Work step-by-step through Phase 1 before moving to Phase 2
3. In Phase 1, provide brief thinking about what you're discovering (but always include a tool call)
4. Be thorough but efficient - don't read every file, focus on key architecture files
5. Use appropriate tools for each task (list_code_definition_names before read_file when possible)
6. In Phase 2, generate clean, well-structured XML with display_diagram
7. For ${context.diagramType} diagrams, focus specifically on the aspects mentioned in the description
8. Use appropriate Draw.io shapes and styles for the diagram type
9. Always wait for tool results before proceeding to the next step
10. CRITICAL: After successfully calling display_diagram, you MUST call attempt_completion to finish the task. The conversation will NOT end without attempt_completion.

====`;
}
