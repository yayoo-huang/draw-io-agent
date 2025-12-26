/**
 * Tool categories for parallel execution optimization
 * Based on Cline's architecture: READ_ONLY_TOOLS can be executed in parallel,
 * while WRITE_TOOLS must be executed serially to avoid conflicts
 */

/**
 * Read-only tools that can be safely executed in parallel
 * These tools only read data and don't modify state
 */
export const READ_ONLY_TOOLS = [
  "list_directories",
  "list_files_recursive",
  "read_file",
  "list_code_definition_names",
  "search_files",
] as const;

/**
 * Write tools that must be executed serially
 * These tools modify state (diagrams) and must be executed one at a time
 */
export const WRITE_TOOLS = [
  "display_diagram",
  "append_diagram",
  "attempt_completion",
  "summarize_task",
] as const;

/**
 * Check if a tool is read-only and can be executed in parallel
 */
export function isReadOnlyTool(toolName: string): boolean {
  return READ_ONLY_TOOLS.includes(toolName as any);
}

/**
 * Check if a tool is a write tool that must be executed serially
 */
export function isWriteTool(toolName: string): boolean {
  return WRITE_TOOLS.includes(toolName as any);
}
