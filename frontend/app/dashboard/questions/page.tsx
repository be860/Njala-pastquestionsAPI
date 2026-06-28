"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Download, BookOpen, ChevronRight, Loader2, Eye, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { documentsApi, type Document } from "@/lib/api/documents"
import { dashboardApi, saveDocumentBlob } from "@/lib/api/dashboard"
import { useToast } from "@/hooks/use-toast"

export default function QuestionsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Document[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    // Redirect non-students to their appropriate dashboard
    if (user.role === "SuperAdmin") {
      router.push("/superadmin/dashboard")
      return
    }
    if (user.role === "Admin") {
      router.push("/admin/dashboard")
      return
    }
    if (user.role !== "Student") {
      router.push("/login")
      return
    }

    const fetchQuestions = async () => {
      try {
        const data = await documentsApi.getAll(
          1,
          100,
          searchTerm || undefined,
          selectedSubject || undefined,
          selectedYear ? parseInt(selectedYear) : undefined
        )
        setQuestions(data.items)
      } catch (error: any) {
        // Don't show error if it's a 403 (forbidden) - user might be redirecting
        if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
          router.push("/login")
          return
        }
        toast({
          title: "Error",
          description: error.message || "Failed to load questions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [isAuthenticated, user, router, searchTerm, selectedSubject, selectedYear, toast])

  const subjects = Array.from(new Set(questions.map((q) => q.courseCode))).sort()
  const years = Array.from(new Set(questions.map((q) => q.year.toString()))).sort().reverse()

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = !selectedSubject || q.courseCode === selectedSubject
    const matchesYear = !selectedYear || q.year.toString() === selectedYear
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    return matchesSubject && matchesYear && matchesSearch
  })

  const handleDownload = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation()
    setDownloadingId(id)
    try {
      const blob = await dashboardApi.downloadDocument(id)
      const safeTitle = title.replace(/[<>:"/\\|?*]/g, "_").trim() || "document"
      saveDocumentBlob(blob, `${safeTitle}.pdf`)
      toast({
        title: "Download Started",
        description: "Your document is downloading",
      })
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleView = async (question: Document) => {
    setIsViewLoading(true)
    setViewingDoc(question)

    try {
      const fullDocument = await documentsApi.getById(question.id)
      setViewingDoc(fullDocument)
    } catch (error: any) {
      setViewingDoc(null)
      toast({
        title: "Unable to Load Document",
        description: error.message || "Failed to load document details",
        variant: "destructive",
      })
    } finally {
      setIsViewLoading(false)
    }
  }

  const closeViewer = () => {
    setViewingDoc(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50"
      case "Medium":
        return "text-yellow-600 bg-yellow-50"
      case "Hard":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">Past Questions</h2>
        <p className="text-muted-foreground">Browse and practice thousands of past exam questions</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8 animate-slide-up">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
            />
          </div>

          {/* Filter Button */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filters Active: {selectedSubject ? 1 : 0} + {selectedYear ? 1 : 0}
            </span>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Subject</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !selectedSubject
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSubject === subject
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <p className="text-sm font-medium mb-3">Year</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !selectedYear
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Years
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedYear === year
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              role="button"
              tabIndex={0}
              onClick={() => handleView(question)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleView(question)
                }
              }}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{question.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-muted-foreground">{question.courseCode}</span>
                    <span className="text-muted-foreground">{question.year}</span>
                  </div>
                  {question.summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{question.summary}</p>
                  )}
                  {!question.summary && question.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{question.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleView(question)
                    }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="View document"
                  >
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleView(question)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  <Link href={`/dashboard/ai-chat?documentId=${question.id}`}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask AI Tutor
                    </Button>
                  </Link>
                </div>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  disabled={downloadingId === question.id}
                  onClick={(e) => handleDownload(e, question.id, question.title)}
                >
                  {downloadingId === question.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No questions found matching your filters</p>
            <Button
              onClick={() => {
                setSelectedSubject(null)
                setSelectedYear(null)
                setSearchTerm("")
              }}
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && closeViewer()}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="min-w-0">
                <DialogTitle className="text-xl font-semibold">{viewingDoc?.title}</DialogTitle>
                {viewingDoc && (
                  <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                    <span>{viewingDoc.courseCode}</span>
                    <span>•</span>
                    <span>Year {viewingDoc.year}</span>
                    {viewingDoc.uploader && (
                      <>
                        <span>•</span>
                        <span>By {viewingDoc.uploader}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {isViewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {viewingDoc?.description && (
                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Description
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {viewingDoc.description}
                    </p>
                  </section>
                )}

                {viewingDoc?.summary && (
                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">
                      AI Summary
                    </h4>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {viewingDoc.summary}
                      </p>
                    </div>
                  </section>
                )}

                {!viewingDoc?.description && !viewingDoc?.summary && (
                  <p className="text-sm text-muted-foreground">No description available for this document.</p>
                )}
              </>
            )}
          </div>

          {viewingDoc && !isViewLoading && (
            <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end gap-2">
              <Link href={`/dashboard/ai-chat?documentId=${viewingDoc.id}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ask AI Tutor
                </Button>
              </Link>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                disabled={downloadingId === viewingDoc.id}
                onClick={(e) => handleDownload(e, viewingDoc.id, viewingDoc.title)}
              >
                {downloadingId === viewingDoc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
