"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Download, BookOpen, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { documentsApi } from "@/lib/api/documents"
import { dashboardApi } from "@/lib/api/dashboard"
import { useToast } from "@/hooks/use-toast"

export default function QuestionsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState<Array<{
    id: number
    title: string
    courseCode: string
    year: number
    description: string
  }>>([])

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
      q.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSubject && matchesYear && matchesSearch
  })

  const handleDownload = async (id: number, title: string) => {
    try {
      const blob = await dashboardApi.downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
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
    }
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
                  {question.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{question.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {question.completed && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-border">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  onClick={() => handleDownload(question.id, question.title)}
                >
                  <Download className="w-4 h-4" />
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
    </div>
  )
}
