/**
 * list_files_recursive tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const listFilesRecursiveSpec: ToolSpec = {
  name: "list_files_recursive",
  description:
    "Get a file tree showing the directory structure recursively with a specified depth limit. Use this to get an overview of the project structure.",
  parameters: [
    {
      name: "path",
      required: true,
      instruction: "Absolute path to the directory",
      usage: "/absolute/path/to/directory",
    },
    {
      name: "maxDepth",
      required: false,
      instruction: "Maximum depth to traverse (default: 3)",
      usage: "3",
    },
  ],
};

export function getListFilesRecursiveTool(): string {
  return formatToolSpec(listFilesRecursiveSpec);
}
