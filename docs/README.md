# Draw.io Agent - AI-Powered Architecture Diagram Generator

An intelligent tool that analyzes your codebase and automatically generates architecture diagrams using AI and Draw.io.

## Features

✅ **AI-Powered Analysis** - Automatically analyzes code structure and generates diagrams
✅ **Multiple Diagram Types** - System Architecture, Component Structure, Data Flow, Microservices, Class Diagrams, API Architecture, Database ER
✅ **Real-time Editing** - Integrated Draw.io editor for immediate visualization and editing
✅ **Large Diagram Support** - `append_diagram` tool handles AWS Bedrock input size limits by splitting diagram generation across multiple tool calls
✅ **Clean Interface** - Minimalist design focusing on core functionality

## Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- AWS Bedrock access (or OpenAI API key)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd draw-io-agent
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
# AWS Bedrock (recommended)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# OR OpenAI
OPENAI_API_KEY=your_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Select Diagram Type** - Choose from System Architecture, Component Structure, Data Flow, etc.
2. **Enter Codebase Path** - Provide the full path to your code directory
3. **Generate** - Click send and wait for the AI to analyze and create your diagram
4. **Edit** - Use the integrated Draw.io editor to refine the diagram
5. **New Diagram** - Click the green "New Diagram" button to start fresh

## Architecture

### Key Components

- **Frontend** (`app/page.tsx`) - Main UI with Draw.io embed and chat interface
- **API** (`app/api/analyze/route.ts`) - Core endpoint handling AI analysis and diagram generation
- **Tools** (`lib/tools/handlers/`) - Tool handlers for code analysis
  - `display_diagram.ts` - Initial diagram generation (8-12 components)
  - `append_diagram.ts` - Append additional components for large diagrams
  - `read-file.ts`, `list-files-recursive.ts`, `list-directories.ts`, etc.
- **Context Management** (`lib/context/`) - Smart context window management
- **AI Providers** (`lib/core/providers/`) - Support for Bedrock and OpenAI

### append_diagram Tool

The `append_diagram` tool solves AWS Bedrock's input size limitations:

1. **Initial Generation**: `display_diagram` creates diagram with 8-12 components
2. **Incremental Addition**: `append_diagram` adds more components in batches
3. **XML Validation**: Ensures mxCell tags are complete and IDs are unique
4. **State Tracking**: Maintains diagram XML between tool calls

## Supported AI Providers

- **AWS Bedrock** (Recommended)
  - Claude 3.5 Sonnet
  - Claude 3 Opus
  - Claude 3 Haiku

- **OpenAI**
  - GPT-4 Turbo
  - GPT-4
  - GPT-3.5 Turbo

See [docs/ai-providers.md](./ai-providers.md) for detailed configuration.

## Project Structure

```
draw-io-agent/
├── app/
│   ├── page.tsx           # Main UI
│   └── api/
│       └── analyze/       # Core API endpoint
├── lib/
│   ├── tools/             # Tool handlers
│   ├── prompts/           # System prompts
│   ├── context/           # Context management
│   └── core/              # AI providers
├── components/ui/         # UI components
└── contexts/              # React contexts
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

## Environment Variables

Required:
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (for Bedrock)
- OR `OPENAI_API_KEY` (for OpenAI)

Optional:
- `NEXT_PUBLIC_DRAWIO_BASE_URL` - Custom Draw.io instance (default: https://embed.diagrams.net)
- `LANGFUSE_SECRET_KEY` / `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_HOST` - Analytics tracking

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
