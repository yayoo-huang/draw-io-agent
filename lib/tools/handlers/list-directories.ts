import fs from "fs/promises";
import { isPathSafe } from "../utils/path-validator";

/**
 * List directory contents handler
 * Shows files and subdirectories in a given path
 */
export async function listDirectories(dirPath: string): Promise<string> {
  try {
    if (!isPathSafe(dirPath)) {
      return `Error: Access denied to sensitive path`;
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result: string[] = [];

    for (const entry of entries) {
      const type = entry.isDirectory() ? "📁 DIR" : "📄 FILE";
      result.push(`${type}  ${entry.name}`);
    }

    return result.length > 0 
      ? result.join("\n")
      : "Empty directory";
  } catch (error) {
    return `Error reading directory: ${error}`;
  }
}
