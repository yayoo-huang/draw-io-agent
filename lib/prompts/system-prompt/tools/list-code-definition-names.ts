/**
 * list_code_definition_names tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const listCodeDefinitionNamesSpec: ToolSpec = {
  name: "list_code_definition_names",
  description:
    "Extract all code definitions (functions, classes, interfaces, types, exports) from a file without reading full content. This is more efficient than read_file when you only need to understand the structure.",
  parameters: [
    {
      name: "path",
      required: true,
      instruction: "Absolute path to the source code file",
      usage: "/absolute/path/to/file.ts",
    },
  ],
};

export function getListCodeDefinitionNamesTool(): string {
  return formatToolSpec(listCodeDefinitionNamesSpec);
}
