"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Trash2, RefreshCw, Eye, Loader2, Plus, Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { documentsApi } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { UploadDocumentModal } from "../dashboard/UploadDocumentModal"

export default function AdminDocuments() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [documents, setDocuments] = useState<Array<{
    id: number
    title: string
    courseCode: string
    year: number
    uploadDate: string
    summary?: string
    description: string
  }>>([])

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "Admin" && user?.role !== "SuperAdmin")) {
      router.push("/login")
      return
    }

    const fetchDocuments = async () => {
      try {
        const data = await documentsApi.getAll(1, 100, searchTerm || undefined)
        setDocuments(data.items)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load documents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [isAuthenticated, user, router, searchTerm, toast])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await documentsApi.delete(id)
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
      setDocuments(documents.filter((d) => d.id !== id))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const handleRegenerateSummary = async (id: number) => {
    try {
      const result = await documentsApi.generateAISummary(id)
      toast({
        title: "Success",
        description: "AI summary regenerated successfully",
      })
      setDocuments(
        documents.map((d) => (d.id === id ? { ...d, summary: result.summary } : d))
      )
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate summary",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage and upload past question documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-smooth font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Document
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search documents by title or course code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Documents Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Course Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Upload Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Downloads</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/50 transition-smooth">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{doc.title}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{doc.courseCode}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{doc.year}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">-</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-smooth"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenerateSummary(doc.id)}
                          className="p-2 hover:bg-amber-500/10 text-amber-600 rounded-lg transition-smooth"
                          title="Regenerate Summary"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 hover:bg-red-500/10 text-red-600 rounded-lg transition-smooth"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-96 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">{selectedDoc.title}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <p>
                <span className="font-semibold text-foreground">Course Code:</span>{" "}
                <span className="text-muted-foreground">{selectedDoc.courseCode}</span>
              </p>
              <p>
                <span className="font-semibold text-foreground">Year:</span>{" "}
                <span className="text-muted-foreground">{selectedDoc.year}</span>
              </p>
              <p>
                <span className="font-semibold text-foreground">Upload Date:</span>{" "}
                <span className="text-muted-foreground">
                  {new Date(selectedDoc.uploadDate).toLocaleDateString()}
                </span>
              </p>
              {selectedDoc.description && (
                <div>
                  <p className="font-semibold text-foreground mb-2">Description:</p>
                  <p className="text-muted-foreground">{selectedDoc.description}</p>
                </div>
              )}
              {selectedDoc.summary && (
                <div>
                  <p className="font-semibold text-foreground mb-2">AI Summary:</p>
                  <p className="text-muted-foreground">{selectedDoc.summary}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-smooth"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            // Refresh documents list
            const fetchDocuments = async () => {
              try {
                const data = await documentsApi.getAll(1, 100, searchTerm || undefined)
                setDocuments(data.items)
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message || "Failed to load documents",
                  variant: "destructive",
                })
              }
            }
            fetchDocuments()
          }}
        />
      )}
    </div>
  )
}
