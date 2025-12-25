/**
 * Context Management System for Draw.io Agent
 * Adapted from Cline's enterprise-grade context management
 * 
 * Features:
 * 1. File Read Deduplication - Saves 30%+ tokens
 * 2. Smart Truncation - Maintains conversation structure
 * 3. Multi-model Support - Auto-adapts to different context windows
 * 4. Persistence - Task recovery support
 * 5. Telemetry - Debug and optimization metrics
 */

export { ContextManager } from "./context-management/ContextManager";
export { getContextWindowInfo } from "./context-management/context-window-utils";
export { formatResponse } from "./format-response";
export { fileExistsAtPath } from "./utils/fs";
export type {
  ApiHandler,
  ApiReqInfo,
  ConversationMessage,
  ContextWindowInfo,
  MessageType,
  AskType,
  SayType,
  ToolInfo,
} from "./types";
export {
  GlobalFileNames,
  createTaskMessage,
  createTextMessage,
  createApiReqStartedMessage,
  createApiReqFinishedMessage,
  createToolMessage,
  createDiagramMessage,
  createErrorMessage,
  createCompletionMessage,
} from "./types";
