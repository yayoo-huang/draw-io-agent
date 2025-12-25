/**
 * Attempt Completion Handler
 * Inspired by Cline's AttemptCompletionHandler
 * Provides explicit task completion signal
 */

export interface AttemptCompletionInput {
  result: string;
  command?: string;
}

export async function attemptCompletion(input: AttemptCompletionInput): Promise<string> {
  const { result, command } = input;
  
  // Validate required parameters
  if (!result) {
    throw new Error("Missing required parameter: result");
  }
  
  // Format completion message
  let completionMessage = `[attempt_completion] Result:\n${result}`;
  
  if (command) {
    completionMessage += `\n\nDemo command: ${command}`;
  }
  
  return completionMessage;
}
