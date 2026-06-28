"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi } from "@/lib/api/dashboard"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatStudyDuration } from "@/lib/utils"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    downloadCount: 0,
    documentsCount: 0,
    recentDocuments: [] as Array<{
      id: number
      title: string
      courseCode: string
      year: number
      uploadDate: string
    }>,
  })
  const [studyMinutes, setStudyMinutes] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

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

    const fetchData = async () => {
      try {
        const [dashboardData, analytics] = await Promise.all([
          dashboardApi.getStudentDashboard(),
          dashboardApi.getAnalytics(),
        ])
        setStats(dashboardData)
        setStudyMinutes(
          analytics.studyTime.totalMinutes ??
            Math.round(analytics.studyTime.totalHours * 60)
        )
        setOverallProgress(analytics.overallProgress)
      } catch (error: any) {
        if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
          router.push("/login")
          return
        }
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user, router, toast])

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const quickStats = [
    { label: "Overall Progress", value: `${overallProgress}%`, change: "Documents explored" },
    { label: "Downloads", value: stats.downloadCount.toString(), change: "Total downloads" },
    { label: "Study Time", value: formatStudyDuration(studyMinutes), change: "Tracked automatically" },
    { label: "Available Documents", value: stats.documentsCount.toString(), change: "Past questions" },
  ]

  const recentActivity = stats.recentDocuments.map((doc) => ({
    title: doc.title,
    subject: doc.courseCode,
    date: new Date(doc.uploadDate).toLocaleDateString(),
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">Welcome back, {user?.fullName || "Student"}!</h2>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all duration-300 hover:shadow-lg animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
            <p className="text-xs text-green-600 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-3">Continue Learning</h3>
          <p className="text-muted-foreground mb-6">Pick up where you left off</p>
          <Link href="/dashboard/questions">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Questions</Button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-3">Need Help?</h3>
          <p className="text-muted-foreground mb-6">Chat with our AI assistant</p>
          <Link href="/dashboard/ai-chat">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">Ask AI Assistant</Button>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Downloads</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.subject}</p>
                </div>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No downloads yet. Browse past questions to download study materials.
          </p>
        )}
      </div>
    </div>
  )
}
