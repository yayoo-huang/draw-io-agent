# Draw.io Agent - AI驱动的架构图生成器

一个智能工具，可以分析你的代码库并使用AI和Draw.io自动生成架构图。

## 功能特性

✅ **AI智能分析** - 自动分析代码结构并生成图表
✅ **多种图表类型** - 系统架构、组件结构、数据流、微服务、类图、API架构、数据库ER图
✅ **实时编辑** - 集成Draw.io编辑器，可即时可视化和编辑
✅ **大型图表支持** - `append_diagram`工具通过将图表生成分割为多次工具调用来处理AWS Bedrock输入大小限制
✅ **简洁界面** - 专注于核心功能的极简设计

## 快速开始

### 前置要求

- Node.js 20.9.0 或更高版本
- AWS Bedrock访问权限（或OpenAI API密钥）

### 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd draw-io-agent
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local` 并添加你的凭证：
```env
# AWS Bedrock（推荐）
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=你的访问密钥
AWS_SECRET_ACCESS_KEY=你的秘密密钥

# 或者使用 OpenAI
OPENAI_API_KEY=你的API密钥
```

4. 运行开发服务器
```bash
npm run dev
```

5. 打开 [http://localhost:3000](http://localhost:3000)

## 使用方法

1. **选择图表类型** - 从系统架构、组件结构、数据流等类型中选择
2. **输入代码库路径** - 提供代码目录的完整路径
3. **生成** - 点击发送，等待AI分析并创建图表
4. **编辑** - 使用集成的Draw.io编辑器优化图表
5. **新建图表** - 点击绿色的"New Diagram"按钮开始新的图表

## 架构设计

### 核心组件

- **前端** (`app/page.tsx`) - 主UI界面，包含Draw.io嵌入和聊天界面
- **API** (`app/api/analyze/route.ts`) - 核心端点，处理AI分析和图表生成
- **工具** (`lib/tools/handlers/`) - 代码分析工具处理器
  - `display_diagram.ts` - 初始图表生成（8-12个组件）
  - `append_diagram.ts` - 为大型图表追加额外组件
  - `read-file.ts`, `list-files-recursive.ts`, `list-directories.ts` 等
- **上下文管理** (`lib/context/`) - 智能上下文窗口管理
- **AI提供商** (`lib/core/providers/`) - 支持Bedrock和OpenAI

### append_diagram 工具

`append_diagram`工具解决了AWS Bedrock的输入大小限制：

1. **初始生成**：`display_diagram`创建包含8-12个组件的图表
2. **增量添加**：`append_diagram`分批添加更多组件
3. **XML验证**：确保mxCell标签完整且ID唯一
4. **状态跟踪**：在工具调用之间维护图表XML

## 支持的AI提供商

- **AWS Bedrock**（推荐）
  - Claude 3.5 Sonnet
  - Claude 3 Opus
  - Claude 3 Haiku

- **OpenAI**
  - GPT-4 Turbo
  - GPT-4
  - GPT-3.5 Turbo

详细配置请参考 [docs/ai-providers.md](./ai-providers.md)

## 项目结构

```
draw-io-agent/
├── app/
│   ├── page.tsx           # 主界面
│   └── api/
│       └── analyze/       # 核心API端点
├── lib/
│   ├── tools/             # 工具处理器
│   ├── prompts/           # 系统提示
│   ├── context/           # 上下文管理
│   └── core/              # AI提供商
├── components/ui/         # UI组件
└── contexts/              # React上下文
```

## 开发

```bash
# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npx tsc --noEmit
```

## 环境变量

必需：
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`（用于Bedrock）
- 或 `OPENAI_API_KEY`（用于OpenAI）

可选：
- `NEXT_PUBLIC_DRAWIO_BASE_URL` - 自定义Draw.io实例（默认：https://embed.diagrams.net）
- `LANGFUSE_SECRET_KEY` / `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_HOST` - 分析追踪

## 许可证

MIT License - 详见LICENSE文件

## 贡献

欢迎贡献！请随时提交Pull Request。
