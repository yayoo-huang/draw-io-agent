# Draw.io Agent - AI Code Architecture Analyzer

AI-powered agent that analyzes codebases and automatically generates Draw.io architecture diagrams.

## Features

- 🤖 **Multi-LLM Support**: AWS Bedrock (default), OpenAI, Anthropic, Google, Azure, and more
- 📊 **Auto Diagram Generation**: Analyzes code structure and creates architecture diagrams
- 🔄 **Real-time Streaming**: Live AI responses with SSE
- 📁 **Code Analysis**: Directory listing, file reading, pattern searching
- 🎨 **Simple UI**: Clean interface with single input field for codebase directory
- 🔒 **Secure**: SSRF protection, API key validation

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure (edit .env.local)
AI_PROVIDER=bedrock
AI_MODEL=anthropic.claude-sonnet-4-5-v2:0
AWS_REGION=us-west-2

# 3. Start the app
npm run dev

# 4. Open http://localhost:6002
```

## Usage

1. Open http://localhost:6002 in your browser
2. Enter your codebase directory path in the input field:
   ```
   /Users/username/Packages/PersonalProject/my-app
   ```
3. Click "Analyze" or press Enter
4. Watch the AI analyze your code and generate a diagram!

The interface shows:
- **Input field** with folder icon - Enter your codebase path here
- **Analysis messages** - Real-time progress as AI explores your code
- **Diagram viewer** - Interactive Draw.io diagram once analysis completes

## Project Structure

```
draw-io-agent/
├── app/
│   ├── page.tsx              # Simple UI with directory input
│   └── api/
│       └── analyze/
│           └── route.ts      # Streaming API endpoint
├── components/               # UI components
│   └── ui/                   # Shadcn components
├── lib/
│   ├── core/                 # LLM providers & streaming
│   │   ├── provider-config.ts
│   │   └── streaming-handler.ts
│   ├── tools/                # Code analysis tools
│   │   └── index.ts
│   └── types/                # TypeScript definitions
├── .env.local                # Configuration
└── package.json
```

## Configuration

### Default (AWS Bedrock)

```env
AI_PROVIDER=bedrock
AI_MODEL=anthropic.claude-sonnet-4-5-v2:0
AWS_REGION=us-west-2
```

### Other Providers

See `.env.example` for complete configuration options:
- Anthropic Claude
- OpenAI GPT
- Google Gemini
- Azure OpenAI
- OpenRouter
- DeepSeek
- Ollama (local)

## How It Works

1. **User enters directory path** - Simple input field at the top
2. **AI explores codebase** - Uses tools to list directories and read files
3. **Real-time updates** - See analysis progress as AI works
4. **Diagram generation** - AI creates Draw.io XML from architecture understanding
5. **Interactive viewer** - Explore the generated diagram

## API Endpoint

The `/api/analyze` endpoint accepts POST requests:

```typescript
POST /api/analyze
{
  "message": "Analyze /path/to/codebase"
}
```

Returns SSE stream with:
- `text` events - AI thinking and analysis
- `tool_call` events - Tool executions (list_directories, read_file, display_diagram)
- `done` event - Analysis complete

## Development

```bash
# Run development server (port 6002)
npm run dev

# Build for production
npm run build

# Start production server (port 6001)
npm start

# Lint code
npm run lint
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes (Node.js)
- **LLM**: AWS Bedrock, Anthropic, OpenAI APIs
- **Diagram**: react-drawio embedded viewer
- **Streaming**: Server-Sent Events (SSE)
- **UI Components**: Shadcn/ui (Radix UI primitives)

## Example Codebases to Analyze

Try analyzing these types of projects:
- React/Next.js applications
- Node.js backend services
- Python projects
- Multi-package monorepos
- Microservices architectures

## Troubleshooting

**Issue**: TypeScript errors after install
```bash
# Restart TypeScript server in VSCode
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

**Issue**: Port already in use
```bash
# Edit package.json to change port
"dev": "next dev --port 6002"  # Change to another port
```

**Issue**: AWS credentials not found
```bash
# Set AWS credentials in .env.local
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## License

MIT

---

**Note**: This agent is read-only and will not modify your code. It only analyzes and visualizes architecture.
