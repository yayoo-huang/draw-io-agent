import fs from "fs/promises";
import { isPathSafe } from "../utils/path-validator";

/**
 * List code definition names (functions, classes, interfaces, etc.)
 * Efficiently extracts structure without reading full content
 */
export async function listCodeDefinitionNames(filepath: string): Promise<string> {
  try {
    if (!isPathSafe(filepath)) {
      return `Error: Access denied to sensitive file`;
    }

    const content = await fs.readFile(filepath, "utf-8");
    const definitions: string[] = [];

    // Match common code patterns
    const patterns = [
      // Functions
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      // Classes
      /(?:export\s+)?class\s+(\w+)/g,
      // Interfaces
      /(?:export\s+)?interface\s+(\w+)/g,
      // Types
      /(?:export\s+)?type\s+(\w+)/g,
      // Const exports
      /(?:export\s+)?const\s+(\w+)\s*=/g,
      // Methods in classes
      /^\s+(?:async\s+)?(\w+)\s*\(/gm,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !definitions.includes(match[1])) {
          definitions.push(match[1]);
        }
      }
    });

    if (definitions.length === 0) {
      return `No code definitions found in ${filepath}`;
    }

    return `Code definitions in ${filepath}:\n${definitions.map(d => `  - ${d}`).join("\n")}`;
  } catch (error) {
    return `Error analyzing file: ${error}`;
  }
}
