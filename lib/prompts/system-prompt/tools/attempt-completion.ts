/**
 * attempt_completion tool specification
 */

import type { ToolSpec } from "./types";
import { formatToolSpec } from "./types";

export const attemptCompletionSpec: ToolSpec = {
  name: "attempt_completion",
  description:
    "After each tool use, the user will respond with the result of that tool use, i.e. if it succeeded or failed, along with any reasons for failure. Once you've received the results of tool uses and can confirm that the task is complete (both code analysis and diagram generation phases finished), use this tool to present the result of your work to the user. The user may respond with feedback if they are not satisfied with the result, which you can use to make improvements and try again.\n\n" +
    "IMPORTANT NOTE: This tool CANNOT be used until you've confirmed from the user that any previous tool uses were successful, especially that display_diagram was called and succeeded. Failure to do so will result in an incomplete task. Before using this tool, you must ask yourself in <thinking></thinking> tags if you've confirmed from the user that display_diagram was successful. If not, then DO NOT use this tool.",
  parameters: [
    {
      name: "result",
      required: true,
      instruction:
        "A clear, specific description of what was accomplished - the codebase analysis performed and the diagram generated",
      usage: "Your final result summary here",
    },
    {
      name: "command",
      required: false,
      instruction: "Optional command to demonstrate the result (not typically used for this task)",
      usage: "Your command here (optional)",
    },
  ],
};

export function getAttemptCompletionTool(): string {
  return formatToolSpec(attemptCompletionSpec);
}
