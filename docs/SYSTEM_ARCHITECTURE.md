# Draw.io Agent - System Architecture

## Overview

Draw.io Agent is a Next.js 15 application that uses AI to analyze codebases and automatically generate architecture diagrams. It combines modern web technologies with AI capabilities to provide an interactive diagram generation experience.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  app/page   │  │ DiagramContext│  │ Components/UI    │  │
│  │  .tsx       │──│               │──│                  │  │
│  │             │  │ - Diagram XML │  │ - Chat Interface │  │
│  │ Main UI     │  │ - State Mgmt  │  │ - Diagram Viewer │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP POST
             ↓
┌─────────────────────────────────────────────────────────────┐
│              API Route (app/api/analyze/route.ts)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Streaming Response Handler                 │   │
│  │  - Receives user message                            │   │
│  │  - Manages conversation history                     │   │
│  │  - Streams AI responses                             │   │
│  └────────┬───────────────────────────┬─────────────────┘   │
│           │                           │                      │
│           ↓                           ↓                      │
│  ┌────────────────┐         ┌────────────────────┐         │
│  │  AI Providers  │         │  Tool Execution    │         │
│  ├────────────────┤         ├────────────────────┤         │
│  │ - Bedrock      │         │ - read_file        │         │
│  │ - OpenAI       │         │ - list_directories │         │
│  │ - Anthropic    │         │ - search_files     │         │
│  │ - Custom APIs  │         │ - display_diagram  │         │
│  └────────────────┘         │ - append_diagram   │         │
│                              └────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│                      Tool Implementations                    │
│                  (lib/tools/handlers/)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ read-file.ts │  │list-files-   │  │ display-        │  │
│  │              │  │recursive.ts  │  │ diagram.ts      │  │
│  │ Reads code   │  │              │  │                 │  │
│  │ files        │  │Lists project │  │Generates Draw.io│  │
│  │              │  │structure     │  │XML              │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │append-       │  │search-       │  │list-code-       │  │
│  │diagram.ts    │  │files.ts      │  │definition-      │  │
│  │              │  │              │  │names.ts         │  │
│  │Appends to    │  │Regex search  │  │                 │  │
│  │existing      │  │across files  │  │Extracts code    │  │
│  │diagrams      │  │              │  │definitions      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (`app/page.tsx`)

**Responsibilities:**
- Main user interface
- Chat message input/display
- Diagram type selection
- Codebase path input
- Draw.io diagram viewer integration

**Key Features:**
- Streaming message display
- Real-time diagram updates
- "New Diagram" button for fresh starts
- Responsive layout with resizable panels

### 2. Diagram Context (`contexts/diagram-context.tsx`)

**State Management:**
- `diagramXml`: Current diagram XML
- `setDiagramXml`: Update diagram state
- Provides global diagram state to all components

### 3. API Route (`app/api/analyze/route.ts`)

**Core Orchestration:**
- Receives POST requests with user messages
- Manages conversation history
- Handles AI provider streaming
- Executes tool calls
- Returns streaming responses

**Flow:**
```typescript
1. Receive user message
2. Add to conversation history
3. Stream request to AI provider
4. Process tool calls:
   - Execute tool handler
   - Add tool result to history
   - Continue conversation loop
5. Return final response
```

### 4. AI Provider Layer (`lib/core/providers/`)

**Provider Implementations:**
- `bedrock.ts`: AWS Bedrock integration
- `openai.ts`: OpenAI/compatible APIs
- `index.ts`: Provider factory and management

**Features:**
- Streaming support
- Tool calling capabilities
- Error handling
- Rate limiting

### 5. Tool Handlers (`lib/tools/handlers/`)

**Available Tools:**

| Tool | Purpose | Key Features |
|------|---------|--------------|
| `read-file.ts` | Read code files | Encoding detection, size limits |
| `list-files-recursive.ts` | List project structure | Recursive listing, filtering |
| `list-directories.ts` | List directories only | Fast directory enumeration |
| `search-files.ts` | Regex search | Context-rich results |
| `list-code-definition-names.ts` | Extract symbols | Class/function names |
| `display-diagram.ts` | Generate diagram | XML generation, validation |
| `append-diagram.ts` | Extend diagram | Incremental building |

### 6. System Prompts (`lib/prompts/system-prompt/`)

**Modular Prompt System:**
- `components/`: Role, objectives, rules, workflow
- `tools/`: Individual tool descriptions
- `index.ts`: Assembles complete system prompt

**Key Components:**
- Agent role definition
- Tool specifications
- Draw.io XML format reference
- Best practices and constraints

### 7. Context Management (`lib/context/`)

**Smart Context Window Management:**
- Token counting
- Message summarization
- Priority-based truncation
- Conversation history optimization

## Data Flow

### Diagram Generation Flow

```
User Request
    ↓
Select Diagram Type + Codebase Path
    ↓
Send to API (/api/analyze)
    ↓
AI Agent Loop:
    ├→ list_files_recursive (explore structure)
    ├→ read_file (read key files)
    ├→ search_files (find patterns)
    ├→ list_code_definition_names (extract symbols)
    └→ display_diagram (generate XML)
         ↓
         Check size limits
         ├→ If small: Return complete diagram
         └→ If large: Use append_diagram
              ├→ Generate 8-12 components
              ├→ append_diagram (add more)
              ├→ append_diagram (add more)
              └→ Continue until complete
    ↓
Return Diagram XML
    ↓
Update DiagramContext
    ↓
Render in Draw.io Viewer
```

### append_diagram Tool

**Purpose:** Solve AWS Bedrock input size limitations by splitting large diagrams

**Process:**
1. `display_diagram` creates initial diagram (8-12 components)
2. AI determines if more components needed
3. `append_diagram` adds next batch
4. XML validation ensures correctness
5. Repeat until complete

**Validation:**
- Unique ID checking
- Parent reference validation
- Complete mxCell tags
- XML structure integrity

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI components
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **react-drawio**: Diagram viewer integration

### Backend
- **Next.js API Routes**: Serverless functions
- **AWS SDK**: Direct Bedrock API integration with streaming
- **Anthropic SDK**: Message format compatibility
- **Custom Streaming**: Hand-crafted stream processing

### Infrastructure
- **Node.js 20+**: Runtime
- **Docker**: Containerization (optional)
- **Git**: Version control

## Deployment Options

### Local Development
```bash
npm install
cp .env.example .env.local
# Add API keys to .env.local
npm run dev
```

### Docker
```bash
docker-compose up
```

### Production
- Can be deployed to Vercel, AWS, or any Node.js host
- Environment variables required for AI providers
- No external database needed

## Security Considerations

1. **Path Validation**: All file paths validated before access
2. **API Key Protection**: Keys stored in environment variables
3. **SSRF Prevention**: URL validation for external requests
4. **Input Sanitization**: User inputs sanitized
5. **Rate Limiting**: Can be added via middleware

## Performance Optimizations

1. **Streaming Responses**: Real-time feedback to users
2. **Incremental Diagram Building**: append_diagram for large diagrams
3. **Context Window Management**: Smart truncation
4. **File System Caching**: Reduce redundant file reads
5. **Tool Result Memoization**: Cache repeated queries

## Extension Points

1. **New Tools**: Add to `lib/tools/handlers/`
2. **New Providers**: Add to `lib/core/providers/`
3. **Prompt Customization**: Modify `lib/prompts/system-prompt/`
4. **UI Enhancements**: Extend `app/page.tsx` and components
5. **Context Strategies**: Customize `lib/context/`

## Monitoring and Debugging

### Logging
- Tool execution logs
- AI provider responses
- Error traces
- Performance metrics (optional Langfuse integration)

### Development Tools
- TypeScript type checking
- Biome linter
- React DevTools
- Network inspection for streaming

## Future Enhancements

1. **Multi-file Editing**: Diagram-to-code synchronization
2. **Collaborative Editing**: Real-time multi-user support
3. **Version History**: Diagram snapshots
4. **Export Options**: PNG, SVG, PDF export
5. **Template Library**: Pre-built diagram templates
6. **Plugin System**: Third-party extensions
