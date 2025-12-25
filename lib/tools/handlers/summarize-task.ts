/**
 * Summarize Task Tool Handler
 * Handles the summarize_task tool call from AI
 * Adapted from Cline's SummarizeTaskHandler
 */

import { continuationPrompt } from '../../context/context-prompts';

export interface SummarizeTaskParams {
  context: string;
}

/**
 * Handle summarize_task tool call
 * Returns a continuation prompt with the summary
 * 
 * This follows Cline's approach:
 * 1. Receive AI's summary
 * 2. Extract "Required Files" from summary (optional for future enhancement)
 * 3. Format as continuation prompt
 * 4. Return to be inserted as user message
 * 5. Trigger truncation (done in route.ts)
 */
export async function handleSummarizeTask(
  params: SummarizeTaskParams
): Promise<string> {
  const { context } = params;

  if (!context) {
    throw new Error('Missing required parameter: context');
  }

  // Generate continuation prompt with the summary
  // This will be inserted as a user message after truncation
  const toolResult = continuationPrompt(context);

  // TODO: Future enhancement - parse "Required Files" section and auto-read files
  // Similar to Cline's approach in SummarizeTaskHandler.ts lines 96-133
  // For now, we just return the continuation prompt

  return toolResult;
}

/**
 * Parse "Required Files" section from context summary
 * Returns list of file paths to be auto-read
 * 
 * Example format in summary:
 * 8. Required Files:
 *    - src/Main.java
 *    - src/module/CoreModule.java
 */
export function parseRequiredFiles(context: string): string[] {
  const filePaths: string[] = [];
  
  // Match the "Required Files" section
  const filePathRegex = /8\.\s*(?:Optional\s+)?Required Files:\s*((?:\n\s*-\s*.+)+)/m;
  const match = context.match(filePathRegex);

  if (match) {
    const fileListText = match[1];
    const lines = fileListText.split('\n');

    for (const line of lines) {
      const pathMatch = line.match(/^\s*-\s*(.+)$/);
      if (pathMatch) {
        filePaths.push(pathMatch[1].trim());
      }
    }
  }

  return filePaths;
}
