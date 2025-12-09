"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Search, FileText, Loader2, Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { documentsApi } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"
import { UploadDocumentModal } from "../../admin/dashboard/UploadDocumentModal"

interface Document {
  id: number
  title: string
  courseCode: string
  year: number
  uploader: string
  uploadDate: string
  summary?: string
  description: string
}

export default function DocumentsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SuperAdmin") {
      router.push("/login")
      return
    }

    const fetchDocuments = async () => {
      try {
        const data = await documentsApi.getAll(1, 100, searchQuery || undefined)
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
  }, [isAuthenticated, user, router, searchQuery, toast])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const query = searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.courseCode.toLowerCase().includes(query) ||
        doc.uploader.toLowerCase().includes(query)
      )
    })
  }, [documents, searchQuery])

  const handleDeleteDocument = async (id: number) => {
    try {
      await documentsApi.delete(id)
      setDocuments(documents.filter((d) => d.id !== id))
      setDeleteConfirm(null)
      toast({
        title: "Success",
        description: "Document deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all uploaded past questions</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-smooth font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Document
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, course code, or uploader..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg mb-1">{doc.title}</h3>
                        <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                          <span className="px-2.5 py-1 bg-muted rounded">
                            <span className="font-medium">{doc.courseCode}</span>
                          </span>
                          <span>
                            Year: <span className="font-medium">{doc.year}</span>
                          </span>
                          <span>
                            By: <span className="font-medium">{doc.uploader}</span>
                          </span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {doc.summary || doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex flex-col gap-2">
                      {deleteConfirm === doc.id ? (
                        <>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-xs bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-smooth whitespace-nowrap font-medium"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs bg-muted text-foreground px-3 py-2 rounded hover:bg-muted/80 transition-smooth whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="text-destructive hover:text-destructive/80 transition-smooth p-2 hover:bg-destructive/10 rounded-lg"
                          title="Delete document"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No documents found matching your search</p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Documents</p>
              <p className="text-2xl font-bold text-foreground">{documents.length}</p>
            </div>
          </div>
        </>
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
                const data = await documentsApi.getAll(1, 100, searchQuery || undefined)
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
          }}
        />
      )}
    </div>
  )
}
