/**
 * list_directories tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const listDirectoriesSpec: ToolSpec = {
  name: "list_directories",
  description:
    "List directory contents showing files and subdirectories. Use this when you need to explore the structure of a directory.",
  parameters: [
    {
      name: "path",
      required: true,
      instruction: "Absolute path to the directory",
      usage: "/absolute/path/to/directory",
    },
  ],
};

export function getListDirectoriesTool(): string {
  return formatToolSpec(listDirectoriesSpec);
}
