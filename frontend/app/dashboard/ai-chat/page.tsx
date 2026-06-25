"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { aiTutorApi, type ChatMessageDto, type ChatSessionSummary } from "@/lib/api/aitutor"
import { useToast } from "@/hooks/use-toast"

const WELCOME_MESSAGE =
  "Hi! I'm your AI study assistant. I can help you understand difficult concepts, solve problems, and provide study tips. What would you like to learn today?"

const suggestedQuestions = [
  "Explain photosynthesis",
  "How to solve quadratic equations",
  "Newton's Laws of Motion",
  "Study tips for exams",
]

export default function AIChatPage() {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionsLoading, setIsSessionsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

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
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === session.id)
        const updated = exists
          ? prev.map((s) =>
              s.id === session.id ? { ...s, title: session.title, updatedAt: session.updatedAt } : s
            )
          : [
              {
                id: session.id,
                title: session.title,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
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
    const init = async () => {
      const data = await loadSessions()
      if (data.length > 0) {
        await loadSessionMessages(data[0].id)
      }
    }
    init()
  }, [loadSessions, loadSessionMessages])

  const handleNewChat = async () => {
    try {
      const session = await aiTutorApi.createSession()
      setSessions((prev) => [
        {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: 0,
        },
        ...prev,
      ])
      setActiveSessionId(session.id)
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    let sessionId = activeSessionId

    try {
      if (!sessionId) {
        const session = await aiTutorApi.createSession()
        sessionId = session.id
        setActiveSessionId(sessionId)
        setSessions((prev) => [
          {
            id: session.id,
            title: session.title,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
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

      const response = await aiTutorApi.sendMessage(sessionId, userMessage)

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
                  }
                : s
            )
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        )
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
              Ask questions and continue conversations across sessions
            </p>
          </div>
        </div>

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
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question..."
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
              <span className="font-medium">Pro tip:</span> Be specific in your questions. Each chat is saved as a
              session so you can return to it anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
