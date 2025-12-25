# Draw.io Agent - Implementation Guide

## Project Status

✅ **COMPLETED** - The project is fully implemented and functional!

This guide documents the completed implementation and provides guidance for extending the system.

## Completed Implementation

### 1. Core Architecture ✅

**Next.js 15 Application** - Single integrated application
- App Router with streaming support
- Server-side API routes
- React 19 with concurrent features
- TypeScript throughout

### 2. Frontend Components ✅

**Main UI** (`app/page.tsx`)
- Chat interface with streaming message display
- Diagram type selector (7 types)
- Codebase path input
- Integrated Draw.io viewer
- "New Diagram" button for state reset
- Responsive resizable layout

**Context Management** (`contexts/diagram-context.tsx`)
- Global diagram XML state
- State updates from API responses
- React Context for component communication

**UI Components** (`components/ui/`)
- Complete shadcn/ui component library
- Buttons, inputs, cards, dialogs
- Resizable panels
- Scroll areas
- Select dropdowns

### 3. Backend API ✅

**Main Endpoint** (`app/api/analyze/route.ts`)
- POST `/api/analyze` - Streaming diagram generation
- Conversation history management
- Tool execution orchestration
- Multi-provider AI support
- Context window management
- Error handling and recovery

**Key Features:**
- Streaming responses with text/event-stream
- Recursive tool execution loop
- State persistence between tool calls
- `currentDiagramXml` tracking for append_diagram

### 4. AI Provider Layer ✅

**Providers** (`lib/core/providers/`)
- `bedrock.ts` - AWS Bedrock (Claude models)
- `openai.ts` - OpenAI and compatible APIs
- `index.ts` - Provider factory and configuration

**Capabilities:**
- Streaming text responses
- Tool calling support
- Error handling
- Rate limiting considerations

### 5. Tool System ✅

**Implemented Tools** (`lib/tools/handlers/`)

| Tool | File | Status | Purpose |
|------|------|--------|---------|
| `read_file` | `read-file.ts` | ✅ | Read code file contents |
| `list_files_recursive` | `list-files-recursive.ts` | ✅ | List project structure |
| `list_directories` | `list-directories.ts` | ✅ | List directory names |
| `search_files` | `search-files.ts` | ✅ | Regex search in files |
| `list_code_definition_names` | `list-code-definition-names.ts` | ✅ | Extract code symbols |
| `display_diagram` | `display-diagram.ts` | ✅ | Generate diagram XML |
| `append_diagram` | `append-diagram.ts` | ✅ | Extend existing diagram |
| `attempt_completion` | `attempt-completion.ts` | ✅ | Task completion |

**Tool Features:**
- Path validation and security
- Size limits and error handling
- Consistent response formats
- Progress tracking

### 6. System Prompts ✅

**Modular System** (`lib/prompts/system-prompt/`)

**Components** (`components/`):
- `agent-role.ts` - Define AI agent identity
- `objective.ts` - Task goals and approach
- `workflow.ts` - Step-by-step process
- `rules.ts` - Constraints and guidelines
- `critical-requirement.ts` - append_diagram explanation
- `drawio-reference.ts` - XML format reference

**Tool Descriptions** (`tools/`):
- Individual tool specifications
- Input schemas
- Usage examples
- Best practices

**Assembly** (`index.ts`):
- Combines all components
- Exports complete system prompt
- Maintains consistent structure

### 7. Context Management ✅

**Smart Context Window** (`lib/context/`)
- Token counting and estimation
- Message prioritization
- Conversation summarization
- Context window optimization
- ContextManager class for state tracking

### 8. Message Handling ✅

**Message Storage** (`lib/messages/`)
- Message state management
- History persistence
- Format conversion
- Type definitions

### 9. Configuration ✅

**Environment Setup** (`.env.example`)
```env
# AI Provider (choose one)
AI_PROVIDER=bedrock  # or openai

# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0

# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4-turbo

# Optional Analytics
LANGFUSE_SECRET_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_HOST=
```

## Usage Guide

### Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd draw-io-agent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Run development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

### Using the Application

1. **Select Diagram Type**
   - Choose from dropdown: System Architecture, Data Flow, etc.

2. **Enter Codebase Path**
   - Provide full path to your project directory
   - Example: `/Users/username/projects/my-app`

3. **Send Request**
   - Click send or press Enter
   - Watch AI analyze your codebase

4. **View Diagram**
   - Diagram appears in Draw.io viewer
   - Edit manually if needed
   - Use "New Diagram" to start fresh

### Creating New Diagram Types

Edit the dropdown in `app/page.tsx`:

```typescript
const diagramTypes = [
  "System Architecture",
  "Component Structure", 
  "Data Flow",
  "Your New Type",  // Add here
  // ...
]
```

The AI agent will automatically understand and generate appropriate diagrams based on the type name.

## Extension Guide

### Adding New Tools

**1. Create Tool Handler** (`lib/tools/handlers/your-tool.ts`)

```typescript
export async function yourTool(input: {
  parameter1: string;
  parameter2?: number;
}): Promise<{ success: boolean; content: string }> {
  try {
    // Tool implementation
    const result = await yourImplementation(input);
    
    return {
      success: true,
      content: formatResult(result),
    };
  } catch (error) {
    return {
      success: false,
      content: `Error: ${error.message}`,
    };
  }
}
```

**2. Export from Index** (`lib/tools/index.ts`)

```typescript
export { yourTool } from "./handlers/your-tool"
```

**3. Add to API Route** (`app/api/analyze/route.ts`)

Add to tools array:
```typescript
{
  name: "your_tool",
  description: "What your tool does",
  input_schema: {
    type: "object",
    properties: {
      parameter1: {
        type: "string",
        description: "What this parameter does"
      }
    },
    required: ["parameter1"]
  }
}
```

Add to switch statement:
```typescript
case "your_tool":
  toolResult = await yourTool(toolCall.input)
  break
```

**4. Create Prompt Description** (`lib/prompts/system-prompt/tools/your-tool.ts`)

```typescript
export const yourToolPrompt = `## your_tool

Description: Detailed explanation of what your tool does

Parameters:
- parameter1 (required): Description
- parameter2 (optional): Description

Usage:
<your_tool>
<parameter1>value</parameter1>
<parameter2>value</parameter2>
</your_tool>

Example output:
[Show what the tool returns]
`
```

**5. Include in System Prompt** (`lib/prompts/system-prompt/tools/index.ts`)

```typescript
import { yourToolPrompt } from "./your-tool"

export const allToolPrompts = [
  // ... existing tools
  yourToolPrompt,
]
```

### Adding New AI Providers

**1. Create Provider** (`lib/core/providers/your-provider.ts`)

```typescript
import { LanguageModelV1 } from "ai"
import { YourProviderSDK } from "your-provider-sdk"

export function createYourProvider(config: {
  apiKey: string
  model: string
}): LanguageModelV1 {
  const client = new YourProviderSDK({ apiKey: config.apiKey })
  
  // Implement LanguageModelV1 interface
  // or use AI SDK's provider adapter
  return yourProviderAdapter(client, config.model)
}
```

**2. Register Provider** (`lib/core/providers/index.ts`)

```typescript
case "your-provider":
  return createYourProvider({
    apiKey: process.env.YOUR_PROVIDER_API_KEY!,
    model: process.env.YOUR_PROVIDER_MODEL!,
  })
```

**3. Update Environment Variables** (`.env.example`)

```env
# Your Provider
YOUR_PROVIDER_API_KEY=your_key
YOUR_PROVIDER_MODEL=model-name
```

### Customizing System Prompts

**Modify Existing Components:**

Edit files in `lib/prompts/system-prompt/components/`:
- `agent-role.ts` - Change AI personality
- `objective.ts` - Adjust goals
- `workflow.ts` - Modify process
- `rules.ts` - Add constraints

**Add New Components:**

1. Create new file in `components/`
2. Export prompt string
3. Import in `index.ts`
4. Add to prompt assembly

### Enhancing Context Management

**Modify Strategy** (`lib/context/context-management/ContextManager.ts`)

```typescript
// Adjust token limits
const MAX_CONTEXT_TOKENS = 100000

// Change prioritization
prioritizeMessages(messages: Message[]) {
  // Your prioritization logic
}

// Customize summarization
summarizeMessages(messages: Message[]) {
  // Your summarization logic
}
```

## Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Test with various codebases
# - Small project (< 50 files)
# - Medium project (100-500 files) 
# - Large project (1000+ files)

# Test different diagram types
# Test error handling (invalid paths, etc.)
```

### Integration Testing

Create test script (`test-api.sh`):

```bash
#!/bin/bash

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze the system architecture of /path/to/project",
    "conversationHistory": []
  }'
```

## Performance Optimization

### Current Optimizations ✅

1. **Streaming Responses** - Real-time user feedback
2. **Incremental Diagrams** - append_diagram for large projects
3. **Smart Context** - Token-aware message management
4. **Efficient Tools** - Optimized file operations

### Future Optimizations

1. **Caching**
   - Cache file tree results
   - Memoize tool results
   - Store processed code structures

2. **Parallel Processing**
   - Concurrent file reads
   - Batch tool executions
   - Background pre-processing

3. **Lazy Loading**
   - On-demand component loading
   - Progressive diagram rendering
   - Chunked large file handling

## Troubleshooting

### Common Issues

**Issue: "Failed to fetch"**
- Check API route is running
- Verify CORS settings
- Check network tab for errors

**Issue: Empty diagram**
- Check AI provider credentials
- Verify codebase path exists
- Check console for tool errors

**Issue: Slow responses**
- Large codebase may take time
- Check context window isn't full
- Consider using append_diagram

**Issue: TypeScript errors**
- Run `npm run build` to check
- Verify all types are exported
- Check tsconfig.json settings

## Production Deployment

### Environment Setup

```bash
# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t draw-io-agent .

# Run container
docker run -p 3000:3000 \
  -e AWS_ACCESS_KEY_ID=xxx \
  -e AWS_SECRET_ACCESS_KEY=xxx \
  draw-io-agent
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

## Development Workflow

### Code Style

- Use TypeScript strict mode
- Follow Biome linter rules
- Write descriptive comments
- Use meaningful variable names

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-tool

# Commit changes
git add .
git commit -m "feat: add new analysis tool"

# Push and create PR
git push origin feature/new-tool
```

### Documentation

- Update README for user-facing changes
- Update this guide for implementation changes
- Document new tools and features
- Keep SYSTEM_ARCHITECTURE.md current

## Resources

### Internal Documentation
- `SYSTEM_ARCHITECTURE.md` - System design
- `README.md` - User guide
- `docs/` - Additional documentation

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Draw.io XML Format](https://www.drawio.com/doc/)
- [AWS Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Anthropic API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs)

## Support

For issues and questions:
1. Check this implementation guide
2. Review SYSTEM_ARCHITECTURE.md
3. Open GitHub issue
4. Contact maintainers

## License

MIT License - See LICENSE file for details
