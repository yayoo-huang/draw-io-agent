import { isPathSafe } from "../utils/path-validator";
import { extractTextFromFile } from "@/lib/integrations/extract-text";

/**
 * Read file contents with line numbers
 * Uses Cline's extract-text for:
 * - 20MB file size limit
 * - Binary file detection
 * - Encoding auto-detection
 * - PDF, DOCX, Excel, Jupyter support
 */
export async function readFile(filepath: string): Promise<string> {
  try {
    if (!isPathSafe(filepath)) {
      return `Error: Access denied to sensitive file`;
    }

    // Use Cline's text extraction with all protections
    const content = await extractTextFromFile(filepath);
    const lines = content.split("\n");
    
    // Add line numbers for easier reference
    const numbered = lines
      .map((line, i) => `${(i + 1).toString().padStart(4, " ")} | ${line}`)
      .join("\n");

    return `File: ${filepath}\n${"=".repeat(80)}\n${numbered}`;
  } catch (error: any) {
    // Provide helpful error messages
    const errorMessage = error.message || String(error);
    
    if (errorMessage.includes("too large")) {
      return `Error: ${errorMessage}

File: ${filepath}

Suggestion: Use search_files to find specific patterns in this file instead.`;
    }
    
    if (errorMessage.includes("Binary") || errorMessage.includes("Cannot read text")) {
      return `Error: ${errorMessage}

File: ${filepath}

This appears to be a binary file. Use list_files_recursive to explore the directory structure instead.`;
    }
    
    return `Error reading file: ${errorMessage}\n\nFile: ${filepath}`;
  }
}
