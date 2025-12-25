import type { ApiStream } from "../transform/stream";
import type { Tool, StorageMessage } from "@/lib/types";
import { toAnthropicMessage } from "@/lib/types";
import type { ProviderHandler } from "./index";

export interface OpenAIHandlerOptions {
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
}

/**
 * OpenAI provider handler
 * Implements streaming API communication with OpenAI models
 */
export class OpenAIHandler implements ProviderHandler {
  private options: OpenAIHandlerOptions;

  constructor(options: OpenAIHandlerOptions) {
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
        supportsPromptCache: false, // OpenAI doesn't support prompt caching yet
      },
    };
  }

  /**
   * Infer context window size from model ID
   */
  private inferContextWindow(): number {
    const id = this.options.modelId.toLowerCase();
    
    // GPT-4 models
    if (id.includes("gpt-4-turbo") || id.includes("gpt-4-1106")) {
      return 128_000;
    }
    if (id.includes("gpt-4")) {
      return 8_192;
    }
    
    // GPT-3.5
    if (id.includes("gpt-3.5-turbo-16k")) {
      return 16_385;
    }
    if (id.includes("gpt-3.5")) {
      return 4_096;
    }
    
    // DeepSeek models (via OpenAI-compatible API)
    if (id.includes("deepseek")) {
      return 128_000;
    }
    
    // Default
    return 128_000;
  }

  /**
   * Create a message stream using OpenAI API
   */
  async *createMessage(systemPrompt: string, messages: StorageMessage[], tools: Tool[]): ApiStream {
    // Convert StorageMessage to Anthropic format (removes metadata)
    const anthropicMessages = messages.map(toAnthropicMessage);
    const url = this.options.baseUrl || "https://api.openai.com/v1/chat/completions";
    const apiKey = this.options.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Format messages for OpenAI
    const openaiMessages = this.formatMessages(systemPrompt, anthropicMessages);
    const openaiTools = tools.length > 0 ? this.formatTools(tools) : undefined;

    console.log("[OpenAI] Request:", {
      model: this.options.modelId,
      url,
      messageCount: openaiMessages.length,
      toolCount: tools.length,
      toolNames: tools.map(t => t.name)
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.options.modelId,
        messages: openaiMessages,
        tools: openaiTools,
        max_tokens: this.options.maxTokens || 4096,
        temperature: 0,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    yield* this.parseStream(response);
  }

  /**
   * Parse OpenAI SSE stream and convert to ApiStream
   */
  private async *parseStream(response: Response): ApiStream {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Track tool call accumulation
    let currentToolCall: { id: string; name: string; arguments: string } | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) continue;

        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const choice = parsed.choices?.[0];
          if (!choice) continue;

          // Text delta
          if (choice.delta?.content) {
            yield {
              type: "text",
              text: choice.delta.content,
            };
          }

          // Tool call start
          if (choice.delta?.tool_calls) {
            const toolCall = choice.delta.tool_calls[0];
            
            // Tool call ID indicates start of new tool call
            if (toolCall.id) {
              // If we have a previous tool call, yield it first
              if (currentToolCall) {
                try {
                  const input = JSON.parse(currentToolCall.arguments);
                  console.log("[OpenAI] Tool use completed:", currentToolCall.name, Object.keys(input));
                  
                  yield {
                    type: "tool_calls",
                    tool_call: {
                      id: currentToolCall.id,
                      name: currentToolCall.name,
                      input: input,
                    },
                  };
                } catch (e) {
                  console.error("[OpenAI] Failed to parse tool arguments:", currentToolCall.arguments);
                }
              }
              
              // Start new tool call
              currentToolCall = {
                id: toolCall.id,
                name: toolCall.function?.name || "",
                arguments: toolCall.function?.arguments || "",
              };
              console.log("[OpenAI] Tool use started:", currentToolCall.name);
            }
            // Accumulate arguments for current tool call
            else if (currentToolCall && toolCall.function?.arguments) {
              currentToolCall.arguments += toolCall.function.arguments;
            }
          }

          // Finish reason indicates end of stream
          if (choice.finish_reason && currentToolCall) {
            try {
              const input = JSON.parse(currentToolCall.arguments);
              console.log("[OpenAI] Tool use completed:", currentToolCall.name, Object.keys(input));
              
              yield {
                type: "tool_calls",
                tool_call: {
                  id: currentToolCall.id,
                  name: currentToolCall.name,
                  input: input,
                },
              };
            } catch (e) {
              console.error("[OpenAI] Failed to parse tool arguments:", currentToolCall.arguments);
            }
            currentToolCall = null;
          }

          // Usage information
          if (parsed.usage) {
            yield {
              type: "usage",
              inputTokens: parsed.usage.prompt_tokens || 0,
              outputTokens: parsed.usage.completion_tokens || 0,
            };
          }
        } catch (e) {
          console.warn("[OpenAI] Failed to parse chunk:", data, e);
        }
      }
    }

    // Handle any remaining tool call
    if (currentToolCall) {
      try {
        const input = JSON.parse(currentToolCall.arguments);
        yield {
          type: "tool_calls",
          tool_call: {
            id: currentToolCall.id,
            name: currentToolCall.name,
            input: input,
          },
        };
      } catch (e) {
        console.error("[OpenAI] Failed to parse final tool arguments:", currentToolCall.arguments);
      }
    }
  }

  /**
   * Format messages for OpenAI Chat API
   */
  private formatMessages(systemPrompt: string, messages: import("@anthropic-ai/sdk").Anthropic.MessageParam[]): any[] {
    const formatted: any[] = [];

    // Add system message if provided
    if (systemPrompt) {
      formatted.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // Add user and assistant messages
    for (const msg of messages) {
      formatted.push({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      });
    }

    return formatted;
  }

  /**
   * Format tools for OpenAI function calling format
   */
  private formatTools(tools: Tool[]): any[] {
    return tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));
  }
}
