"use client"
import { useState } from "react"
import { DrawIoEmbed } from "react-drawio"
import { Loader2, FolderOpen, Send, FileX, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useDiagram } from "@/contexts/diagram-context"
import { STORAGE_KEYS } from "@/lib/storage"
import { SaveDialog } from "@/components/save-dialog"

const drawioBaseUrl = process.env.NEXT_PUBLIC_DRAWIO_BASE_URL || "https://embed.diagrams.net"

export default function Home() {
  const { 
    drawioRef, 
    loadDiagram, 
    onDrawioLoad, 
    handleDiagramExport, 
    clearDiagram,
    saveDiagramToFile,
    showSaveDialog,
    setShowSaveDialog,
    chartXML,
  } = useDiagram()
  const [directory, setDirectory] = useState("")
  const [diagramType, setDiagramType] = useState("system-architecture")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])

  const handleNewDiagram = () => {
    // Clear diagram canvas
    clearDiagram()
    
    // Clear chat messages
    setMessages([])
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.messages)
    localStorage.removeItem(STORAGE_KEYS.xmlSnapshots)
    localStorage.removeItem(STORAGE_KEYS.diagramXml)
    localStorage.removeItem(STORAGE_KEYS.sessionId)
    
    console.log("🆕 New diagram created - all states cleared")
  }

  const handleAnalyze = async () => {
    if (!directory.trim()) return

    // Create better user message based on diagram type
    const diagramTypeNames: Record<string, string> = {
      "system-architecture": "System Architecture diagram",
      "component-structure": "Component Structure diagram",
      "data-flow": "Data Flow diagram",
      "microservices": "Microservices Architecture diagram",
      "class-diagram": "Class diagram",
      "api-architecture": "API Architecture diagram",
      "database-er": "Database ER diagram",
    }
    
    const diagramTypeName = diagramTypeNames[diagramType] || "architecture diagram"
    const userMessage = `Generate ${diagramTypeName} for ${directory}`

    setIsAnalyzing(true)
    setMessages([{ role: "user", content: userMessage }])
    
    let currentAssistantMessage = ""
    let isStreamingText = false

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          diagramType 
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response stream")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const events = chunk.split("\n\n").filter(e => e.trim())

        for (const event of events) {
          const lines = event.split("\n")
          let eventType = ""
          let eventData = ""
          
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7)
            } else if (line.startsWith("data: ")) {
              eventData = line.slice(6)
            }
          }
          
          if (!eventData) continue
          
          try {
            const data = JSON.parse(eventData)
            
            console.log("Received event:", eventType, data)
            
            if (data.type === "text" || eventType === "text") {
              // Accumulate text in current message
              const textContent = data.content || data.text || ""
              currentAssistantMessage += textContent
              
              if (isStreamingText) {
                // Update last message
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: currentAssistantMessage
                  }
                  return newMessages
                })
              } else {
                // Start new message
                isStreamingText = true
                setMessages(prev => [...prev, { role: "assistant", content: currentAssistantMessage }])
              }
            } else if (data.type === "tool_call" || eventType === "tool_call") {
              // Finish current text message if streaming
              if (isStreamingText) {
                currentAssistantMessage = ""
                isStreamingText = false
              }
              
              // Show tool call info
              setMessages(prev => [...prev, { 
                role: "assistant", 
                content: `🔧 Using tool: ${data.toolCall?.name}` 
              }])
            } else if (eventType === "tool_result") {
              setMessages(prev => [...prev, { 
                role: "assistant", 
                content: `📝 Result:\n${data.result?.substring(0, 200)}${data.result?.length > 200 ? '...' : ''}` 
              }])
            } else if (eventType === "diagram") {
              // New diagram event from backend handler - use loadDiagram which handles validation
              if (data.xml) {
                console.log("Loading diagram from backend, XML length:", data.xml.length)
                // Skip validation for backend-generated XML (it's already validated)
                loadDiagram(data.xml, true)
                setMessages(prev => [...prev, { role: "assistant", content: "✅ Diagram generated!" }])
              }
            }
          } catch (e) {
            console.error("Parse error:", e)
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "error", content: `Error: ${error}` }])
    } finally {
      setIsAnalyzing(false)
    }
  }


  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Draw.io Canvas */}
        <ResizablePanel defaultSize={67} minSize={30}>
          <div className="h-full p-2">
            <div className="h-full rounded-xl overflow-hidden shadow-lg border border-border/30">
              <DrawIoEmbed
                ref={drawioRef}
                onLoad={onDrawioLoad}
                onExport={handleDiagramExport}
                onSave={() => setShowSaveDialog(true)}
                baseUrl={drawioBaseUrl}
                urlParameters={{
                  ui: "min",
                  spin: true,
                  libraries: false,
                  saveAndExit: false,
                  noExitBtn: true,
                  noSaveBtn: false,
                }}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Chat Interface */}
        <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
          <div className="h-full flex flex-col p-2">
            <div className="flex-1 flex flex-col bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Code Architecture Analyzer</h2>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleNewDiagram}
                    disabled={isAnalyzing}
                    className="h-8 px-2 gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FileX className="h-3.5 w-3.5" />
                    <span className="text-xs">New Diagram</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Analyze codebase and generate diagrams</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        Select diagram type and enter your codebase path to start
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-8"
                          : msg.role === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted mr-8"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border space-y-3">
                {/* Diagram Type Selector */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Diagram Type
                  </label>
                  <select
                    value={diagramType}
                    onChange={(e) => setDiagramType(e.target.value)}
                    disabled={isAnalyzing}
                    className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="system-architecture">🏗️ System Architecture</option>
                    <option value="component-structure">📦 Component Structure</option>
                    <option value="data-flow">🔄 Data Flow</option>
                    <option value="microservices">🔌 Microservices</option>
                    <option value="class-diagram">📋 Class Diagram</option>
                    <option value="api-architecture">🌐 API Architecture</option>
                    <option value="database-er">🗄️ Database ER</option>
                  </select>
                </div>

                {/* Directory Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FolderOpen className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="/path/to/codebase"
                      value={directory}
                      onChange={(e) => setDirectory(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isAnalyzing && handleAnalyze()}
                      disabled={isAnalyzing}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!directory.trim() || isAnalyzing}
                    size="sm"
                    className="px-3"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Save Dialog */}
      <SaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={(filename, format) => saveDiagramToFile(filename, format)}
        defaultFilename={`diagram-${new Date().toISOString().slice(0, 10)}`}
      />
    </div>
  )
}
