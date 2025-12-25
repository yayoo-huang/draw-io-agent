# Message System for Draw.io Agent

Complete message management system based on Cline's architecture, featuring dual-layer messaging for API and UI.

## Architecture

### Two-Layer Message System

```
┌─────────────────────────────────────────────────────────┐
│                  MessageStateHandler                     │
│                                                           │
│  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │   API Messages          │  │  Display Messages     │ │
│  │   (StorageMessage[])    │  │  (DisplayMessage[])   │ │
│  │                          │  │                       │ │
│  │  - For LLM communication│  │  - For UI display     │ │
│  │  - Includes metrics     │  │  - Event tracking     │ │
│  │  - Model info           │  │  - User interaction   │ │
│  └─────────────────────────┘  └──────────────────────┘ │
│                                                           │
│  Mutex Lock (prevents race conditions)                   │
│  Disk Persistence (.drawio-agent/taskId/)               │
└─────────────────────────────────────────────────────────┘
```

## Usage

### 1. Initialize MessageStateHandler

```typescript
import { MessageStateHandler } from "@/lib/messages";
import { createUserMessage, createTaskMessage } from "@/lib/types/messages";

const messageHandler = new MessageStateHandler({
  taskId: "task-123",
  onStateUpdate: (state) => {
    console.log("Messages updated:", state);
  },
});
```

### 2. Add API Messages (for LLM)

```typescript
import { createUserMessage, createAssistantMessage } from "@/lib/types/messages";

// Add user message
await messageHandler.addApiMessage(
  createUserMessage("Generate a system architecture diagram")
);

// Add assistant message with metrics
const assistantMsg = createAssistantMessage("I'll analyze the codebase...");
assistantMsg.metrics = {
  tokensIn: 1000,
  tokensOut: 500,
  cost: 0.015,
};
await messageHandler.addApiMessage(assistantMsg);
```

### 3. Add Display Messages (for UI)

```typescript
import {
  createTaskMessage,
  createTextMessage,
  createApiReqStartedMessage,
  createToolMessage,
  createDiagramMessage,
} from "@/lib/types/messages";

// Task started
await messageHandler.addDisplayMessage(
  createTaskMessage("Generate system architecture diagram")
);

// API request started
await messageHandler.addDisplayMessage(
  createApiReqStartedMessage({
    tokensIn: 1000,
    tokensOut: 500,
  })
);

// Tool executed
await messageHandler.addDisplayMessage(
  createToolMessage({
    tool: "read_file",
    path: "/path/to/file.ts",
  })
);

// Diagram generated
await messageHandler.addDisplayMessage(
  createDiagramMessage("<mxGraphModel>...</mxGraphModel>")
);
```

### 4. Get Messages

```typescript
// Get API messages (for sending to LLM)
const apiMessages = messageHandler.getApiMessages();

// Get display messages (for UI)
const displayMessages = messageHandler.getDisplayMessages();

// Get complete state
const state = messageHandler.getState();
```

### 5. Update Messages

```typescript
// Update API message
await messageHandler.updateApiMessage(0, {
  metrics: {
    tokensIn: 1500,
    tokensOut: 750,
  },
});

// Update display message
await messageHandler.updateDisplayMessage(0, {
  partial: false,
});
```

### 6. Persistence

```typescript
// Save happens automatically on every add/update

// Load from disk
await messageHandler.loadFromDisk();

// Clear all messages
await messageHandler.clear();
```

## Integration with API Route

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MessageStateHandler } from "@/lib/messages";
import {
  createUserMessage,
  createAssistantMessage,
  createTaskMessage,
  createApiReqStartedMessage,
  toAnthropicMessage,
} from "@/lib/types/messages";

export async function POST(request: NextRequest) {
  const { task, codebases } = await request.json();
  const taskId = generateTaskId();

  // Initialize message handler
  const messageHandler = new MessageStateHandler({
    taskId,
    onStateUpdate: (state) => {
      // Stream updates to client
      streamUpdate(state);
    },
  });

  // Add initial task
  await messageHandler.addApiMessage(createUserMessage(task));
  await messageHandler.addDisplayMessage(createTaskMessage(task));

  // Agent loop
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Get messages for LLM (convert to Anthropic format)
    const apiMessages = messageHandler.getApiMessages();
    const anthropicMessages = apiMessages.map(toAnthropicMessage);

    // Track API request
    await messageHandler.addDisplayMessage(
      createApiReqStartedMessage({})
    );

    // Call LLM
    const response = await handler.createMessage(
      systemPrompt,
      anthropicMessages,
      tools
    );

    // Process response and add metrics
    let assistantContent = "";
    let metrics = { tokensIn: 0, tokensOut: 0 };

    for await (const chunk of response) {
      if (chunk.type === "text") {
        assistantContent += chunk.content;
      } else if (chunk.type === "usage") {
        metrics.tokensIn = chunk.inputTokens || 0;
        metrics.tokensOut = chunk.outputTokens || 0;
      }
    }

    // Save assistant message
    const assistantMsg = createAssistantMessage(assistantContent);
    assistantMsg.metrics = metrics;
    await messageHandler.addApiMessage(assistantMsg);

    // Check if complete
    if (isComplete(response)) {
      break;
    }
  }

  return NextResponse.json({
    taskId,
    messages: messageHandler.getDisplayMessages(),
  });
}
```

## Context Management Integration

The message system integrates with Context Management:

```typescript
import { ContextManager } from "@/lib/context";

const contextManager = new ContextManager();
const messageHandler = new MessageStateHandler({ taskId: "task-123" });

// Check if context optimization needed
const apiMessages = messageHandler.getApiMessages();
const shouldOptimize = contextManager.shouldCompactContextWindow(
  convertToClineMessages(apiMessages),
  handler,
  lastApiReqIndex
);

if (shouldOptimize) {
  // Optimize messages
  const optimized = await contextManager.getNewContextMessagesAndMetadata(
    apiMessages,
    convertToClineMessages(apiMessages),
    handler,
    messageHandler.getDeletedRange(),
    lastApiReqIndex,
    taskDir,
    useAutoCondense
  );

  // Update deleted range
  messageHandler.setDeletedRange(optimized.conversationHistoryDeletedRange);

  // Save optimized messages
  await messageHandler.setApiMessages(optimized.truncatedConversationHistory);
}
```

## Files Structure

```
lib/
├── types/
│   ├── storage-message.ts     # API layer messages
│   ├── display-message.ts     # UI layer messages
│   └── messages.ts            # Unified exports
├── messages/
│   ├── MessageStateHandler.ts # Core state manager
│   ├── storage.ts             # Disk persistence
│   ├── index.ts               # Module exports
│   └── README.md              # This file
└── context/
    └── ...                    # Context Management
```

## Key Features

✅ **Dual-layer messaging** - Separate API and UI concerns
✅ **Mutex protection** - Thread-safe operations
✅ **Automatic persistence** - Saves to disk on every change
✅ **Type-safe** - Full TypeScript support
✅ **Metrics tracking** - Token counts, costs, model info
✅ **Context management ready** - Integrates with ContextManager
✅ **Based on Cline** - Battle-tested architecture

## Best Practices

1. **Always use MessageStateHandler** - Don't manipulate arrays directly
2. **Use factory functions** - `createUserMessage()`, `createTaskMessage()`, etc.
3. **Track metrics** - Add token counts and costs for monitoring
4. **Handle state updates** - Use `onStateUpdate` callback for streaming
5. **Clean up** - Call `clear()` when task is complete or cancelled
