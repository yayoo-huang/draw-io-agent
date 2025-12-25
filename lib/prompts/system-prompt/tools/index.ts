/**
 * Tools Index
 * Exports tool-related components
 */

import { getToolUseFormatting } from "./tool-use-formatting";
import { getListDirectoriesTool } from "./list-directories";
import { getListFilesRecursiveTool } from "./list-files-recursive";
import { getReadFileTool } from "./read-file";
import { getListCodeDefinitionNamesTool } from "./list-code-definition-names";
import { getSearchFilesTool } from "./search-files";
import { getDisplayDiagramTool } from "./display-diagram";
import { getAppendDiagramTool } from "./append-diagram";
import { getAttemptCompletionTool } from "./attempt-completion";

export { getToolUseFormatting } from "./tool-use-formatting";
export { getListDirectoriesTool } from "./list-directories";
export { getListFilesRecursiveTool } from "./list-files-recursive";
export { getReadFileTool } from "./read-file";
export { getListCodeDefinitionNamesTool } from "./list-code-definition-names";
export { getSearchFilesTool } from "./search-files";
export { getDisplayDiagramTool } from "./display-diagram";
export { getAppendDiagramTool } from "./append-diagram";
export { getAttemptCompletionTool } from "./attempt-completion";

/**
 * Get all tool definitions combined
 * NOTE: summarize_task is NOT included here - it's triggered via dynamic user message injection
 * when context window is full, not through system prompt tool definitions
 */
export function getToolDefinitions(): string {
  const tools = [
    getListDirectoriesTool(),
    getListFilesRecursiveTool(),
    getReadFileTool(),
    getListCodeDefinitionNamesTool(),
    getSearchFilesTool(),
    getDisplayDiagramTool(),
    getAppendDiagramTool(),
    getAttemptCompletionTool(),
  ];
  
  return tools.join("\n\n");
}

/**
 * Get the complete tool use section
 */
export function getToolUseSection(): string {
  return `====

TOOL USE

You have access to a set of tools that are executed upon the user's approval. You can use one tool per message, and will receive the result of that tool use in the user's response. You use tools step-by-step to accomplish a given task, with each tool use informed by the result of the previous tool use.

${getToolUseFormatting()}

# Tools

${getToolDefinitions()}

# Tool Use Guidelines

1. ALWAYS start by using a tool - never provide text-only responses
2. Work step-by-step, using one tool at a time
3. Wait for the result of each tool use before proceeding to the next
4. Each tool use should be informed by the previous results
5. Think about which tool is most appropriate for the current step
6. Be efficient - use list_code_definition_names before read_file when you only need structure
7. Use search_files to find specific patterns instead of reading many files

====`;
}
