"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, LogIn, LogOut, Plus, Trash2, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { auditApi } from "@/lib/api/audit"
import { useToast } from "@/hooks/use-toast"

interface AuditLog {
  id: string
  action: string
  userEmail?: string
  timestamp: string
  details: string
  actionType: "create" | "delete" | "update" | "login" | "logout"
}

const ITEMS_PER_PAGE = 10

export default function AuditLogsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SuperAdmin") {
      router.push("/login")
      return
    }

    const fetchLogs = async () => {
      try {
        const data = await auditApi.getAllLogs()
        setLogs(
          data.map((log) => ({
            id: log.id,
            action: log.action,
            userEmail: log.userId || undefined,
            timestamp: log.timestamp,
            details: log.details,
            actionType: getActionType(log.action),
          }))
        )
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load audit logs",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [isAuthenticated, user, router, toast])

  const getActionType = (action: string): "create" | "delete" | "update" | "login" | "logout" => {
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes("create") || lowerAction.includes("register") || lowerAction.includes("add")) {
      return "create"
    }
    if (lowerAction.includes("delete") || lowerAction.includes("remove")) {
      return "delete"
    }
    if (lowerAction.includes("login")) {
      return "login"
    }
    if (lowerAction.includes("logout")) {
      return "logout"
    }
    return "update"
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const query = searchQuery.toLowerCase()
      return (
        log.action.toLowerCase().includes(query) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(query)) ||
        log.details.toLowerCase().includes(query)
      )
    })
  }, [logs, searchQuery])

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getActionIcon = (type: string) => {
    switch (type) {
      case "create":
        return <Plus className="w-4 h-4" />
      case "delete":
        return <Trash2 className="w-4 h-4" />
      case "login":
        return <LogIn className="w-4 h-4" />
      case "logout":
        return <LogOut className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-500/10 text-green-600"
      case "delete":
        return "bg-red-500/10 text-red-600"
      case "login":
        return "bg-blue-500/10 text-blue-600"
      case "logout":
        return "bg-orange-500/10 text-orange-600"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System activity and user actions history</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search by action, user, or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                      <td className="px-6 py-4">
                        <div
                          className={`w-fit px-3 py-1.5 rounded-lg flex items-center gap-2 ${getActionColor(log.actionType)}`}
                        >
                          {getActionIcon(log.actionType)}
                          <span className="text-sm font-medium">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">{log.userEmail || "System"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{log.details}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No logs found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-border px-6 py-4 bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{paginatedLogs.length}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredLogs.length}</span> logs
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-muted rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-smooth ${
                    currentPage === page ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-muted rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
