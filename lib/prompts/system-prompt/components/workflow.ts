/**
 * Workflow Component
 * Defines the two-phase workflow
 */

import type { SystemPromptContext } from "../types";
import { DIAGRAM_TYPES } from "../types";

export function getWorkflow(context: SystemPromptContext): string {
  const diagramConfig = DIAGRAM_TYPES[context.diagramType];
  const diagramDescription = diagramConfig?.description || "Create an appropriate architecture diagram for the codebase.";
  
  return `====

WORKFLOW

1. **PLANNING PHASE (CRITICAL FOR PERFORMANCE)**
   
   Before making any tool calls, take a moment to PLAN:
   - What information do I need to accomplish this task?
   - Can I gather multiple pieces of information in ONE batch of tool calls?
   - What are ALL the files/patterns I might need to explore?
   
   **Batch Thinking Examples:**
   - ❌ BAD (Reactive): Search for X → see result → search for Y → see result → search for Z
   - ✅ GOOD (Proactive): "I need to find certain files/patterns. They could be A, B, or C. Let me search for ALL of them simultaneously in one turn."
   - ❌ BAD (Serial): Read file1 → wait → read file2 → wait → read file3
   - ✅ GOOD (Parallel): Read file1 + file2 + file3 ALL AT ONCE in one turn
   
   **Why this matters:** Read-only tools (read_file, search_files, list_files, list_code_definition_names) execute in PARALLEL when called together. This can reduce task completion time by 50-70%.

2. **EXPLORATION PHASE**
   
   Work through your plan using tools efficiently:
   - Use list_files_recursive or list_directories to explore project structure
   - Use list_code_definition_names to quickly understand file structures without reading full content
   - **CRITICAL: When you need multiple files or searches, call them ALL IN ONE TURN** - they will execute in parallel:
     * Multiple read_file calls → execute simultaneously
     * Multiple search_files calls → execute simultaneously
     * Multiple list_code_definition_names calls → execute simultaneously
   - Use read_file for key configuration and implementation files (aim for 5-8 files max)
   - Use search_files to find specific patterns when needed

3. **DIAGRAM GENERATION**
   
   Use display_diagram to generate the ${context.diagramType} diagram (${diagramDescription})

4. **COMPLETION**
   
   Once you've completed the user's task (after display_diagram succeeds), you must use the attempt_completion tool to present the result to the user. Do NOT continue in pointless back and forth conversations.

====`;
}
