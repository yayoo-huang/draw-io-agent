import fs from "fs/promises";
import path from "path";
import { isPathSafe } from "../utils/path-validator";

/**
 * List files recursively with file tree
 * Provides a visual tree structure of the directory
 * Limits to 200 files to prevent context overflow (like Cline)
 */
export async function listFilesRecursive(
  dirPath: string,
  maxDepth: number = 3
): Promise<string> {
  try {
    if (!isPathSafe(dirPath)) {
      return `Error: Access denied to sensitive path`;
    }

    const MAX_FILES = 200;
    let fileCount = 0;
    let didHitLimit = false;

    const buildTree = async (
      dir: string,
      prefix: string = "",
      depth: number = 0
    ): Promise<string[]> => {
      if (depth > maxDepth) return [];
      
      // Stop if we've hit the file limit
      if (fileCount >= MAX_FILES) {
        if (!didHitLimit) {
          didHitLimit = true;
          return [`${prefix}[Stopped: Listed ${MAX_FILES} files. Use search_files to find specific files.]`];
        }
        return [];
      }

      const entries = await fs.readdir(dir, { withFileTypes: true });
      const lines: string[] = [];

      for (let i = 0; i < entries.length; i++) {
        // Check limit before processing each entry
        if (fileCount >= MAX_FILES) {
          if (!didHitLimit) {
            didHitLimit = true;
            lines.push(`${prefix}[Stopped: Listed ${MAX_FILES} files. Use search_files to find specific files.]`);
          }
          break;
        }

        const entry = entries[i];
        const isLast = i === entries.length - 1;
        const connector = isLast ? "└── " : "├── ";
        const nextPrefix = isLast ? "    " : "│   ";

        if (entry.isDirectory()) {
          lines.push(`${prefix}${connector}📁 ${entry.name}/`);
          fileCount++; // Count directories too
          
          const subPath = path.join(dir, entry.name);
          const subLines = await buildTree(
            subPath,
            prefix + nextPrefix,
            depth + 1
          );
          lines.push(...subLines);
        } else {
          lines.push(`${prefix}${connector}📄 ${entry.name}`);
          fileCount++; // Count files
        }
      }

      return lines;
    };

    const tree = await buildTree(dirPath);
    const result = tree.join("\n");
    
    // Add summary if we hit the limit
    if (didHitLimit) {
      return `${result}\n\n⚠️  Listing stopped at ${MAX_FILES} items. Use search_files tool to find specific files or patterns.`;
    }
    
    return result;
  } catch (error) {
    return `Error listing files: ${error}`;
  }
}
