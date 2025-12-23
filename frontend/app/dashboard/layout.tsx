"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, X, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserAvatar } from "@/components/user-avatar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
  }, [isAuthenticated, user, router])

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
    { href: "/dashboard/questions", label: "Past Questions", icon: "📚" },
    { href: "/dashboard/ai-chat", label: "AI Assistant", icon: "🤖" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold text-primary">Njala Past Questions</h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="rounded-full hover:shadow-lg transition-shadow"
            >
              <UserAvatar
                name={user?.fullName}
                avatarUrl={user?.avatarUrl}
                className="h-10 w-10"
                fallbackText={user?.fullName?.charAt(0).toUpperCase() || 'S'}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <p className="font-semibold">{user?.fullName || "Student"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "student@demo.com"}</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-card border-r border-border transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-0"
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all font-medium"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
