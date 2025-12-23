"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Mail, Lock, User, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { adminsApi } from "@/lib/api/admins"
import { useToast } from "@/hooks/use-toast"

interface Admin {
  id: string
  fullName: string
  email: string
  role: string
}

export default function AdminsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [approveConfirm, setApproveConfirm] = useState<string | null>(null)
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" })
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SuperAdmin") {
      router.push("/login")
      return
    }

    const fetchAdmins = async () => {
      try {
        const [approvedData, pendingData] = await Promise.all([
          adminsApi.getAll(1, 100),
          adminsApi.getPending(),
        ])
        setAdmins(approvedData?.items || [])
        setPendingAdmins(pendingData || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load admins",
          variant: "destructive",
        })
        // Ensure arrays are set even on error
        setAdmins([])
        setPendingAdmins([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdmins()
  }, [isAuthenticated, user, router, toast])

  const handleApprove = async (id: string) => {
    try {
      await adminsApi.approve(id)
      setPendingAdmins((pendingAdmins || []).filter((a) => a.id !== id))
      // Refresh approved admins list
      const data = await adminsApi.getAll(1, 100)
      setAdmins(data?.items || [])
      toast({
        title: "Success",
        description: "Admin approved successfully!",
      })
      setApproveConfirm(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve admin",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminsApi.reject(id)
      setPendingAdmins((pendingAdmins || []).filter((a) => a.id !== id))
      toast({
        title: "Success",
        description: "Admin rejected and removed.",
      })
      setRejectConfirm(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject admin",
        variant: "destructive",
      })
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newAdmin = await adminsApi.create({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })
      setAdmins([...(admins || []), newAdmin])
      setFormData({ fullName: "", email: "", password: "" })
      setShowModal(false)
      toast({
        title: "Success",
        description: "Admin added successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    try {
      await adminsApi.delete(id)
      setAdmins((admins || []).filter((a) => a.id !== id))
      setDeleteConfirm(null)
      toast({
        title: "Success",
        description: "Admin deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
          <p className="text-muted-foreground mt-1">Manage system administrators and their permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-smooth font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 font-medium transition-smooth ${
            activeTab === "approved"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Approved Admins ({admins?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium transition-smooth relative ${
            activeTab === "pending"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Approval ({pendingAdmins?.length || 0})
          {(pendingAdmins?.length || 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {pendingAdmins?.length || 0}
            </span>
          )}
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "approved" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(admins?.length || 0) > 0 ? (
                  admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{admin.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {deleteConfirm === admin.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
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
                            onClick={() => setDeleteConfirm(admin.id)}
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
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No approved admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(pendingAdmins?.length || 0) > 0 ? (
                  pendingAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="font-medium text-foreground">{admin.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                          Pending Approval
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {approveConfirm === admin.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(admin.id)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-smooth"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setApproveConfirm(null)}
                              className="text-xs bg-muted text-foreground px-2 py-1 rounded hover:bg-muted/80 transition-smooth"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : rejectConfirm === admin.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleReject(admin.id)}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-smooth"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRejectConfirm(null)}
                              className="text-xs bg-muted text-foreground px-2 py-1 rounded hover:bg-muted/80 transition-smooth"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setApproveConfirm(admin.id)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-smooth"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectConfirm(admin.id)}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-smooth"
                              title="Reject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No pending admins
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold text-foreground mb-6">Add New Admin</h2>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>


              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
