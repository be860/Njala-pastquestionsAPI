"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Search, User, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { studentsApi } from "@/lib/api/students"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  fullName: string
  email: string
  role: string
}

export default function StudentsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SuperAdmin") {
      router.push("/login")
      return
    }

    const fetchStudents = async () => {
      try {
        const data = await studentsApi.getAll(1, 100, searchQuery || undefined)
        setStudents(data.items)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load students",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [isAuthenticated, user, router, searchQuery, toast])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [students, searchQuery])

  const handleDeleteStudent = async (id: string) => {
    try {
      await studentsApi.delete(id)
      setStudents(students.filter((s) => s.id !== id))
      setDeleteConfirm(null)
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-1">Manage student accounts and enrollments</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {deleteConfirm === student.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-smooth"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs bg-muted text-foreground px-2 py-1 rounded hover:bg-muted/80 transition-smooth"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(student.id)}
                              className="text-destructive hover:text-destructive/80 transition-smooth p-2 hover:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No students found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border px-6 py-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> of{" "}
                <span className="font-semibold text-foreground">{students.length}</span> students
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
