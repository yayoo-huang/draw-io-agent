/**
 * search_files tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const searchFilesSpec: ToolSpec = {
  name: "search_files",
  description:
    "Search for patterns across the codebase using regex. Useful for finding specific implementations, imports, or code patterns.",
  parameters: [
    {
      name: "path",
      required: true,
      instruction: "Absolute path to search from",
      usage: "/absolute/path/to/directory",
    },
    {
      name: "pattern",
      required: true,
      instruction: "Regex pattern to search for",
      usage: "class.*extends",
    },
    {
      name: "filePattern",
      required: false,
      instruction: "Glob pattern for files to search (default: **/*)",
      usage: "**/*.ts",
    },
  ],
};

export function getSearchFilesTool(): string {
  return formatToolSpec(searchFilesSpec);
}
