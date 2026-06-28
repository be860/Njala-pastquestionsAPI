"use client"

import type React from "react"
import { Suspense } from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Send,
  Loader2,
  Lightbulb,
  Zap,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  X,
  ChevronDown,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  aiTutorApi,
  type ChatMessageDto,
  type ChatSessionSummary,
  type ReferencedDocument,
} from "@/lib/api/aitutor"
import { documentsApi, type Document } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"

const WELCOME_MESSAGE =
  "Hi! I'm your AI study assistant. Ask me anything — or reference a past question document by name, like \"Can you help me take the key topics from the 2025 Computer Science past questions?\""

const suggestedQuestions = [
  "Can you summarize the key topics from a past paper?",
  "Explain photosynthesis",
  "How to solve quadratic equations",
  "Study tips for exams",
]

export default function AIChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AIChatContent />
    </Suspense>
  )
}

function AIChatContent() {
  const searchParams = useSearchParams()
  const initialDocumentId = searchParams.get("documentId")
    ? parseInt(searchParams.get("documentId")!, 10)
    : undefined

  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeDocumentId, setActiveDocumentId] = useState<number | undefined>(initialDocumentId)
  const [activeDocumentTitle, setActiveDocumentTitle] = useState<string | null>(null)
  const [lastReferencedDocument, setLastReferencedDocument] = useState<ReferencedDocument | null>(null)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionsLoading, setIsSessionsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [documentInitDone, setDocumentInitDone] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // States for document picker dropdown
  const [documents, setDocuments] = useState<Document[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [documentSearchQuery, setDocumentSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Fetch documents for the dropdown picker
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await documentsApi.getAll(1, 200)
        setDocuments(data.items || [])
      } catch (error: any) {
        console.error("Failed to load documents for picker:", error)
      }
    }
    fetchDocs()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredDocuments = documents.filter((doc) => {
    const search = documentSearchQuery.toLowerCase()
    return (
      doc.title.toLowerCase().includes(search) ||
      doc.courseCode.toLowerCase().includes(search) ||
      doc.year.toString().includes(search)
    )
  })

  const loadSessions = useCallback(async () => {
    setIsSessionsLoading(true)
    try {
      const data = await aiTutorApi.getSessions()
      setSessions(data)
      return data
    } catch (error: any) {
      toast({
        title: "Could not load chats",
        description: error?.message || "Failed to load your chat sessions.",
        variant: "destructive",
      })
      return []
    } finally {
      setIsSessionsLoading(false)
    }
  }, [toast])

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const session = await aiTutorApi.getSession(sessionId)
      setMessages(session.messages)
      setActiveSessionId(sessionId)
      setActiveDocumentId(session.documentId ?? undefined)
      setActiveDocumentTitle(session.documentTitle ?? null)
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === session.id)
        const updated = exists
          ? prev.map((s) =>
              s.id === session.id
                ? {
                    ...s,
                    title: session.title,
                    updatedAt: session.updatedAt,
                    documentId: session.documentId,
                    documentTitle: session.documentTitle,
                  }
                : s
            )
          : [
              {
                id: session.id,
                title: session.title,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                documentId: session.documentId,
                documentTitle: session.documentTitle,
                messageCount: session.messages.length,
              },
              ...prev,
            ]
        return updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      })
    } catch (error: any) {
      toast({
        title: "Could not load chat",
        description: error?.message || "Failed to load this conversation.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    if (documentInitDone) return

    const init = async () => {
      const data = await loadSessions()

      if (initialDocumentId && !documentInitDone) {
        try {
          const session = await aiTutorApi.createSession({ documentId: initialDocumentId })
          setSessions((prev) => [
            {
              id: session.id,
              title: session.title,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
              documentId: session.documentId,
              documentTitle: session.documentTitle,
              messageCount: 0,
            },
            ...prev.filter((s) => s.id !== session.id),
          ])
          setActiveSessionId(session.id)
          setActiveDocumentId(session.documentId ?? initialDocumentId)
          setActiveDocumentTitle(session.documentTitle ?? null)
          setMessages([])
          setInput(
            "Can you help me identify the key topics from this past question document?"
          )
        } catch (error: any) {
          toast({
            title: "Could not start document chat",
            description: error?.message || "Failed to create a chat for this document.",
            variant: "destructive",
          })
          if (data.length > 0) {
            await loadSessionMessages(data[0].id)
          }
        } finally {
          setDocumentInitDone(true)
        }
        return
      }

      if (data.length > 0) {
        await loadSessionMessages(data[0].id)
      }
      setDocumentInitDone(true)
    }

    init()
  }, [loadSessions, loadSessionMessages, initialDocumentId, documentInitDone, toast])

  const handleNewChat = async () => {
    try {
      const session = await aiTutorApi.createSession()
      setSessions((prev) => [
        {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          documentId: session.documentId,
          documentTitle: session.documentTitle,
          messageCount: 0,
        },
        ...prev,
      ])
      setActiveSessionId(session.id)
      setActiveDocumentId(undefined)
      setActiveDocumentTitle(null)
      setLastReferencedDocument(null)
      setMessages([])
      setInput("")
    } catch (error: any) {
      toast({
        title: "Could not start chat",
        description: error?.message || "Failed to create a new chat session.",
        variant: "destructive",
      })
    }
  }

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) return
    await loadSessionMessages(sessionId)
    setLastReferencedDocument(null)
  }

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    try {
      await aiTutorApi.deleteSession(sessionId)
      const remaining = sessions.filter((s) => s.id !== sessionId)
      setSessions(remaining)

      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          await loadSessionMessages(remaining[0].id)
        } else {
          setActiveSessionId(null)
          setActiveDocumentId(undefined)
          setActiveDocumentTitle(null)
          setMessages([])
        }
      }
    } catch (error: any) {
      toast({
        title: "Could not delete chat",
        description: error?.message || "Failed to delete this conversation.",
        variant: "destructive",
      })
    }
  }

  const clearDocumentContext = () => {
    setActiveDocumentId(undefined)
    setActiveDocumentTitle(null)
    setLastReferencedDocument(null)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    let sessionId = activeSessionId

    try {
      if (!sessionId) {
        const session = await aiTutorApi.createSession(
          activeDocumentId ? { documentId: activeDocumentId } : undefined
        )
        sessionId = session.id
        setActiveSessionId(sessionId)
        setActiveDocumentId(session.documentId ?? activeDocumentId)
        setActiveDocumentTitle(session.documentTitle ?? activeDocumentTitle)
        setSessions((prev) => [
          {
            id: session.id,
            title: session.title,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            documentId: session.documentId,
            documentTitle: session.documentTitle,
            messageCount: 0,
          },
          ...prev,
        ])
      }

      const optimisticUser: ChatMessageDto = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticUser])

      const response = await aiTutorApi.sendMessage(
        sessionId,
        userMessage,
        activeDocumentId
      )

      if (response.referencedDocument) {
        setLastReferencedDocument(response.referencedDocument)
        setActiveDocumentId(response.referencedDocument.id)
        setActiveDocumentTitle(response.referencedDocument.title)
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        {
          id: response.userMessage?.id || optimisticUser.id,
          role: "user",
          content: response.question,
          createdAt: response.userMessage?.createdAt || optimisticUser.createdAt,
        },
        {
          id: response.assistantMessage?.id || `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          createdAt: response.assistantMessage?.createdAt || new Date().toISOString(),
        },
      ])

      if (response.sessionTitle) {
        setSessions((prev) =>
          prev
            .map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    title: response.sessionTitle || s.title,
                    updatedAt: new Date().toISOString(),
                    messageCount: s.messageCount + 2,
                    documentId: response.referencedDocument?.id ?? s.documentId,
                    documentTitle: response.referencedDocument?.title ?? s.documentTitle,
                  }
                : s
            )
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        )

        if (response.referencedDocument) {
          setActiveDocumentTitle(response.referencedDocument.title)
        }
      }
    } catch (error: any) {
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-user-")))
      toast({
        title: "AI assistant unavailable",
        description: error?.message || "Unable to get a response right now. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  const showWelcome = messages.length === 0 && !isLoading
  const documentLabel = activeDocumentTitle || lastReferencedDocument?.title

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-background">
      {/* Sessions Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-full lg:w-72" : "w-0 lg:w-0"
        } shrink-0 border-r border-border bg-card transition-all overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Chat Sessions
          </h3>
          <Button size="sm" onClick={handleNewChat} className="h-8 gap-1.5">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isSessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">
              No conversations yet. Start a new chat to begin.
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectSession(session.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSelectSession(session.id)
                  }
                }}
                className={`w-full text-left rounded-lg px-3 py-2.5 flex items-start gap-2 group transition-colors cursor-pointer ${
                  activeSessionId === session.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  {session.documentTitle && (
                    <p className="text-xs text-primary truncate flex items-center gap-1 mt-0.5">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      {session.documentTitle}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {session.messageCount} message{session.messageCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                  aria-label="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Hide sessions" : "Show sessions"}
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">AI Study Assistant</h2>
            <p className="text-sm text-muted-foreground truncate">
              Ask about past question documents or any study topic
            </p>
          </div>
        </div>

        {documentLabel && (
          <div className="mx-4 sm:mx-6 mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate flex-1">
              <span className="text-muted-foreground">Document context: </span>
              <span className="font-medium">{documentLabel}</span>
            </span>
            <button
              type="button"
              onClick={clearDocumentContext}
              className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Clear document context"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {showWelcome && (
            <div className="max-w-2xl mx-auto text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Welcome to AI Assistant</h3>
              <p className="text-muted-foreground mb-6">{WELCOME_MESSAGE}</p>
              <p className="text-sm font-medium text-muted-foreground mb-3">Try asking about:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md border border-border"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-3 rounded-2xl rounded-bl-md border border-border flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-card p-4 sm:px-6">
          <div className="max-w-4xl mx-auto mb-3 flex items-center gap-2 relative" ref={dropdownRef}>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              Study Context:
            </span>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-normal border-dashed"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[200px] truncate">
                  {activeDocumentId
                    ? activeDocumentTitle || "Attached Document"
                    : "General AI Tutor (No document attached)"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg z-50 flex flex-col p-2 space-y-1.5 max-h-64 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search past questions..."
                      value={documentSearchQuery}
                      onChange={(e) => setDocumentSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-44 py-1 space-y-0.5 pr-1">
                    {activeDocumentId && (
                      <button
                        type="button"
                        onClick={() => {
                          clearDocumentContext()
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-destructive/10 hover:text-destructive text-destructive font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Clear attached document
                      </button>
                    )}
                    {filteredDocuments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        No documents found
                      </p>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setActiveDocumentId(doc.id)
                            setActiveDocumentTitle(doc.title)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left rounded-lg px-2.5 py-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex flex-col gap-0.5 ${
                            activeDocumentId === doc.id
                              ? "bg-primary/10 text-primary font-medium border border-primary/20"
                              : "border border-transparent"
                          }`}
                        >
                          <span className="font-semibold line-clamp-1">{doc.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {doc.courseCode} • {doc.year}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                documentLabel
                  ? `Ask about "${documentLabel}"...`
                  : "Ask a question or reference a past paper by name..."
              }
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 h-12 rounded-xl flex items-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>

          <div className="max-w-4xl mx-auto mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3 flex items-start gap-3">
            <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Pro tip:</span> Mention the document name and year in your
              question, or open a document from Past Questions and click &quot;Ask AI Tutor&quot;. Each chat
              is saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
