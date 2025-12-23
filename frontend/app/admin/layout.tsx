"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, FileText, GraduationCap, LogOut, Menu, ChevronDown, Settings, Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { UserAvatar } from "@/components/user-avatar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileDropdown, setProfileDropdown] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "Admin" && user?.role !== "SuperAdmin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  const handleLogout = () => {
    logout()
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: FileText, label: "Documents", href: "/admin/documents" },
    { icon: GraduationCap, label: "Students", href: "/admin/students" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } z-40`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-foreground">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-smooth text-foreground/70 hover:text-foreground"
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Navigation */}
        <header className="sticky top-0 bg-card border-b border-border z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-smooth"
              >
                <UserAvatar
                  name={user?.fullName}
                  avatarUrl={user?.avatarUrl}
                  className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600"
                  fallbackClassName="from-emerald-500 to-emerald-600"
                  fallbackText={user?.fullName?.charAt(0).toUpperCase() || "AD"}
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{user?.fullName || "Admin User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "admin@njala.edu"}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <Link
                    href="/admin/profile"
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-smooth flex items-center gap-2 text-foreground"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-destructive/10 transition-smooth flex items-center gap-2 text-destructive border-t border-border"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
