/**
 * System Prompt Builder
 * Modular architecture inspired by Cline
 */

import type { SystemPromptContext } from "./types";
import {
  getAgentRole,
  getCriticalRequirement,
  getWorkflow,
  getRules,
  getDrawioReference,
  getObjective,
} from "./components";
import { getToolUseSection } from "./tools";

/**
 * Build the complete system prompt from modular components
 */
export function getSystemPrompt(diagramType: string): string {
  const context: SystemPromptContext = {
    diagramType,
  };

  const sections = [
    getAgentRole(context),
    getCriticalRequirement(context),
    getToolUseSection(),
    getWorkflow(context),
    getDrawioReference(context),
    getRules(context),
    getObjective(context),
  ];

  return sections.join("\n\n");
}

// Re-export types for external use
export type { SystemPromptContext, DiagramTypeConfig } from "./types";
export { DIAGRAM_TYPES } from "./types";
