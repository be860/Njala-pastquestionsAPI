"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader, Lightbulb, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { aiTutorApi } from "@/lib/api/aitutor"
import { useToast } from "@/hooks/use-toast"

export default function AIChatPage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI study assistant. I can help you understand difficult concepts, solve problems, and provide study tips. What would you like to learn today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiTutorApi.askQuestion(userMessage)
      setMessages((prev) => [...prev, { role: "assistant", content: response.answer }])
    } catch (error: any) {
      toast({
        title: "AI assistant unavailable",
        description: error?.message || "Unable to get a response right now. Please try again.",
        variant: "destructive",
      })
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your request right now. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "Explain photosynthesis",
    "How to solve quadratic equations",
    "Newton's Laws of Motion",
    "Study tips for exams",
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">AI Study Assistant</h2>
        <p className="text-muted-foreground">Ask me anything about your studies</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col mb-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 1 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Welcome to AI Assistant</h3>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Ask me questions about any subject and I'll provide detailed explanations to help you understand better.
              </p>
              <div className="w-full">
                <p className="text-sm font-medium text-muted-foreground mb-3">Try asking about:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex animate-slide-up ${message.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none border border-border"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none border border-border flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-muted/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Pro Tip:</p>
          <p className="text-sm text-blue-800">
            Be specific in your questions for better answers. For example, instead of "Help with math," try "Explain the
            quadratic formula."
          </p>
        </div>
      </div>
    </div>
  )
}
