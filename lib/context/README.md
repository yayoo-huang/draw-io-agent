# Context Management System

Enterprise-grade Context Management System adapted from Cline, providing intelligent conversation history optimization for Draw.io Agent.

## 🎯 Core Features

### 1. File Read Deduplication
- **Auto-detection**: Identifies multiple reads of the same file
- **Smart replacement**: Keeps the last occurrence intact, replaces previous ones with placeholders
- **Token savings**: Typically saves 30%+ tokens

### 2. Smart Truncation
- **Preserve first pair**: Always keeps the first user-assistant message pair
- **4 modes**: none, lastTwo, half, quarter
- **Structure maintenance**: Automatically maintains user-assistant-user-assistant pattern

### 3. Multi-model Support
- **Auto-adaptation**: Automatically adjusts based on different context windows
- **Reserved space**:
  - 64K (DeepSeek): reserves 27K
  - 128K (Most models): reserves 30K
  - 200K (Claude): reserves 40K

### 4. Persistence
- **Disk storage**: Saves context history to `context-history.json`
- **Task recovery**: Supports resuming after interruption

### 5. Telemetry
- **Token statistics**: Tracks token usage
- **Optimization metrics**: Calculates saved characters and percentages

## 📦 Installation

Already included in the project, no additional installation required. Dependencies:
- `@anthropic-ai/sdk`
- `clone-deep`
- `@types/clone-deep` (dev)

## 🚀 Quick Start

### Basic Usage

```typescript
import { ContextManager } from "@/lib/context";
import type { ApiHandler, ConversationMessage } from "@/lib/context";

// 1. Create instance
const contextManager = new ContextManager();

// 2. Initialize (load history from disk)
await contextManager.initializeContextHistory(taskDirectory);

// 3. Get optimized messages
const result = await contextManager.getNewContextMessagesAndMetadata(
  apiConversationHistory,  // Anthropic.Messages.MessageParam[]
  conversationMessages,    // ConversationMessage[]
  apiHandler,              // ApiHandler instance
  deletedRange,            // [number, number] | undefined
  previousApiReqIndex,     // number
  taskDirectory,           // string
  useAutoCondense          // boolean
);

// 4. Use optimized messages
const { truncatedConversationHistory } = result;
```

### API Handler Adaptation

Your API provider needs to implement the `ApiHandler` interface:

```typescript
interface ApiHandler {
  getModel(): {
    id: string;
    info: {
      contextWindow?: number;
    };
  };
}
```

### Message Format

```typescript
interface ConversationMessage {
  ts: number;        // timestamp
  type: string;      // message type
  text?: string;     // JSON string containing token info
  say?: string;      // special marker (e.g., "api_req_started")
}

interface ApiReqInfo {
  tokensIn?: number;
  tokensOut?: number;
  cacheWrites?: number;
  cacheReads?: number;
}
```

## 🔧 Advanced Usage

### Manually Trigger File Read Optimization

```typescript
const needToTruncate = await contextManager.attemptFileReadOptimization(
  apiConversationHistory,
  conversationHistoryDeletedRange,
  clineMessages,
  previousApiReqIndex,
  taskDirectory
);

if (!needToTruncate) {
  console.log("File deduplication saved enough space, no truncation needed");
}
```

### Get Telemetry Data

```typescript
const telemetry = contextManager.getContextTelemetryData(
  clineMessages,
  apiHandler,
  triggerIndex  // optional
);

if (telemetry) {
  console.log(`Used ${telemetry.tokensUsed} tokens`);
  console.log(`Context window: ${telemetry.maxContextWindow}`);
}
```

### Check if Compaction is Needed

```typescript
const shouldCompact = contextManager.shouldCompactContextWindow(
  clineMessages,
  apiHandler,
  previousApiReqIndex,
  0.8  // optional: threshold percentage
);

if (shouldCompact) {
  console.log("Approaching context window limit, optimization needed");
}
```

### Custom Truncation Range

```typescript
const deletedRange = contextManager.getNextTruncationRange(
  apiMessages,
  currentDeletedRange,
  "half"  // "none" | "lastTwo" | "half" | "quarter"
);

console.log(`Will delete index ${deletedRange[0]} to ${deletedRange[1]}`);
```

## 📝 How It Works

### File Read Optimization

1. **Scan messages**: Detects all file read operations
   - `read_file` tool calls
   - File content in `write_to_file`/`replace_in_file` output
   - File mentions (optional, not used in Draw.io Agent)

2. **Deduplication strategy**:
   ```
   1st read of app.ts → Keep full content [1000 lines of code]
   2nd read of app.ts → Replace with placeholder [NOTE] ...
   3rd read of app.ts → Keep full content [1000 lines of code] ✓
   ```

3. **Effect calculation**:
   - If savings >= 30%: Only apply deduplication
   - If savings < 30%: Apply both deduplication and truncation

### Smart Truncation

```
Original messages:
[0] user         ← Keep
[1] assistant    ← Keep
[2] user         ← May delete
[3] assistant    ← May delete
[4] user         ← May delete
[5] assistant    ← May delete
[6] user         ← Keep (latest)
[7] assistant    ← Keep (latest)

After truncation (keep="half"):
[0] user         ← Keep
[1] assistant    ← Keep
[4] user         ← Keep
[5] assistant    ← Keep
[6] user         ← Keep
[7] assistant    ← Keep
```

## 🎨 Integration Example

### Use in API Route

```typescript
// app/api/analyze/route.ts
import { ContextManager } from "@/lib/context";

export async function POST(req: Request) {
  const contextManager = new ContextManager();
  await contextManager.initializeContextHistory("./tasks/current");
  
  // ... build messages ...
  
  const result = await contextManager.getNewContextMessagesAndMetadata(
    messages,
    conversationMessages,
    apiHandler,
    undefined,
    lastApiReqIndex,
    "./tasks/current",
    false  // don't use auto-condense
  );
  
  // Use optimized messages to call LLM
  const response = await anthropic.messages.create({
    messages: result.truncatedConversationHistory,
    // ...
  });
}
```

## 📊 Performance Considerations

### Token Savings Example

```
Original conversation: 50,000 tokens
- File Read Deduplication: -15,000 tokens (30%)
- Smart Truncation: -10,000 tokens (20%)
Final: 25,000 tokens (50% savings)
```

### Persistence Overhead

- Write to disk: ~10-50ms (depending on history size)
- Read from disk: ~5-20ms
- Recommendation: Initialize and save only when needed

## ⚠️ Important Notes

1. **File Mention Support**: Draw.io Agent doesn't use `<file_content>` format, this feature is disabled
2. **Tool Result Validation**: Included in the system but may not be necessary
3. **Checkpoint Rollback**: Included but may not be needed for one-shot tasks
4. **Memory Usage**: Large conversation histories may consume significant memory

## 🔍 Debugging

Enable verbose logging:

```typescript
// Add logging in ContextManager
console.log("Context optimization metrics:", {
  percentSaved,
  uniqueFileReadIndices: uniqueFileReadIndices.size,
});
```

View persistence file:

```bash
cat ./tasks/current/context-history.json | jq .
```

## 📚 References

- Cline source: `src/core/context/context-management/`
- Anthropic Messages API: https://docs.anthropic.com/claude/reference/messages
- Context Window sizes: https://docs.anthropic.com/claude/docs/models-overview

## 🤝 Contributing

This system is adapted from Cline. For improvements:
1. Maintain consistency with Cline architecture
2. Add optimizations specific to Draw.io Agent
3. Update this documentation
