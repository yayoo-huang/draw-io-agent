/**
 * read_file tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const readFileSpec: ToolSpec = {
  name: "read_file",
  description:
    "Read file contents with line numbers for easy reference. Use this when you need to examine the contents of an existing file.",
  parameters: [
    {
      name: "path",
      required: true,
      instruction: "Absolute path to the file",
      usage: "/absolute/path/to/file.ts",
    },
  ],
};

export function getReadFileTool(): string {
  return formatToolSpec(readFileSpec);
}
