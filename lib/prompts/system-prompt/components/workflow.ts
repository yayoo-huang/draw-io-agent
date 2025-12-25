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

1. Analyze the user's task and set clear, achievable goals to accomplish it. Prioritize these goals in a logical order.

2. Work through these goals sequentially, utilizing available tools one at a time as necessary. Each goal should correspond to a distinct step in your problem-solving process.

3. Remember, you have extensive capabilities with access to a wide range of tools that can be used in powerful and clever ways as necessary to accomplish each goal:
   - Use list_files_recursive or list_directories to explore project structure efficiently
   - Use list_code_definition_names to quickly understand file structures without reading full content
   - Use read_file for key configuration and implementation files (aim for 5-8 files max)
   - Use search_files to find specific patterns when needed
   - Use display_diagram to generate the ${context.diagramType} diagram (${diagramDescription})

4. Once you've completed the user's task (after display_diagram succeeds), you must use the attempt_completion tool to present the result to the user. Do NOT continue in pointless back and forth conversations.

====`;
}
