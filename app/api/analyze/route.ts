import { ProviderManager } from "@/lib/core/provider-config";
import { createProviderHandler } from "@/lib/core/providers";
import {
  listDirectories,
  listFilesRecursive,
  readFile,
  searchFiles,
  listCodeDefinitionNames,
  displayDiagram,
  appendDiagram,
  attemptCompletion,
} from "@/lib/tools";
import { handleSummarizeTask } from "@/lib/tools/handlers/summarize-task";
import { summarizeTask } from "@/lib/context/context-prompts";
import { getSystemPrompt } from "@/lib/prompts/system-prompt";
import type { Tool } from "@/lib/types";
import {
  createUserMessage,
  createAssistantMessage,
  createTaskMessage,
  createApiReqStartedMessage,
  createToolMessage,
  toAnthropicMessage,
  addMetrics,
} from "@/lib/types";
import { MessageStateHandler } from "@/lib/messages";
import { ContextManager } from "@/lib/context";
import type { ConversationMessage } from "@/lib/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  console.log("\n");
  console.log("=".repeat(80));
  console.log("🎯 [/api/analyze] API CALLED - Cline-style Architecture");
  console.log("=".repeat(80));
  console.log("\n");
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      let isControllerClosed = false;
      
      const safeEnqueue = (data: Uint8Array) => {
        if (!isControllerClosed) {
          try {
            controller.enqueue(data);
          } catch (error) {
            console.error("Error enqueueing data:", error);
            isControllerClosed = true;
          }
        }
      };

      const safeClose = () => {
        if (!isControllerClosed) {
          controller.close();
          isControllerClosed = true;
        }
      };

      try {
        const { message, diagramType = "system-architecture" } = await req.json();
        
        const manager = new ProviderManager();
        const config = manager.getDefaultProvider();
        
        // Validate supported provider
        if (config.provider !== "bedrock" && config.provider !== "openai") {
          throw new Error(`Provider ${config.provider} not yet supported. Please use bedrock or openai.`);
        }
        
        // Create provider handler using factory (Cline-style)
        const handler = createProviderHandler({
          provider: config.provider,
          modelId: config.modelId,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          region: process.env.AWS_REGION,
        });

        // Get system prompt (will be modified if context needs optimization)
        let systemPrompt = getSystemPrompt(diagramType);
        
        // Generate task ID
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        // Initialize MessageStateHandler (Cline-style)
        const messageHandler = new MessageStateHandler({
          taskId,
          onStateUpdate: (state) => {
            // Could stream state updates to frontend here
            console.log(`Messages updated: ${state.apiMessages.length} API, ${state.conversationMessages.length} conversation`);
          },
        });
        
        // Add initial user message
        await messageHandler.addApiMessage(createUserMessage(message));
        await messageHandler.addConversationMessage(createTaskMessage(message));

        // Define tools for the API provider
        // NOTE: summarize_task is NOT included here - it's triggered dynamically via user message injection
        // when context window is full, following Cline's architecture
        const tools: Tool[] = [
          {
            name: "list_directories",
            description: "List directory contents showing files and subdirectories",
            input_schema: {
              type: "object" as const,
              properties: { 
                path: { 
                  type: "string",
                  description: "Absolute path to the directory"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "list_files_recursive",
            description: "Get a file tree showing the directory structure recursively",
            input_schema: {
              type: "object" as const,
              properties: { 
                path: { 
                  type: "string",
                  description: "Absolute path to the directory"
                },
                maxDepth: {
                  type: "number",
                  description: "Maximum depth to traverse (default: 3)"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "read_file",
            description: "Read file contents with line numbers for easy reference",
            input_schema: {
              type: "object" as const,
              properties: { 
                path: { 
                  type: "string",
                  description: "Absolute path to the file"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "list_code_definition_names",
            description: "Extract all code definitions (functions, classes, interfaces, types, exports) from a file without reading full content",
            input_schema: {
              type: "object" as const,
              properties: { 
                path: { 
                  type: "string",
                  description: "Absolute path to the source code file"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "search_files",
            description: "Search for patterns across the codebase using regex",
            input_schema: {
              type: "object" as const,
              properties: { 
                path: { 
                  type: "string",
                  description: "Absolute path to search from"
                },
                pattern: {
                  type: "string",
                  description: "Regex pattern to search for"
                },
                filePattern: {
                  type: "string",
                  description: "Glob pattern for files to search (default: **/*)"
                }
              },
              required: ["path", "pattern"]
            }
          },
          {
            name: "display_diagram",
            description: "Display a Draw.io diagram. Pass ONLY the mxCell elements - wrapper tags and root cells are added automatically.\n\n" +
              "CRITICAL SIZE CONSTRAINTS:\n" +
              "- Keep diagrams FOCUSED and MINIMAL - show only the most important 8-12 components\n" +
              "- Bedrock has strict tool input size limits - large XML will be rejected\n" +
              "- If the system is complex, create a HIGH-LEVEL diagram showing main components and their relationships\n" +
              "- Avoid excessive details, labels, or deeply nested structures\n" +
              "- Each component should represent a major architectural element, not individual classes/functions\n\n" +
              "EXAMPLE of appropriate size - a system with 3 services:\n" +
              "<mxCell id=\"2\" value=\"API Gateway\" style=\"rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"100\" y=\"100\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell>\n" +
              "<mxCell id=\"3\" value=\"Backend Service\" style=\"rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"300\" y=\"100\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell>\n" +
              "<mxCell id=\"4\" value=\"Database\" style=\"shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"500\" y=\"80\" width=\"80\" height=\"100\" as=\"geometry\"/></mxCell>\n" +
              "<mxCell id=\"5\" style=\"endArrow=classic;html=1;rounded=0;\" edge=\"1\" parent=\"1\" source=\"2\" target=\"3\"><mxGeometry relative=\"1\" as=\"geometry\"/></mxCell>\n" +
              "<mxCell id=\"6\" style=\"endArrow=classic;html=1;rounded=0;\" edge=\"1\" parent=\"1\" source=\"3\" target=\"4\"><mxGeometry relative=\"1\" as=\"geometry\"/></mxCell>",
            input_schema: {
              type: "object" as const,
              properties: { 
                xml: { 
                  type: "string",
                  description: "XML string containing only mxCell elements (no wrapper tags, no root cells). MUST be concise - max 8-12 components due to Bedrock size limits."
                }
              },
              required: ["xml"]
            }
          },
          {
            name: "append_diagram",
            description: "Continue adding elements to an existing diagram when the initial display_diagram exceeded size limits. This tool should ONLY be used after display_diagram has been called successfully and you need to add more components.\n\n" +
              "USAGE:\n" +
              "1. First call display_diagram with initial 8-12 components\n" +
              "2. If more components are needed, use append_diagram to add them in batches\n" +
              "3. Each append_diagram call can add 8-12 more components\n\n" +
              "IMPORTANT: Do NOT use this tool if display_diagram hasn't been called yet. Do NOT include duplicate IDs.",
            input_schema: {
              type: "object" as const,
              properties: {
                xml: {
                  type: "string",
                  description: "XML string containing only additional mxCell elements to append (no wrapper tags, no root cells). Use unique IDs that don't conflict with existing diagram elements."
                }
              },
              required: ["xml"]
            }
          },
          {
            name: "attempt_completion",
            description: "After analyzing the codebase and generating the diagram, use this tool to present the final result. This tool MUST be called to complete the task. The conversation will not end until you call this tool.",
            input_schema: {
              type: "object" as const,
              properties: {
                result: {
                  type: "string",
                  description: "A summary of what was accomplished - the analysis performed and diagram generated"
                },
                command: {
                  type: "string",
                  description: "Optional command to demonstrate the result (not used for this task)"
                }
              },
              required: ["result"]
            }
          }
        ];

        // Context Management (Cline-style)
        const contextManager = new ContextManager();
        let conversationHistoryDeletedRange: [number, number] | undefined = undefined;
        
        // 🆕 Summarization state tracking (Cline-style)
        let currentlySummarizing = false;

        // 🆕 Diagram state tracking for append_diagram
        let currentDiagramXml: string | null = null;

        // Multi-turn conversation loop (Cline-style)
        const MAX_TURNS = 50; // Cline doesn't set a hard limit, but we use 50 as safety
        let currentTurn = 0;
        let shouldContinue = true;

        while (shouldContinue && currentTurn < MAX_TURNS) {
          currentTurn++;
          console.log(`\n=== Turn ${currentTurn} ===`);
          
          // 🆕 Check if we're in summarization continuation mode
          if (currentlySummarizing) {
            console.log("\n" + "🔄".repeat(40));
            console.log("🔄 CONTINUING AFTER SUMMARIZATION");
            console.log("🔄 Will make second API call with compacted context");
            console.log("🔄".repeat(40) + "\n");
            
            // Reset flag - this is the automatic second call
            currentlySummarizing = false;
            
            // Continue loop to make the second API call with compressed context
            // No need to add messages, just proceed with existing compacted context
          }
          
          // Get current messages
          const apiMessages = messageHandler.getApiMessages();
          const conversationMessages = messageHandler.getConversationMessages();
          
          // 🆕 Context Management: Check if we need to optimize context
          // Use conversationMessages for tracking (UI layer messages)
          if (currentTurn > 2) {
            // Calculate current token usage
            const totalTokens = apiMessages.reduce((sum, msg) => {
              const msgTokens = (msg.metrics?.tokensIn || 0) + (msg.metrics?.tokensOut || 0);
              return sum + msgTokens;
            }, 0);
            
            console.log("\n" + "=".repeat(80));
            console.log("📊 CONTEXT MANAGEMENT CHECK");
            console.log("=".repeat(80));
            console.log(`Turn: ${currentTurn}`);
            console.log(`API Messages: ${apiMessages.length}`);
            console.log(`Conversation Messages: ${conversationMessages.length}`);
            console.log(`Total Tokens Used: ${totalTokens.toLocaleString()}`);
            console.log(`Deleted Range: ${conversationHistoryDeletedRange ? `[${conversationHistoryDeletedRange[0]}, ${conversationHistoryDeletedRange[1]}]` : 'None'}`);
            
            // Find the most recent api_req_started message index
            let lastApiReqIndex = -1;
            for (let i = conversationMessages.length - 1; i >= 0; i--) {
              if (conversationMessages[i].say === "api_req_started") {
                lastApiReqIndex = i;
                break;
              }
            }
            
            console.log(`Last API Request Index: ${lastApiReqIndex}`);
            if (lastApiReqIndex >= 0) {
              const lastApiReq = conversationMessages[lastApiReqIndex];
              if (lastApiReq.text) {
                const apiReqInfo = JSON.parse(lastApiReq.text);
                console.log(`Last API Request Tokens: ${JSON.stringify(apiReqInfo)}`);
              }
            }
            
            // Use Cline's built-in logic to check if we should compact
            // Use autoCondenseThreshold from env or default to undefined (lets ContextManager decide)
            const autoCondenseThreshold = process.env.AUTO_CONDENSE_THRESHOLD 
              ? parseFloat(process.env.AUTO_CONDENSE_THRESHOLD)
              : undefined;
            
            const shouldCompact = contextManager.shouldCompactContextWindow(
              conversationMessages,
              handler,
              lastApiReqIndex,
              autoCondenseThreshold  // Configurable threshold or undefined
            );
            
            console.log(`Should Compact: ${shouldCompact ? '✅ YES' : '❌ NO'}`);
            
            if (shouldCompact) {
              console.log("\n⚠️  Context window approaching limit, applying optimization...");
              console.log("-".repeat(80));
              
              // 🆕 INJECT SUMMARIZE PROMPT - Cline's approach
              // Add summarizeTask prompt as a USER MESSAGE (not to system prompt!)
              // This instructs AI to either complete or summarize
              console.log("📝 Injecting summarize task prompt as user message");
              
              // Try file read optimization first
              console.log("🔍 Attempting file read deduplication...");
              
              const needTruncation = await contextManager.attemptFileReadOptimization(
                apiMessages,
                conversationHistoryDeletedRange,
                conversationMessages,
                lastApiReqIndex,
                "/tmp"
              );
              
              if (needTruncation) {
                console.log("⚠️  File optimization not enough, will inject summarize prompt");
                
                // 🔧 CRITICAL: Add summarize_task to tools array for native tool calling
                // Unlike Cline which may rely on prompt-based tool suggestion,
                // we need to explicitly define summarize_task for Bedrock/OpenAI APIs
                // to recognize it as a valid tool call
                if (!tools.find(t => t.name === "summarize_task")) {
                  const summarizeTaskTool: Tool = {
                    name: "summarize_task",
                    description: "Summarize the current task context when conversation history becomes too long. This helps maintain conversation continuity by condensing previous interactions into a concise summary.",
                    input_schema: {
                      type: "object" as const,
                      properties: {
                        context: {
                          type: "string",
                          description: "A comprehensive summary of the conversation so far, including: current work, technical concepts discussed, relevant files and code examined, problems solved, and pending tasks/next steps."
                        }
                      },
                      required: ["context"]
                    }
                  };
                  
                  tools.push(summarizeTaskTool);
                  console.log("✅ Added summarize_task to tools array for native tool calling");
                }
                
                // Inject summarize prompt as the LAST user message
                // This forces AI to either call attempt_completion or summarize_task
                await messageHandler.addApiMessage(
                  createUserMessage(summarizeTask())
                );
              } else {
                console.log("✅ File read optimization saved enough space, no summarization needed");
              }
              
              console.log("-".repeat(80));
            } else {
              console.log("✅ Context usage within safe limits, no optimization needed");
            }
            console.log("=".repeat(80) + "\n");
          }
          
          let assistantTextContent = "";
          const toolCallsInThisTurn: Array<{ id: string; name: string; input: any }> = [];
          let usageInfo: { inputTokens: number; outputTokens: number; cacheWriteTokens?: number; cacheReadTokens?: number } | undefined;
          
          // Stream LLM response using unified ApiStream (Cline-style)
          // Provider internally converts StorageMessage to its required format
          for await (const chunk of handler.createMessage(systemPrompt, apiMessages, tools)) {
            // Send chunk to frontend
            safeEnqueue(
              encoder.encode(`event: ${chunk.type}\ndata: ${JSON.stringify(chunk)}\n\n`)
            );
            
            // Accumulate assistant text
            if (chunk.type === "text") {
              assistantTextContent += chunk.text;
            }
            
            // Collect tool calls
            if (chunk.type === "tool_calls" && chunk.tool_call) {
              console.log(`Tool call: ${chunk.tool_call.name}`);
              toolCallsInThisTurn.push(chunk.tool_call);
            }
            
            // Capture usage information
            if (chunk.type === "usage") {
              usageInfo = {
                inputTokens: chunk.inputTokens,
                outputTokens: chunk.outputTokens,
                cacheWriteTokens: chunk.cacheWriteTokens,
                cacheReadTokens: chunk.cacheReadTokens,
              };
              console.log(`📊 Usage: ${chunk.inputTokens} in, ${chunk.outputTokens} out` + 
                (chunk.cacheReadTokens ? `, ${chunk.cacheReadTokens} cache read` : '') +
                (chunk.cacheWriteTokens ? `, ${chunk.cacheWriteTokens} cache write` : ''));
            }
          }
          
          // Add assistant's text to conversation history if any
          if (assistantTextContent.trim()) {
            const assistantMsg = createAssistantMessage(assistantTextContent);
            
            // Add usage metrics if available
            if (usageInfo) {
              assistantMsg.metrics = {
                tokensIn: usageInfo.inputTokens,
                tokensOut: usageInfo.outputTokens,
                cacheWrites: usageInfo.cacheWriteTokens,
                cacheReads: usageInfo.cacheReadTokens,
              };
            }
            
            await messageHandler.addApiMessage(assistantMsg);
            
            // Add api_req_started message for Context Manager to track token usage
            await messageHandler.addConversationMessage(
              createApiReqStartedMessage({
                tokensIn: usageInfo?.inputTokens,
                tokensOut: usageInfo?.outputTokens,
                cacheWrites: usageInfo?.cacheWriteTokens,
                cacheReads: usageInfo?.cacheReadTokens,
              })
            );
          }
          
          // If no tool calls, add guidance message and continue (Cline-style)
          if (toolCallsInThisTurn.length === 0) {
            console.log("\n" + "!".repeat(80));
            console.log("⚠️  NO TOOL CALLS - ADDING GUIDANCE MESSAGE");
            console.log("!".repeat(80));
            console.log("Assistant text output:");
            console.log("-".repeat(80));
            console.log(assistantTextContent || "(empty)");
            console.log("-".repeat(80));
            console.log("Text length:", assistantTextContent.length);
            console.log("Tool calls collected:", toolCallsInThisTurn.length);
            console.log("!".repeat(80) + "\n");
            
            // Add guidance message to continue with tools (Cline-style)
            const guidanceMessage = "[ERROR] You did not use a tool in your previous response! Please retry with a tool use.\n\nIf you have completed the analysis and generated the diagram, use the attempt_completion tool.\nIf you need to generate the diagram, use the display_diagram tool.\nOtherwise, continue with the next step of the analysis.\n\n(This is an automated message, so do not respond to it conversationally.)";
            
            await messageHandler.addApiMessage(createUserMessage(guidanceMessage));
            
            // Continue the loop instead of ending it
            continue;
          }
          
          // Execute tools and add results to conversation (Cline-style)
          for (const toolCall of toolCallsInThisTurn) {
            let result = "";
            
            try {
              console.log(`Executing tool: ${toolCall.name} with input:`, toolCall.input);
              
              switch (toolCall.name) {
                case "list_directories":
                  result = await listDirectories(toolCall.input.path);
                  break;
                case "list_files_recursive":
                  result = await listFilesRecursive(
                    toolCall.input.path,
                    toolCall.input.maxDepth || 3
                  );
                  break;
                case "read_file":
                  result = await readFile(toolCall.input.path);
                  break;
                case "list_code_definition_names":
                  result = await listCodeDefinitionNames(toolCall.input.path);
                  break;
                case "search_files":
                  result = await searchFiles(
                    toolCall.input.path,
                    toolCall.input.pattern,
                    toolCall.input.filePattern
                  );
                  break;
                case "display_diagram":
                  const diagramResult = await displayDiagram(toolCall.input);
                  
                  if (diagramResult.success) {
                    // Store the diagram XML for potential append_diagram calls
                    currentDiagramXml = diagramResult.wrappedXml || null;
                    
                    // Send the wrapped XML to frontend
                    safeEnqueue(
                      encoder.encode(`event: diagram\ndata: ${JSON.stringify({ 
                        xml: diagramResult.wrappedXml 
                      })}\n\n`)
                    );
                    result = "Diagram generated and displayed successfully. You should now call attempt_completion to finish the task.";
                  } else {
                    // Validation or truncation error - let LLM retry
                    result = diagramResult.error || "Failed to display diagram";
                    
                    // If truncated, don't end conversation - let LLM regenerate
                    if (!diagramResult.isTruncated) {
                      shouldContinue = false;
                    }
                  }
                  break;
                case "append_diagram":
                  const appendResult = await appendDiagram(toolCall.input, currentDiagramXml);
                  
                  if (appendResult.success) {
                    // Update the stored diagram XML with the appended version
                    currentDiagramXml = appendResult.wrappedXml || null;
                    
                    // Send the updated diagram to frontend
                    safeEnqueue(
                      encoder.encode(`event: diagram\ndata: ${JSON.stringify({ 
                        xml: appendResult.wrappedXml 
                      })}\n\n`)
                    );
                    result = `Successfully appended ${appendResult.appendedCount} component(s) to the diagram.${appendResult.error ? ` Note: ${appendResult.error}` : ''} You can continue appending more if needed, or call attempt_completion to finish.`;
                  } else {
                    result = appendResult.error || "Failed to append to diagram";
                  }
                  break;
                case "summarize_task":
                  console.log("📝 Processing summarize_task...");
                  
                  // Handle summarization (Cline-style)
                  result = await handleSummarizeTask({ context: toolCall.input.context });
                  
                  // Apply truncation AFTER summarization
                  // Cline uses "none" to keep only first pair and last messages
                  conversationHistoryDeletedRange = contextManager.getNextTruncationRange(
                    apiMessages,
                    conversationHistoryDeletedRange,
                    "none"
                  );
                  
                  messageHandler.setDeletedRange(conversationHistoryDeletedRange);
                  
                  const removedCount = conversationHistoryDeletedRange[1] - conversationHistoryDeletedRange[0] + 1;
                  console.log(`📉 Post-summarization truncation applied:`);
                  console.log(`   - Removed messages: [${conversationHistoryDeletedRange[0]} to ${conversationHistoryDeletedRange[1]}]`);
                  console.log(`   - Total removed: ${removedCount} messages`);
                  console.log(`   - Remaining: ${apiMessages.length - removedCount} messages`);
                  
                  // 🔧 Set flag to trigger automatic second API call
                  // This follows Cline's two-call pattern:
                  // 1. First call: AI summarizes the context
                  // 2. Second call: AI continues work with compressed context
                  currentlySummarizing = true;
                  console.log("✅ Summarization complete, will trigger second API call next iteration");
                  break;
                  
                case "attempt_completion":
                  result = await attemptCompletion(toolCall.input);
                  console.log("Task completed via attempt_completion");
                  // Signal that task is complete
                  shouldContinue = false;
                  break;
                default:
                  result = `Unknown tool: ${toolCall.name}`;
              }
              
              console.log(`Tool result length: ${result.length} characters`);
            } catch (error) {
              result = `Error executing tool: ${error}`;
              console.error(`Tool execution error:`, error);
            }
            
            // Send result to frontend
            safeEnqueue(
              encoder.encode(`event: tool_result\ndata: ${JSON.stringify({ 
                toolName: toolCall.name,
                result 
              })}\n\n`)
            );
            
            // Add tool result to conversation for next LLM turn (KEY: like Cline's coordinator.execute)
            await messageHandler.addApiMessage(
              createUserMessage(`<tool_result tool_name="${toolCall.name}">\n${result}\n</tool_result>`)
            );
            
            // Also add to conversation messages for UI tracking
            await messageHandler.addConversationMessage(
              createToolMessage({
                tool: toolCall.name,
                path: toolCall.input.path,
                content: result.length > 200 ? result.substring(0, 200) + "..." : result,
              })
            );
          }
        }

        if (currentTurn >= MAX_TURNS) {
          console.log("Max turns reached");
          safeEnqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ 
              error: "Maximum conversation turns reached" 
            })}\n\n`)
          );
        }

        safeEnqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        safeClose();
      } catch (error) {
        console.error("API error:", error);
        safeEnqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`)
        );
        safeClose();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
