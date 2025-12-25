import type { Metadata } from "next"
import Link from "next/link"
import { FaGithub } from "react-icons/fa"

export const metadata: Metadata = {
    title: "About - Draw.io Agent",
    description:
        "AI-Powered Code Architecture Diagram Generator - Analyze your codebase and automatically generate architecture diagrams",
    keywords: [
        "AI diagram",
        "draw.io",
        "code analysis",
        "architecture diagram",
        "system design",
        "LLM",
    ],
}

export default function About() {
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
                                Editor
                            </Link>
                            <Link
                                href="/about"
                                className="text-blue-600 font-semibold"
                            >
                                About
                            </Link>
                            <a
                                href="https://github.com/your-repo/draw-io-agent"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                aria-label="View on GitHub"
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
                            AI-Powered Code Architecture Diagram Generator
                        </p>
                        <div className="flex justify-center gap-4 mt-4 text-sm">
                            <Link
                                href="/about"
                                className="text-blue-600 font-semibold"
                            >
                                English
                            </Link>
                            <span className="text-gray-400">|</span>
                            <Link
                                href="/about/cn"
                                className="text-gray-600 hover:text-blue-600"
                            >
                                中文
                            </Link>
                        </div>
                    </div>

                    <p className="text-gray-700">
                        Draw.io Agent is an intelligent tool that analyzes your codebase 
                        and automatically generates professional architecture diagrams using 
                        AI and Draw.io. Simply provide your code directory path, and let 
                        AI create comprehensive visualizations of your system architecture.
                    </p>

                    {/* Features */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        Key Features
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            <strong>AI-Powered Code Analysis</strong>: Automatically 
                            analyzes code structure, dependencies, and relationships 
                            to generate accurate architecture diagrams
                        </li>
                        <li>
                            <strong>Multiple Diagram Types</strong>: System Architecture, 
                            Component Structure, Data Flow, Microservices, Class Diagrams, 
                            API Architecture, and Database ER diagrams
                        </li>
                        <li>
                            <strong>Large Diagram Support</strong>: Advanced append_diagram 
                            tool handles complex projects by splitting generation across 
                            multiple AI calls, bypassing size limitations
                        </li>
                        <li>
                            <strong>Real-time Editing</strong>: Integrated Draw.io editor 
                            allows immediate visualization and manual refinement of 
                            generated diagrams
                        </li>
                        <li>
                            <strong>Clean Workflow</strong>: Green "New Diagram" button 
                            to quickly clear and start fresh diagram generation
                        </li>
                        <li>
                            <strong>Local Deployment</strong>: Self-hosted solution with 
                            no usage limits or API restrictions
                        </li>
                    </ul>

                    {/* How It Works */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        How It Works
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            The application uses advanced AI to understand your codebase:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>
                                <strong>Code Exploration</strong>: AI agent uses tools to 
                                list files, read code, and understand project structure
                            </li>
                            <li>
                                <strong>Intelligent Analysis</strong>: Large Language Models 
                                analyze code patterns, dependencies, and architectural relationships
                            </li>
                            <li>
                                <strong>Diagram Generation</strong>: AI generates Draw.io 
                                XML with proper components, connections, and layout
                            </li>
                            <li>
                                <strong>Incremental Building</strong>: For complex projects, 
                                the append_diagram tool adds components in batches
                            </li>
                            <li>
                                <strong>Interactive Refinement</strong>: Chat with AI to 
                                refine and enhance the generated diagram
                            </li>
                        </ol>
                    </div>

                    {/* Technology Stack */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        Technology Stack
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            <strong>Next.js 15</strong>: Modern React framework with 
                            server components
                        </li>
                        <li>
                            <strong>Vercel AI SDK</strong>: Streaming AI responses with 
                            multi-provider support
                        </li>
                        <li>
                            <strong>react-drawio</strong>: Embedded Draw.io editor for 
                            diagram manipulation
                        </li>
                        <li>
                            <strong>Tailwind CSS</strong>: Modern styling with responsive design
                        </li>
                        <li>
                            <strong>TypeScript</strong>: Type-safe development
                        </li>
                    </ul>

                    {/* AI Provider Support */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        Supported AI Providers
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Draw.io Agent supports multiple AI providers for flexibility:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                <strong>AWS Bedrock</strong> (Recommended): Claude 3.5 Sonnet, 
                                Claude 3 Opus, Claude 3 Haiku
                            </li>
                            <li>
                                <strong>OpenAI</strong>: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
                            </li>
                            <li>
                                <strong>Custom Endpoints</strong>: Any OpenAI-compatible API
                            </li>
                        </ul>
                        <p className="mt-4">
                            Configure your preferred provider in the <code>.env.local</code> file 
                            with your API credentials.
                        </p>
                    </div>

                    {/* append_diagram Tool */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        append_diagram Tool
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            A key innovation in Draw.io Agent is the <code>append_diagram</code> tool, 
                            which solves AWS Bedrock's input size limitations:
                        </p>
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">How it Works:</h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    <strong>Initial Generation</strong>: <code>display_diagram</code> creates 
                                    diagram with 8-12 core components
                                </li>
                                <li>
                                    <strong>Incremental Addition</strong>: <code>append_diagram</code> adds 
                                    more components in batches of 8-12
                                </li>
                                <li>
                                    <strong>XML Validation</strong>: Ensures mxCell tags are complete, 
                                    IDs are unique, and parent references are valid
                                </li>
                                <li>
                                    <strong>State Tracking</strong>: Maintains diagram XML between tool 
                                    calls for seamless incremental building
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Getting Started */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        Getting Started
                    </h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Quick start guide to use Draw.io Agent:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Select your desired diagram type from the dropdown</li>
                            <li>Enter your codebase directory path</li>
                            <li>Click send and watch AI analyze your code</li>
                            <li>View the generated diagram in the Draw.io editor</li>
                            <li>Chat with AI to refine and enhance the diagram</li>
                            <li>Click "New Diagram" to start a fresh analysis</li>
                        </ol>
                    </div>

                    {/* Open Source */}
                    <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
                        Open Source
                    </h2>
                    <p className="text-gray-700">
                        Draw.io Agent is open source and available on GitHub. Contributions, 
                        issues, and feature requests are welcome!
                    </p>
                    <p className="text-gray-700 mt-2">
                        View the source code and documentation on{" "}
                        <a
                            href="https://github.com/your-repo/draw-io-agent"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            GitHub
                        </a>
                    </p>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/"
                            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Start Analyzing Your Code
                        </Link>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-600 text-sm">
                        Draw.io Agent - AI-Powered Code Architecture Diagram Generator
                    </p>
                </div>
            </footer>
        </div>
    )
}
