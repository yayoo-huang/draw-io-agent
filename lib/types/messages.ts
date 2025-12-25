/**
 * Unified Message Types Export
 * Complete message system for Draw.io Agent
 */

// Storage Messages (API Layer)
export type {
  MessageRole,
  ModelInfo,
  MessageMetrics,
  ContentBlock,
  StorageMessage,
} from "./storage-message";

export {
  toAnthropicMessage,
  createUserMessage,
  createAssistantMessage,
  addMetrics,
  getTotalTokens,
  getTotalTokensFromMessages,
  getTotalCost,
} from "./storage-message";

// Conversation Messages (UI/Tracking Layer) - from Context module
export type {
  MessageType,
  AskType,
  SayType,
  ToolInfo,
  ConversationMessage,
} from "@/lib/context";

export {
  createTaskMessage,
  createTextMessage,
  createApiReqStartedMessage,
  createApiReqFinishedMessage,
  createToolMessage,
  createDiagramMessage,
  createErrorMessage,
  createCompletionMessage,
} from "@/lib/context";
