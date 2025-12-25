import {
  BedrockRuntimeClient,
  ConversationRole,
  ConverseStreamCommand,
  ContentBlock,
  Message as BedrockMessage,
} from "@aws-sdk/client-bedrock-runtime";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import type { ApiStream } from "../transform/stream";
import type { Tool, StorageMessage } from "@/lib/types";
import { toAnthropicMessage } from "@/lib/types";
import type { ProviderHandler } from "./index";

export interface BedrockHandlerOptions {
  modelId: string;
  region?: string;
  maxTokens?: number;
}

/**
 * AWS Bedrock provider handler
 * Implements streaming API communication with AWS Bedrock models
 */
export class BedrockHandler implements ProviderHandler {
  private options: BedrockHandlerOptions;

  constructor(options: BedrockHandlerOptions) {
    this.options = options;
  }

  /**
   * Get model information for Context Management
   */
  getModel() {
    return {
      id: this.options.modelId,
      info: {
        contextWindow: this.inferContextWindow(),
        maxTokens: this.options.maxTokens || 4096,
        supportsPromptCache: true, // Bedrock supports prompt caching
      },
    };
  }

  /**
   * Infer context window size from model ID
   */
  private inferContextWindow(): number {
    const id = this.options.modelId.toLowerCase();
    
    // Claude models on Bedrock
    if (id.includes("claude-3-5-sonnet") || id.includes("claude-3-opus")) {
      return 200_000;
    }
    if (id.includes("claude")) {
      return 200_000;
    }
    
    // Default for Bedrock models
    return 128_000;
  }

  /**
   * Create a message stream using AWS Bedrock Converse API
   */
  async *createMessage(systemPrompt: string, messages: StorageMessage[], tools: Tool[]): ApiStream {
    // Convert StorageMessage to Anthropic format (removes metadata)
    const anthropicMessages = messages.map(toAnthropicMessage);
    const client = new BedrockRuntimeClient({
      region: this.options.region || process.env.AWS_REGION || "us-east-1",
      credentials: fromNodeProviderChain(),
    });

    // Format messages for Bedrock
    const bedrockMessages = this.formatMessages(anthropicMessages);
    const bedrockTools = tools.length > 0 ? this.formatTools(tools) : undefined;

    const command = new ConverseStreamCommand({
      modelId: this.options.modelId,
      system: systemPrompt ? [{ text: systemPrompt }] : undefined,
      messages: bedrockMessages,
      toolConfig: bedrockTools ? { tools: bedrockTools } : undefined,
      inferenceConfig: {
        maxTokens: this.options.maxTokens || 4096,
        temperature: 0,
      },
    });

    console.log("[Bedrock] ===== REQUEST =====");
    console.log("[Bedrock] Model:", this.options.modelId);
    console.log("[Bedrock] System prompt length:", systemPrompt?.length || 0);
    console.log("[Bedrock] Messages count:", bedrockMessages.length);
    console.log("[Bedrock] Tools:", tools.map(t => t.name));
    console.log("[Bedrock] =====================");

    try {
      const response = await client.send(command);
      
      if (!response.stream) {
        throw new Error("No stream in Bedrock response");
      }

      // Track current tool call being accumulated
      let currentToolCall: { id: string; name: string } | null = null;
      let toolCallInput = "";

      for await (const chunk of response.stream) {
        // Usage metadata
        if (chunk.metadata?.usage) {
          yield {
            type: "usage",
            inputTokens: chunk.metadata.usage.inputTokens || 0,
            outputTokens: chunk.metadata.usage.outputTokens || 0,
            cacheReadTokens: chunk.metadata.usage.cacheReadInputTokens,
            cacheWriteTokens: chunk.metadata.usage.cacheWriteInputTokens,
          };
        }

        // Tool use start
        if (chunk.contentBlockStart?.start?.toolUse) {
          const toolUse = chunk.contentBlockStart.start.toolUse;
          if (toolUse.toolUseId && toolUse.name) {
            currentToolCall = {
              id: toolUse.toolUseId,
              name: toolUse.name,
            };
            toolCallInput = "";
            console.log("[Bedrock] ===== TOOL USE STARTED =====");
            console.log("[Bedrock] Tool:", currentToolCall.name);
            console.log("[Bedrock] Tool ID:", currentToolCall.id);
            console.log("[Bedrock] Full toolUse object:", JSON.stringify(toolUse, null, 2));
            console.log("[Bedrock] ==========================");
          }
        }

        // Content delta
        if (chunk.contentBlockDelta) {
          const delta = chunk.contentBlockDelta.delta;
          
          // Text delta
          if (delta?.text) {
            yield {
              type: "text",
              text: delta.text,
            };
          }
          
          // Tool use delta
          if (delta?.toolUse?.input) {
            const inputStr = String(delta.toolUse.input);
            toolCallInput += inputStr;
          }
        }

        // Tool use complete
        if (chunk.contentBlockStop && currentToolCall) {
          console.log("[Bedrock] ===== TOOL USE COMPLETED =====");
          console.log("[Bedrock] Tool:", currentToolCall.name);
          console.log("[Bedrock] Raw input string:", toolCallInput);
          console.log("[Bedrock] Input length:", toolCallInput.length);
          console.log("[Bedrock] contentBlockStop details:", JSON.stringify(chunk.contentBlockStop, null, 2));
          
          try {
            let input = {};
            if (toolCallInput.trim()) {
              input = JSON.parse(toolCallInput);
            } else {
              console.log("[Bedrock] WARNING: Empty tool input - AI may not be providing parameters correctly");
              // For display_diagram, this is a critical error
              if (currentToolCall.name === "display_diagram") {
                console.log("[Bedrock] CRITICAL: display_diagram called without xml parameter");
              }
            }
            
            console.log("[Bedrock] Parsed input keys:", Object.keys(input));
            console.log("[Bedrock] Parsed input (first 200 chars):", JSON.stringify(input).slice(0, 200));
            console.log("[Bedrock] ================================");
            
            yield {
              type: "tool_calls",
              tool_call: {
                id: currentToolCall.id,
                name: currentToolCall.name,
                input: input,
              },
            };
          } catch (e) {
            console.error("[Bedrock] ===== PARSE ERROR =====");
            console.error("[Bedrock] Failed to parse:", toolCallInput);
            console.error("[Bedrock] Error:", e);
            console.error("[Bedrock] ====================");
            // Still yield with empty input
            yield {
              type: "tool_calls",
              tool_call: {
                id: currentToolCall.id,
                name: currentToolCall.name,
                input: {},
              },
            };
          }
          
          currentToolCall = null;
          toolCallInput = "";
        }
      }
    } catch (error) {
      console.error("[Bedrock] Streaming error:", error);
      throw new Error(`Bedrock streaming error: ${error}`);
    }
  }

  /**
   * Format messages for Bedrock Converse API
   */
  private formatMessages(messages: import("@anthropic-ai/sdk").Anthropic.MessageParam[]): BedrockMessage[] {
    return messages.map((m) => ({
        role: m.role === "user" ? ConversationRole.USER : ConversationRole.ASSISTANT,
        content: typeof m.content === "string"
          ? [{ text: m.content }] as ContentBlock[]
          : m.content.map((c: any) => {
              if (c.type === "text") return { text: c.text };
              if (c.type === "tool_result") {
                return {
                  toolResult: {
                    toolUseId: c.tool_use_id,
                    content: [{ text: c.content }],
                  },
                };
              }
              return c;
            }),
      }));
  }

  /**
   * Format tools for Bedrock toolSpec format
   */
  private formatTools(tools: Tool[]): any[] {
    return tools.map((t) => ({
      toolSpec: {
        name: t.name,
        description: t.description,
        inputSchema: {
          json: t.input_schema,
        },
      },
    }));
  }
}
