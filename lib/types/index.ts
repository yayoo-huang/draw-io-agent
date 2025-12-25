// Core type definitions for Draw.io Agent

export type ProviderName =
  | "bedrock"
  | "openai"
  | "anthropic"
  | "google"
  | "azure"
  | "ollama"
  | "openrouter"
  | "deepseek"
  | "siliconflow"
  | "gateway";

export interface ProviderConfig {
  provider: ProviderName;
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
}

// ============================================================================
// DEPRECATED TYPES - DO NOT USE IN NEW CODE
// Use StorageMessage and DisplayMessage from @/lib/types/messages instead
// ============================================================================

/**
 * @deprecated Use StorageMessage instead
 * Legacy Message type kept for backwards compatibility only
 */
export interface Message {
  role: "user" | "assistant" | "system";
  content: string | MessageContent[];
}

/**
 * @deprecated Use StorageMessage content types instead
 */
export type MessageContent = TextContent | ToolUseContent | ToolResultContent;

// New message types (Cline-style architecture)
export type {
  StorageMessage,
  ConversationMessage,
  MessageRole,
  ModelInfo,
  MessageMetrics,
  MessageType,
  AskType,
  SayType,
  ToolInfo,
} from "./messages";

export {
  createUserMessage,
  createAssistantMessage,
  createTaskMessage,
  createTextMessage,
  createApiReqStartedMessage,
  createToolMessage,
  createDiagramMessage,
  createErrorMessage,
  toAnthropicMessage,
  addMetrics,
  getTotalTokens,
  getTotalTokensFromMessages,
  getTotalCost,
} from "./messages";

export interface TextContent {
  type: "text";
  text: string;
}

export interface ToolUseContent {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface ToolResultContent {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export type StreamChunkType = 
  | "text" 
  | "reasoning" 
  | "tool_call" 
  | "tool_call_delta" 
  | "usage";

export interface StreamChunk {
  type: StreamChunkType;
  content?: string;
  toolCall?: ToolCall;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * @deprecated This interface is no longer used
 * Use MessageStateHandler instead
 */
export interface TaskState {
  taskId: string;
  codebases: string[];
  /** @deprecated Use MessageStateHandler.getApiMessages() instead */
  conversationHistory: Message[];
  diagramXML: string | null;
  isStreaming: boolean;
  createdAt: Date;
}

// Code analysis tool types
export interface ListDirectoriesInput {
  path: string;
  recursive?: boolean;
  max_depth?: number;
}

export interface ReadFileInput {
  path: string;
}

export interface SearchCodeInput {
  path: string;
  pattern: string;
  file_extensions?: string[];
}

export interface ListCodeDefinitionsInput {
  path: string;
}

export interface AnalyzeDependenciesInput {
  path: string;
}

export interface FindImportsInput {
  path: string;
}

export interface TraceFunctionCallsInput {
  file_path: string;
  function_name: string;
  max_depth?: number;
}

// Diagram tool types
export interface DisplayDiagramInput {
  xml: string;
}

export interface EditDiagramInput {
  operations: DiagramOperation[];
}

export interface DiagramOperation {
  type: "update" | "add" | "delete";
  cell_id: string;
  new_xml?: string;
}
