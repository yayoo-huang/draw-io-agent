import type { Metadata } from "next"
import Link from "next/link"
import { FaGithub } from "react-icons/fa"

export const metadata: Metadata = {
    title: "关于 - Draw.io Agent",
    description:
        "AI驱动的代码架构图生成器 - 分析你的代码库并自动生成架构图",
    keywords: [
        "AI图表",
        "draw.io",
        "代码分析",
        "架构图",
        "系统设计",
        "LLM",
    ],
}

export default function AboutCN() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="text-xl font-bold text-gray-900 hover:text-gray-700"
                        >
                            Draw.io Agent
                        </Link>
                        <nav className="flex items-center gap-6 text-sm">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                编辑器
                            </Link>
                            <Link
                                href="/about/cn"
                                className="text-blue-600 font-semibold"
                            >
                                关于
                            </Link>
                            <a
                                href="https://github.com/your-repo/draw-io-agent"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                aria-label="在GitHub上查看"
                            >
                                <FaGithub className="w-5 h-5" />
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="prose prose-lg max-w-none">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Draw.io Agent
                        </h1>
                        <p className="text-xl text-gray-600 font-medium">
                            AI驱动的代码架构图生成器
                        </p>
                        <div className="flex justify-center gap-4 mt-4 text-sm">
                            <Link
                                href="/about"
                                className="text-gray-600 hover:text-blue-600"
                            >
                                English
                            </Link>
                            <span className="text-gray-400">|</span>
                            <Link
                                href="/about/cn"
                                className="text-blue-600 font-semibold"
                            >
                                中文
                            </Link>
                        </div>
                    </div>

                    <p className="text-gray-700">
                        Draw.io Agent 是一个智能工具，可以分析你的代码库并使用AI和Draw.io
                        自动生成专业的架构图。只需提供代码目录路径，让AI为你创建全面的系统架构可视化。
                    </p>

                    {/* Features */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        核心功能
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            <strong>AI智能代码分析</strong>：自动分析代码结构、依赖关系和
                            组件关联，生成准确的架构图
                        </li>
                        <li>
                            <strong>多种图表类型</strong>：支持系统架构、组件结构、数据流、
                            微服务、类图、API架构和数据库ER图等多种类型
                        </li>
                        <li>
                            <strong>大型图表支持</strong>：先进的append_diagram工具通过分批
                            生成处理复杂项目，突破AI调用大小限制
                        </li>
                        <li>
                            <strong>实时编辑</strong>：集成Draw.io编辑器，可即时可视化和手动
                            优化生成的图表
                        </li>
                        <li>
                            <strong>简洁工作流</strong>：绿色"New Diagram"按钮可快速清空并
                            开始新的图表生成
                        </li>
                        <li>
                            <strong>本地部署</strong>：自托管解决方案，无使用限制或API限制
                        </li>
                    </ul>

                    {/* How It Works */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        工作原理
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            应用使用先进的AI理解你的代码库：
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>
                                <strong>代码探索</strong>：AI代理使用工具列出文件、读取代码
                                并理解项目结构
                            </li>
                            <li>
                                <strong>智能分析</strong>：大语言模型分析代码模式、依赖关系
                                和架构关联
                            </li>
                            <li>
                                <strong>图表生成</strong>：AI生成带有正确组件、连接和布局的
                                Draw.io XML
                            </li>
                            <li>
                                <strong>增量构建</strong>：对于复杂项目，append_diagram工具
                                分批添加组件
                            </li>
                            <li>
                                <strong>交互式优化</strong>：与AI聊天以优化和增强生成的图表
                            </li>
                        </ol>
                    </div>

                    {/* Technology Stack */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        技术栈
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            <strong>Next.js 15</strong>：现代React框架，支持服务端组件
                        </li>
                        <li>
                            <strong>Vercel AI SDK</strong>：流式AI响应，支持多AI提供商
                        </li>
                        <li>
                            <strong>react-drawio</strong>：嵌入式Draw.io编辑器，用于图表操作
                        </li>
                        <li>
                            <strong>Tailwind CSS</strong>：现代样式系统，响应式设计
                        </li>
                        <li>
                            <strong>TypeScript</strong>：类型安全开发
                        </li>
                    </ul>

                    {/* AI Provider Support */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        支持的AI提供商
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Draw.io Agent支持多个AI提供商以提供灵活性：
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                <strong>AWS Bedrock</strong>（推荐）：Claude 3.5 Sonnet、
                                Claude 3 Opus、Claude 3 Haiku
                            </li>
                            <li>
                                <strong>OpenAI</strong>：GPT-4 Turbo、GPT-4、GPT-3.5 Turbo
                            </li>
                            <li>
                                <strong>自定义端点</strong>：任何OpenAI兼容的API
                            </li>
                        </ul>
                        <p className="mt-4">
                            在<code>.env.local</code>文件中使用你的API凭证配置首选提供商。
                        </p>
                    </div>

                    {/* append_diagram Tool */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        append_diagram 工具
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Draw.io Agent的关键创新是<code>append_diagram</code>工具，
                            它解决了AWS Bedrock的输入大小限制：
                        </p>
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">工作原理：</h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    <strong>初始生成</strong>：<code>display_diagram</code>
                                    创建包含8-12个核心组件的图表
                                </li>
                                <li>
                                    <strong>增量添加</strong>：<code>append_diagram</code>
                                    以8-12个组件为批次添加更多内容
                                </li>
                                <li>
                                    <strong>XML验证</strong>：确保mxCell标签完整、ID唯一且
                                    父级引用有效
                                </li>
                                <li>
                                    <strong>状态跟踪</strong>：在工具调用之间维护图表XML，
                                    实现无缝增量构建
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Getting Started */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        快速开始
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            使用Draw.io Agent的快速入门指南：
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>从下拉菜单中选择所需的图表类型</li>
                            <li>输入代码库目录路径</li>
                            <li>点击发送并观看AI分析你的代码</li>
                            <li>在Draw.io编辑器中查看生成的图表</li>
                            <li>与AI聊天以优化和增强图表</li>
                            <li>点击"New Diagram"开始新的分析</li>
                        </ol>
                    </div>

                    {/* Open Source */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        开源项目
                    </h2>
                    <p className="text-gray-700">
                        Draw.io Agent是开源项目，可在GitHub上获取。欢迎贡献、提出问题和功能请求！
                    </p>
                    <p className="text-gray-700 mt-2">
                        在{" "}
                        <a
                            href="https://github.com/your-repo/draw-io-agent"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            GitHub
                        </a>
                        {" "}上查看源代码和文档
                    </p>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/"
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            开始分析你的代码
                        </Link>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-600 text-sm">
                        Draw.io Agent - AI驱动的代码架构图生成器
                    </p>
                </div>
            </footer>
        </div>
    )
}
