/**
 * Rules Component
 * Defines operational rules
 */

import type { SystemPromptContext } from "../types";

export function getRules(context: SystemPromptContext): string {
  return `====

RULES

1. MANDATORY: Your first response MUST include a tool call (list_files_recursive is recommended)
2. **EFFICIENCY RULE - BATCH YOUR TOOL CALLS:**
   - Before making tool calls, PLAN what information you need
   - Call multiple read-only tools (read_file, search_files, list_code_definition_names) SIMULTANEOUSLY in one turn
   - Don't be reactive (call → see result → call again). Be proactive (anticipate needs → call all at once)
   - Example: If you think "I might need to search for X, Y, and Z", call all three search_files at once, not one by one
3. Work step-by-step through Phase 1 before moving to Phase 2
4. In Phase 1, provide brief thinking about what you're discovering (but always include a tool call)
5. Be thorough but efficient - don't read every file, focus on key architecture files
6. Use appropriate tools for each task (list_code_definition_names before read_file when possible)
7. In Phase 2, generate clean, well-structured XML with display_diagram
8. For ${context.diagramType} diagrams, focus specifically on the aspects mentioned in the description
9. Use appropriate Draw.io shapes and styles for the diagram type
10. Always wait for tool results before proceeding to the next step
11. CRITICAL: After successfully calling display_diagram, you MUST call attempt_completion to finish the task. The conversation will NOT end without attempt_completion.

====`;
}
