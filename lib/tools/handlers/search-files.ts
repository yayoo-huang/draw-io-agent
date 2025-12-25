import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import { isPathSafe } from "../utils/path-validator";

/**
 * Search files with regex
 * Finds patterns across the codebase with context
 */
export async function searchFiles(
  dirPath: string,
  pattern: string,
  filePattern: string = "**/*"
): Promise<string> {
  try {
    if (!isPathSafe(dirPath)) {
      return `Error: Access denied to sensitive path`;
    }

    const regex = new RegExp(pattern, "gi");
    const files = await glob(filePattern, {
      cwd: dirPath,
      absolute: true,
      nodir: true,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
    });

    const results: Array<{ file: string; matches: Array<{ line: number; text: string }> }> = [];

    for (const file of files.slice(0, 50)) {
      // Limit to 50 files
      try {
        const content = await fs.readFile(file, "utf-8");
        const lines = content.split("\n");
        const matches: Array<{ line: number; text: string }> = [];

        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push({ line: index + 1, text: line.trim() });
          }
        });

        if (matches.length > 0) {
          results.push({
            file: path.relative(dirPath, file),
            matches: matches.slice(0, 10), // Limit to 10 matches per file
          });
        }
      } catch (err) {
        // Skip unreadable files
      }
    }

    if (results.length === 0) {
      return `No matches found for pattern: ${pattern}`;
    }

    const output = results
      .map((result) => {
        const matchLines = result.matches
          .map((m) => `  Line ${m.line}: ${m.text}`)
          .join("\n");
        return `📄 ${result.file}\n${matchLines}`;
      })
      .join("\n\n");

    return `Found ${results.length} file(s) with matches:\n\n${output}`;
  } catch (error) {
    return `Error searching files: ${error}`;
  }
}
