/**
 * Provider exports and factory
 * Similar to Cline's provider architecture
 */

import type { ApiStream } from "../transform/stream";
import type { Tool, StorageMessage } from "@/lib/types";
import { BedrockHandler, type BedrockHandlerOptions } from "./bedrock";
import { OpenAIHandler, type OpenAIHandlerOptions } from "./openai";

export { BedrockHandler, OpenAIHandler };
export type { BedrockHandlerOptions, OpenAIHandlerOptions };

/**
 * Common interface for all providers
 * Extended to support Context Management (like Cline's ApiHandler)
 * Uses StorageMessage which providers convert internally
 */
export interface ProviderHandler {
  // Streaming API - accepts StorageMessage with metadata
  createMessage(
    systemPrompt: string, 
    messages: StorageMessage[], 
    tools: Tool[]
  ): ApiStream;
  
  // Context Management support
  getModel(): {
    id: string;
    info: {
      contextWindow?: number;
      maxTokens?: number;
      supportsPromptCache?: boolean;
    };
  };
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  provider: "bedrock" | "openai" | "anthropic";
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  maxTokens?: number;
}

/**
 * Create a provider handler based on configuration
 * Factory pattern to instantiate the correct provider
 */
export function createProviderHandler(config: ProviderConfig): ProviderHandler {
  switch (config.provider) {
    case "bedrock":
      return new BedrockHandler({
        modelId: config.modelId,
        region: config.region,
        maxTokens: config.maxTokens,
      });
    
    case "openai":
      return new OpenAIHandler({
        modelId: config.modelId,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        maxTokens: config.maxTokens,
      });
    
    case "anthropic":
      // For now, throw error - can be implemented later
      throw new Error("Anthropic provider not yet implemented. Use bedrock or openai.");
    
    default:
      const _exhaustive: never = config.provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}
