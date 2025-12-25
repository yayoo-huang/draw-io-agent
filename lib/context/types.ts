/**
 * Context Management Types for Draw.io Agent
 * Adapted from Cline's architecture
 */

import { Anthropic } from "@anthropic-ai/sdk";

/**
 * API Request Information
 */
export interface ApiReqInfo {
  tokensIn?: number;
  tokensOut?: number;
  cacheWrites?: number;
  cacheReads?: number;
}

/**
 * Message Types for Conversation Tracking
 */
export type MessageType = "ask" | "say";

export type AskType =
  | "followup"
  | "tool"
  | "completion_result"
  | "api_req_failed"
  | "command"
  | "command_output";

export type SayType =
  | "task"
  | "text"
  | "reasoning"
  | "tool"
  | "api_req_started"
  | "api_req_finished"
  | "completion_result"
  | "user_feedback"
  | "command"
  | "command_output"
  | "diagram"
  | "error"
  | "info";

export interface ToolInfo {
  tool: string;
  path?: string;
  content?: string;
  diff?: string;
  regex?: string;
  operationIsLocatedInWorkspace?: boolean;
}

/**
 * ConversationMessage - for UI display and conversation tracking
 * Based on Cline's ClineMessage architecture
 */
export interface ConversationMessage {
  ts: number;
  type: MessageType;
  ask?: AskType;
  say?: SayType;
  text?: string;
  reasoning?: string;
  images?: string[];
  files?: string[];
  partial?: boolean;
  conversationHistoryIndex?: number;
  conversationHistoryDeletedRange?: [number, number];
  toolInfo?: ToolInfo;
}

/**
 * Context window configuration for different models
 */
export interface ContextWindowInfo {
  contextWindow: number;
  maxAllowedSize: number;
}

/**
 * API Handler interface - represents the LLM provider
 */
export interface ApiHandler {
  getModel(): {
    id: string;
    info: {
      contextWindow?: number;
    };
  };
}

/**
 * Global file names used for persistence
 */
export const GlobalFileNames = {
  contextHistory: "context-history.json",
};

/**
 * Helper functions to create ConversationMessages
 */

export function createTaskMessage(task: string): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "task",
    text: task,
  };
}

export function createTextMessage(text: string): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "text",
    text,
  };
}

export function createApiReqStartedMessage(metrics: ApiReqInfo): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "api_req_started",
    text: JSON.stringify(metrics),
  };
}

export function createApiReqFinishedMessage(): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "api_req_finished",
  };
}

export function createToolMessage(toolInfo: ToolInfo): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "tool",
    toolInfo,
  };
}

export function createDiagramMessage(xml: string): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "diagram",
    text: xml,
  };
}

export function createErrorMessage(error: string): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "error",
    text: error,
  };
}

export function createCompletionMessage(result: string): ConversationMessage {
  return {
    ts: Date.now(),
    type: "say",
    say: "completion_result",
    text: result,
  };
}
