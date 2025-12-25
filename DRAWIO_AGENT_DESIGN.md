# Draw.io Agent 架构设计方案

## 项目目标

创建一个智能代码分析 Agent，能够：
1. 分析本地代码库（支持多个 packages）
2. 理解代码调用关系和系统架构
3. 根据用户需求自动生成 Draw.io 系统架构图
4. 提供类似 Cline 的交互体验（streaming + 实时思考过程展示）

## 核心特性

- ✅ **只读分析**：不修改代码，仅提供分析和可视化
- ✅ **多包支持**：可同时分析多个代码仓库
- ✅ **智能理解**：利用 LLM 理解代码结构、调用关系、依赖
- ✅ **实时交互**：Streaming 响应，显示 AI 思考过程
- ✅ **本地服务**：用户在本地启动服务，通过 Web UI 交互

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Web UI (React)                        │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Directory      │  │ Chat         │  │ Diagram         │ │
│  │ Input Panel    │  │ Interface    │  │ Viewer          │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/SSE (Streaming)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Node.js)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Task Orchestrator                         │ │
│  │  - Manages conversation state                          │ │
│  │  - Coordinates tool execution                          │ │
│  │  - Handles streaming responses                         │ │
│  └────────────┬───────────────────────────────────────────┘ │
│               │                                              │
│  ┌────────────┴───────────────┬────────────────────────┐   │
│  ▼                            ▼                        ▼   │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────┐   │
│  │ Code        │  │ LLM API          │  │ Diagram    │   │
│  │ Analyzer    │  │ Handler          │  │ Generator  │   │
│  │ Tools       │  │ (Anthropic/      │  │            │   │
│  │             │  │  OpenAI/etc)     │  │            │   │
│  └─────────────┘  └──────────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                     │                    │
         ▼                     ▼                    ▼
┌──────────────┐  ┌────────────────────┐  ┌────────────────┐
│ Local Code   │  │ LLM Provider       │  │ Draw.io XML    │
│ Repositories │  │ (Claude/GPT/etc)   │  │ Output         │
└──────────────┘  └────────────────────┘  └────────────────┘
```

---

## 技术栈选择

### Backend
- **Node.js + TypeScript**：与参考项目一致
- **Express/Fastify**：HTTP 服务器
- **Server-Sent Events (SSE)**：实现 streaming 响应

### Frontend
- **React + TypeScript**：UI 框架
- **TailwindCSS**：样式
- **Draw.io Viewer**：嵌入式图表查看器
- **EventSource API**：接收 SSE streaming

### LLM Integration
- **多提供商支持**：参考 next-ai-draw-io 的实现
  - **默认：AWS Bedrock**（使用 IAM role 或环境变量）
  - OpenAI、Anthropic、Google、Azure、OpenRouter、DeepSeek、SiliconFlow
  - Ollama（本地模型）、Vercel AI Gateway
- **配置方式**：
  - 服务端：通过环境变量配置默认提供商
  - 客户端：用户可在 UI 中选择提供商和模型，提供自己的 API Key
- **直接 HTTP 调用**：不使用 SDK，自己处理 streaming

---

## 核心组件设计

### 1. Code Analyzer Tools（代码分析工具集）

参考 Cline 的工具设计，但专注于只读分析：

```typescript
// 工具定义
enum CodeAnalyzerTool {
  LIST_DIRECTORIES = "list_directories",     // 列出目录结构
  READ_FILE = "read_file",                   // 读取文件内容
  SEARCH_CODE = "search_code",               // 正则搜索代码
  LIST_CODE_DEFINITIONS = "list_code_definitions", // 列出代码定义
  ANALYZE_DEPENDENCIES = "analyze_dependencies",   // 分析依赖关系
  FIND_IMPORTS = "find_imports",             // 查找导入/导出
  TRACE_FUNCTION_CALLS = "trace_function_calls",  // 追踪函数调用
}

// 工具规格示例
const tools = [
  {
    name: "list_directories",
    description: "List directory structure of the codebase. Use this to understand project organization.",
    parameters: {
      path: "Root directory path to list",
      recursive: "Whether to list recursively (default: true)",
      max_depth: "Maximum depth to traverse (default: 3)",
    }
  },
  {
    name: "read_file",
    description: "Read the contents of a specific file. Use this to understand implementation details.",
    parameters: {
      path: "File path to read",
    }
  },
  {
    name: "search_code",
    description: "Search for code patterns using regex. Use this to find specific implementations or usages.",
    parameters: {
      path: "Directory to search in",
      pattern: "Regex pattern to search for",
      file_extensions: "File extensions to include (e.g., ['.ts', '.js'])",
    }
  },
  {
    name: "list_code_definitions",
    description: "Extract code structure (classes, functions, exports) from files. Use this to understand code organization.",
    parameters: {
      path: "Directory or file path to analyze",
    }
  },
  {
    name: "analyze_dependencies",
    description: "Analyze package dependencies from package.json, requirements.txt, etc. Use this to understand external dependencies.",
    parameters: {
      path: "Project root directory",
    }
  },
  {
    name: "find_imports",
    description: "Find all import/export statements in a file or directory. Use this to understand module relationships.",
    parameters: {
      path: "File or directory path",
    }
  },
  {
    name: "trace_function_calls",
    description: "Trace function/method calls from a specific entry point. Use this to understand execution flow.",
    parameters: {
      file_path: "File containing the entry point",
      function_name: "Function/method name to trace from",
      max_depth: "Maximum call depth to trace (default: 3)",
    }
  }
]
```

### 2. Diagram Generator Tools（图表生成工具）

参考 next-ai-draw-io 的工具设计：

```typescript
enum DiagramTool {
  DISPLAY_DIAGRAM = "display_diagram",  // 生成新图表
  EDIT_DIAGRAM = "edit_diagram",        // 编辑现有图表
  APPEND_DIAGRAM = "append_diagram",    // 追加图表内容（长图表时）
}

const diagramTools = [
  {
    name: "display_diagram",
    description: "Generate a new Draw.io diagram in XML format. Use this after analyzing the codebase.",
    parameters: {
      xml: "Draw.io XML content (mxCell elements only, no wrapper tags)",
    }
  },
  {
    name: "edit_diagram",
    description: "Edit specific parts of the existing diagram. Use this for incremental updates.",
    parameters: {
      operations: "Array of {type: 'update'|'add'|'delete', cell_id: string, new_xml?: string}",
    }
  }
]
```

### 3. System Prompt Design（系统提示设计）

结合代码分析和图表生成的提示：

```markdown
You are a Code Architecture Visualization Agent. Your role is to:
1. Analyze codebases to understand system architecture
2. Identify components, modules, and their relationships
3. Generate clear Draw.io diagrams showing system architecture

## Available Tools

### Code Analysis Tools
- list_directories: Explore project structure
- read_file: Read source code files
- search_code: Find specific code patterns
- list_code_definitions: Extract code structure
- analyze_dependencies: Understand dependencies
- find_imports: Map module relationships
- trace_function_calls: Understand execution flow

### Diagram Tools
- display_diagram: Generate Draw.io XML for architecture diagrams
- edit_diagram: Update existing diagrams

## Workflow

1. **Understand the Request**: What aspect of the architecture does the user want to see?
2. **Explore the Codebase**: Use analysis tools to understand structure
3. **Identify Key Components**: Find main modules, services, APIs, data models
4. **Map Relationships**: Understand how components communicate
5. **Plan the Diagram**: Decide on layout (layers, flow, grouping)
6. **Generate XML**: Create Draw.io diagram showing the architecture

## Diagram Best Practices

- Use **layers** for different architectural tiers (Frontend, Backend, Database)
- Use **containers** (swimlanes) to group related components
- Use **arrows** to show data flow, API calls, dependencies
- Use **colors** to distinguish component types
- Keep **layout compact** (within 800x600 viewport)
- Add **labels** to explain relationships

## Example Architecture Patterns

### Microservices Architecture
- Show services as rounded rectangles
- Group by domain/bounded context
- Show API gateways, message queues
- Indicate async vs sync communication

### Layered Architecture
- Show layers horizontally (UI, Business Logic, Data Access)
- Show dependencies flowing downward
- Highlight cross-cutting concerns

### Component Architecture
- Show major components/modules
- Indicate interfaces/APIs between them
- Show external dependencies
```

### 4. Task Orchestrator（任务编排器）

参考 Cline 的 Task 类设计：

```typescript
class AnalysisTask {
  private taskId: string
  private state: TaskState
  private codebasePath: string
  private conversationHistory: Message[]
  private diagramXML: string | null
  
  // 核心流程
  async start(userMessage: string, codebases: string[]) {
    // 1. 初始化任务
    this.codebasePath = codebases[0] // 支持多个
    
    // 2. 执行 LLM 请求循环
    await this.recursiveAnalysisLoop([
      { role: "user", content: userMessage }
    ])
  }
  
  // 递归分析循环
  private async recursiveAnalysisLoop(messages: Message[]) {
    // 1. 准备上下文（当前图表、代码库信息）
    const context = await this.buildContext()
    
    // 2. 调用 LLM API（streaming）
    const stream = await this.callLLM(messages, context)
    
    // 3. 处理 streaming 响应
    for await (const chunk of stream) {
      if (chunk.type === "text") {
        await this.streamText(chunk.content)
      } else if (chunk.type === "tool_call") {
        // 4. 执行工具
        const result = await this.executeTool(chunk.tool)
        messages.push({ role: "assistant", content: chunk })
        messages.push({ role: "user", content: result })
        
        // 5. 继续循环
        await this.recursiveAnalysisLoop(messages)
      }
    }
  }
  
  // 执行工具
  private async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    switch (toolCall.name) {
      case "list_directories":
        return await this.listDirectories(toolCall.args)
      case "read_file":
        return await this.readFile(toolCall.args)
      case "display_diagram":
        this.diagramXML = toolCall.args.xml
        return { success: true }
      // ... 其他工具
    }
  }
}
```

### 5. LLM Provider Configuration（LLM 提供商配置）

参考 next-ai-draw-io 的多提供商支持实现：

```typescript
// 支持的提供商类型
type ProviderName =
  | "bedrock"      // AWS Bedrock (默认)
  | "openai"       // OpenAI
  | "anthropic"    // Anthropic
  | "google"       // Google Gemini
  | "azure"        // Azure OpenAI
  | "ollama"       // 本地 Ollama
  | "openrouter"   // OpenRouter
  | "deepseek"     // DeepSeek
  | "siliconflow"  // SiliconFlow
  | "gateway"      // Vercel AI Gateway

// 提供商配置接口
interface ProviderConfig {
  provider: ProviderName
  modelId: string
  apiKey?: string      // 客户端提供的 API Key
  baseUrl?: string     // 自定义端点
}

// 环境变量配置（服务端默认）
// AI_PROVIDER=bedrock (默认)
// AI_MODEL=anthropic.claude-sonnet-4-5-v2:0
// AWS_REGION=us-west-2
// AWS_ACCESS_KEY_ID=...
// AWS_SECRET_ACCESS_KEY=...

// 或其他提供商
// AI_PROVIDER=openai
// AI_MODEL=gpt-4o
// OPENAI_API_KEY=...

// 提供商管理器
class ProviderManager {
  // 获取默认提供商（服务端配置）
  getDefaultProvider(): ProviderConfig {
    const provider = process.env.AI_PROVIDER || "bedrock"
    const modelId = process.env.AI_MODEL
    
    if (!modelId) {
      throw new Error("AI_MODEL environment variable is required")
    }
    
    return { provider: provider as ProviderName, modelId }
  }
  
  // 验证客户端提供的配置
  validateClientConfig(config: ProviderConfig): boolean {
    // 安全检查：自定义 baseUrl 必须提供 API Key
    if (config.baseUrl && !config.apiKey) {
      throw new Error("API key required when using custom base URL")
    }
    
    // 只允许特定提供商接受客户端配置
    const allowedProviders = [
      "openai", "anthropic", "google", "azure",
      "openrouter", "deepseek", "siliconflow", "gateway"
    ]
    
    if (!allowedProviders.includes(config.provider)) {
      throw new Error(`Client configuration not allowed for ${config.provider}`)
    }
    
    return true
  }
  
  // 构建提供商特定的选项
  buildProviderOptions(provider: ProviderName, modelId: string) {
    // 根据不同提供商和模型构建特定选项
    // 例如：Bedrock Claude 使用 anthropicBeta
    // OpenAI o1/o3 使用 reasoningSummary
    // Google Gemini 2.5/3 使用 thinkingConfig
  }
}
```

**支持的提供商和环境变量：**

| 提供商 | 环境变量 | 默认端点 | 备注 |
|--------|---------|---------|------|
| Bedrock | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS Bedrock API | 使用 IAM role 或环境变量 |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_BASE_URL` (可选) | https://api.openai.com/v1 | 支持自定义端点 |
| Anthropic | `ANTHROPIC_API_KEY` | https://api.anthropic.com/v1 | 直接 API 访问 |
| Google | `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio | Gemini 模型 |
| Azure | `AZURE_API_KEY`, `AZURE_RESOURCE_NAME` 或 `AZURE_BASE_URL` | Azure OpenAI | 需要配置资源 |
| Ollama | `OLLAMA_BASE_URL` (可选) | http://localhost:11434 | 本地模型 |
| OpenRouter | `OPENROUTER_API_KEY` | https://openrouter.ai/api/v1 | 多模型聚合 |
| DeepSeek | `DEEPSEEK_API_KEY` | https://api.deepseek.com | DeepSeek 模型 |
| SiliconFlow | `SILICONFLOW_API_KEY` | https://api.siliconflow.com/v1 | 国内提供商 |
| Gateway | `AI_GATEWAY_API_KEY` | Vercel AI Gateway | 统一网关 |

### 6. Streaming Handler（流式处理器）

自己实现 streaming，不用 SDK：

```typescript
// LLM API Streaming Handler
class LLMStreamHandler {
  private provider: ProviderName
  private config: ProviderConfig
  
  constructor(provider: ProviderName, config: ProviderConfig) {
    this.provider = provider
    this.config = config
  }
  
  async streamRequest(
    messages: Message[],
    tools: Tool[],
    onChunk: (chunk: StreamChunk) => void
  ) {
    const url = this.getProviderURL()
    const headers = this.getProviderHeaders()
    const body = this.formatRequest(messages, tools)
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API request failed: ${error}`)
    }
    
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || "" // 保留不完整的行
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") continue
          
          try {
            const parsed = JSON.parse(data)
            const chunk = this.parseChunk(parsed)
            if (chunk) onChunk(chunk)
          } catch (e) {
            console.warn("Failed to parse chunk:", data)
          }
        }
      }
    }
  }
  
  private getProviderURL(): string {
    // 客户端自定义端点优先
    if (this.config.baseUrl) {
      return this.config.baseUrl
    }
    
    // 服务端默认端点
    switch (this.provider) {
      case "bedrock":
        const region = process.env.AWS_REGION || "us-west-2"
        return `https://bedrock-runtime.${region}.amazonaws.com/model/${this.config.modelId}/invoke-with-response-stream`
      case "openai":
        return process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions"
      case "anthropic":
        return "https://api.anthropic.com/v1/messages"
      case "google":
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.config.modelId}:streamGenerateContent`
      // ... 其他提供商
      default:
        throw new Error(`Unknown provider: ${this.provider}`)
    }
  }
  
  private getProviderHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // 使用客户端 API Key（如果提供）或服务端默认
    const apiKey = this.config.apiKey || this.getDefaultApiKey()
    
    switch (this.provider) {
      case "openai":
      case "openrouter":
      case "deepseek":
      case "siliconflow":
        headers["Authorization"] = `Bearer ${apiKey}`
        break
      case "anthropic":
        headers["x-api-key"] = apiKey
        headers["anthropic-version"] = "2023-06-01"
        break
      case "google":
        headers["x-goog-api-key"] = apiKey
        break
      case "bedrock":
        // Bedrock 使用 AWS Signature V4，需要特殊处理
        // 使用 AWS SDK 或实现签名逻辑
        break
    }
    
    return headers
  }
  
  private formatRequest(messages: Message[], tools: Tool[]): any {
    // 根据不同提供商格式化请求
    switch (this.provider) {
      case "anthropic":
      case "bedrock": // Bedrock Claude 使用相同格式
        return {
          model: this.config.modelId,
          messages: this.formatAnthropicMessages(messages),
          tools: this.formatAnthropicTools(tools),
          max_tokens: 4096,
          stream: true,
        }
      case "openai":
        return {
          model: this.config.modelId,
          messages: this.formatOpenAIMessages(messages),
          tools: this.formatOpenAITools(tools),
          stream: true,
        }
      // ... 其他提供商
    }
  }
  
  private parseChunk(data: any): StreamChunk | null {
    // 解析不同提供商的响应格式
    switch (this.provider) {
      case "anthropic":
      case "bedrock":
        return this.parseAnthropicChunk(data)
      case "openai":
        return this.parseOpenAIChunk(data)
      // ... 其他提供商
    }
    return null
  }
  
  private parseAnthropicChunk(data: any): StreamChunk | null {
    switch (data.type) {
      case "content_block_start":
        if (data.content_block.type === "thinking") {
          return { type: "reasoning", content: "" }
        }
        break
      case "content_block_delta":
        if (data.delta.type === "text_delta") {
          return { type: "text", content: data.delta.text }
        } else if (data.delta.type === "thinking_delta") {
          return { type: "reasoning", content: data.delta.thinking }
        } else if (data.delta.type === "input_json_delta") {
          return { type: "tool_call_delta", content: data.delta.partial_json }
        }
        break
      case "message_delta":
        if (data.usage) {
          return { 
            type: "usage", 
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens 
          }
        }
        break
    }
    return null
  }
  
  private parseOpenAIChunk(data: any): StreamChunk | null {
    const choice = data.choices?.[0]
    if (!choice) return null
    
    if (choice.delta?.content) {
      return { type: "text", content: choice.delta.content }
    }
    
    if (choice.delta?.tool_calls) {
      return { 
        type: "tool_call", 
        toolCall: choice.delta.tool_calls[0] 
      }
    }
    
    return null
  }
  
  private getDefaultApiKey(): string {
    switch (this.provider) {
      case "openai":
        return process.env.OPENAI_API_KEY!
      case "anthropic":
        return process.env.ANTHROPIC_API_KEY!
      case "google":
        return process.env.GOOGLE_GENERATIVE_AI_API_KEY!
      // ... 其他提供商
      default:
        throw new Error(`No default API key for ${this.provider}`)
    }
  }
}
```

---

## API 设计

### 1. 启动分析任务

```http
POST /api/analyze
Content-Type: application/json

{
  "message": "Please analyze this codebase and show me the architecture",
  "codebases": [
    "/Users/user/project1",
    "/Users/user/project2"
  ],
  "diagramType": "system_architecture" // 可选
}

Response (SSE Streaming):
event: thinking
data: {"text": "Analyzing project structure..."}

event: tool_call
data: {"tool": "list_directories", "args": {...}}

event: tool_result
data: {"result": "..."}

event: diagram
data: {"xml": "<mxCell...>"}

event: done
data: {"taskId": "abc123"}
```

### 2. 继续对话

```http
POST /api/analyze/:taskId/continue
Content-Type: application/json

{
  "message": "Can you add the database layer?"
}

Response: (Same SSE format)
```

### 3. 获取任务历史

```http
GET /api/analyze/:taskId/history

Response:
{
  "taskId": "abc123",
  "messages": [...],
  "diagram": "<xml>...</xml>",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## UI 设计

### 布局

```
┌─────────────────────────────────────────────────────────┐
│  Header: Draw.io Architecture Agent                     │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│  Left Sidebar    │       Main Content Area              │
│                  │                                       │
│  ┌────────────┐  │  ┌─────────────────────────────┐    │
│  │ Codebase   │  │  │                             │    │
│  │ Selector   │  │  │    Draw.io Diagram Viewer   │    │
│  │            │  │  │                             │    │
│  │ [Browse]   │  │  │                             │    │
│  │            │  │  └─────────────────────────────┘    │
│  │ Project 1  │  │                                       │
│  │ Project 2  │  │  ┌─────────────────────────────┐    │
│  │            │  │  │                             │    │
│  └────────────┘  │  │    Chat Interface           │    │
│                  │  │                             │    │
│  ┌────────────┐  │  │  [User]: Show me the arch   │    │
│  │ History    │  │  │                             │    │
│  │            │  │  │  [AI]: 🤔 Analyzing...      │    │
│  │ Task 1     │  │  │  [AI]: 🔧 Using tool...     │    │
│  │ Task 2     │  │  │  [AI]: 📊 Here's the arch   │    │
│  │            │  │  │                             │    │
│  └────────────┘  │  │  [User Input Area]          │    │
│                  │  └─────────────────────────────┘    │
└──────────────────┴──────────────────────────────────────┘
```

### 关键 UI 组件

1. **Codebase Selector**: 选择要分析的代码库路径
2. **Chat Interface**: 类似 Cline 的对话界面
   - 显示用户消息
   - 显示 AI thinking 过程（实时 streaming）
   - 显示工具调用（折叠/展开详情）
3. **Diagram Viewer**: 嵌入 Draw.io 查看器
   - 实时更新图表
   - 支持缩放、平移
   - 导出功能（PNG, SVG, XML）
4. **History Panel**: 历史任务列表

---

## 实现步骤

### Phase 1: 基础架构（Week 1）
- [ ] 搭建 Node.js backend 项目结构
- [ ] 实现基础 HTTP 服务器 + SSE 支持
- [ ] 实现 LLM API 调用和 streaming 解析（Claude/OpenAI）
- [ ] 搭建 React frontend 项目
- [ ] 实现基础 UI 布局和路由

### Phase 2: 代码分析工具（Week 2）
- [ ] 实现 `list_directories` 工具
- [ ] 实现 `read_file` 工具
- [ ] 实现 `search_code` 工具（使用 ripgrep 或类似）
- [ ] 实现 `list_code_definitions` 工具（使用 tree-sitter 解析）
- [ ] 实现 `analyze_dependencies` 工具

### Phase 3: 图表生成（Week 3）
- [ ] 集成 Draw.io 查看器到 UI
- [ ] 实现 `display_diagram` 工具
- [ ] 实现 `edit_diagram` 工具
- [ ] 设计和优化 System Prompt
- [ ] 测试完整的分析 -> 生成图表流程

### Phase 4: 交互优化（Week 4）
- [ ] 实现实时 streaming UI 更新
- [ ] 添加 thinking 过程可视化
- [ ] 添加工具调用详情展示
- [ ] 实现任务历史保存和加载
- [ ] 优化错误处理和重试逻辑

### Phase 5: 高级功能（Week 5+）
- [ ] 支持多个代码库同时分析
- [ ] 实现更智能的调用追踪
- [ ] 添加图表模板（微服务、分层架构等）
- [ ] 支持自定义分析深度和范围
- [ ] 添加导出和分享功能

---

## 关键技术决策

### 1. 为什么不用 SDK？
参考 Cline 的方式，直接处理 HTTP streaming：
- **更灵活**：完全控制请求和响应格式
- **更透明**：清楚了解 LLM API 的工作原理
- **更轻量**：不依赖庞大的 SDK
- **更统一**：所有提供商用相同的抽象层

### 2. 如何实现高质量的代码分析？
- 使用 **tree-sitter** 进行准确的代码解析
- 使用 **ripgrep** 进行快速代码搜索
- 结合 **静态分析** 和 **LLM 理解**
- 提供 **多层次分析**（文件 → 函数 → 调用链）

### 3. 如何生成高质量的架构图？
- 使用 **分步骤规划**：先理解，后布局，再生成
- 参考 **next-ai-draw-io 的 prompt**：详细的 XML 生成指导
- 提供 **图表模板**：常见架构模式的预设
- 支持 **迭代优化**：用户可以要求调整

### 4. 如何处理大型代码库？
- **智能采样**：只分析关键文件
- **增量分析**：先总览，再深入
- **上下文管理**：参考 Cline 的 context window 管理
- **缓存机制**：缓存文件结构和依赖分析结果

---

## 示例交互流程

```
User: "分析 /Users/user/my-app 并生成系统架构图"

AI: 🤔 理解任务：分析代码库并生成架构图
    让我先探索项目结构...

[Tool] list_directories(/Users/user/my-app)
Result: 
  - src/
    - frontend/
    - backend/
    - shared/
  - package.json
  - README.md

AI: 📊 发现这是一个前后端分离的项目
    让我查看主要的依赖...

[Tool] analyze_dependencies(/Users/user/my-app)
Result:
  Frontend: React, Redux, Axios
  Backend: Express, Prisma, PostgreSQL

AI: 🔍 让我查看后端的 API 路由...

[Tool] search_code(path: "backend", pattern: "app\\.(get|post|put|delete)")
Result: Found 15 API endpoints in 3 route files

AI: 💡 规划架构图：
    - 3 层结构：Frontend, Backend, Database
    - Frontend 使用 React + Redux
    - Backend 提供 REST API
    - 使用 PostgreSQL 数据库

[Tool] display_diagram(xml: "<mxCell...>")

AI: ✅ 已生成系统架构图！
    图表显示了主要组件及其交互关系。
    您可以要求我添加更多细节或调整布局。
```

---

## 下一步行动

1. **创建项目仓库**：初始化 monorepo 结构（backend + frontend）
2. **搭建基础框架**：Express backend + React frontend
3. **实现核心工具**：优先实现 5 个最重要的代码分析工具
4. **集成 LLM**：实现 Claude API streaming 调用
5. **验证 POC**：用一个简单的项目测试完整流程

---

## 参考资源

- **Cline 源码**：`/Users/yayhuang/Packages/PersonalProject/cline`
  - 学习工具设计、streaming 处理、任务编排
- **next-ai-draw-io 源码**：`/Users/yayhuang/Packages/PersonalProject/aiDrawio/next-ai-draw-io-origin-version`
  - 学习 Draw.io XML 生成、System Prompt、图表工具
- **tree-sitter**：代码解析库
- **ripgrep**：快速代码搜索
- **Draw.io Editor**：图表编辑器 API
