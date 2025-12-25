/**
 * Storage Message Types - API Layer
 * Based on Cline's ClineStorageMessage architecture
 * Used for communication with LLMs (Anthropic, OpenAI, etc.)
 */

import { Anthropic } from "@anthropic-ai/sdk";

/**
 * Message role types
 */
export type MessageRole = "user" | "assistant";

/**
 * Model information attached to messages
 */
export interface ModelInfo {
  modelId: string;
  provider: string;
  contextWindow?: number;
  supportsPromptCache?: boolean;
}

/**
 * Token and cost metrics for a message
 */
export interface MessageMetrics {
  tokensIn?: number;
  tokensOut?: number;
  cacheWrites?: number;
  cacheReads?: number;
  cost?: number;
}

/**
 * Content block types (matching Anthropic's format)
 */
export type ContentBlock =
  | Anthropic.TextBlockParam
  | Anthropic.ImageBlockParam
  | Anthropic.ToolUseBlockParam
  | Anthropic.ToolResultBlockParam;

/**
 * Storage Message - extends Anthropic.MessageParam with metadata
 * This is the format used for storing and sending messages to LLMs
 */
export interface StorageMessage extends Anthropic.MessageParam {
  id?: string;
  role: MessageRole;
  content: string | ContentBlock[];
  
  /**
   * Model information used when generating this message
   * Internal use only - MUST be removed before sending to LLM
   */
  modelInfo?: ModelInfo;
  
  /**
   * Operational and performance metrics
   */
  metrics?: MessageMetrics;
  
  /**
   * Index in conversation history (for context management)
   */
  conversationHistoryIndex?: number;
}

/**
 * Convert StorageMessage to Anthropic.MessageParam
 * Removes metadata fields that shouldn't be sent to LLM
 */
export function toAnthropicMessage(msg: StorageMessage): Anthropic.MessageParam {
  return {
    role: msg.role,
    content: msg.content,
  };
}

/**
 * Create a user message
 */
export function createUserMessage(content: string | ContentBlock[]): StorageMessage {
  return {
    role: "user",
    content,
  };
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string | ContentBlock[]): StorageMessage {
  return {
    role: "assistant",
    content,
  };
}

/**
 * Add metrics to a message
 */
export function addMetrics(msg: StorageMessage, metrics: MessageMetrics): StorageMessage {
  return {
    ...msg,
    metrics: {
      ...msg.metrics,
      ...metrics,
    },
  };
}

/**
 * Calculate total tokens from a message
 */
export function getTotalTokens(msg: StorageMessage): number {
  const m = msg.metrics;
  if (!m) return 0;
  return (m.tokensIn || 0) + (m.tokensOut || 0) + (m.cacheWrites || 0) + (m.cacheReads || 0);
}

/**
 * Calculate total tokens from message array
 */
export function getTotalTokensFromMessages(messages: StorageMessage[]): number {
  return messages.reduce((sum, msg) => sum + getTotalTokens(msg), 0);
}

/**
 * Calculate total cost from message array
 */
export function getTotalCost(messages: StorageMessage[]): number {
  return messages.reduce((sum, msg) => sum + (msg.metrics?.cost || 0), 0);
}
