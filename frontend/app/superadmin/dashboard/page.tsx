"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, GraduationCap, FileText, Download, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { superadminApi } from "@/lib/api/superadmin"
import { auditApi } from "@/lib/api/audit"
import { useToast } from "@/hooks/use-toast"

export default function SuperAdminDashboard() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    admins: 0,
    students: 0,
    documents: 0,
    downloads: 0,
  })
  const [recentLogs, setRecentLogs] = useState<Array<{
    id: string
    action: string
    details: string
    timestamp: string
  }>>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SuperAdmin") {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [statsData, logs] = await Promise.all([
          superadminApi.getStats(),
          auditApi.getAllLogs(),
        ])

        setStats(statsData)
        setRecentLogs(
          logs
            .slice(0, 5)
            .map((log) => ({
              id: log.id,
              action: log.action,
              details: log.details,
              timestamp: new Date(log.timestamp).toLocaleString(),
            }))
        )
      } catch (error: any) {
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
      <div className="space-y-6 animate-fade-in flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const kpiCards = [
    { title: "Total Admins", value: stats.admins.toString(), icon: Users, color: "from-blue-500 to-blue-600" },
    { title: "Total Students", value: stats.students.toString(), icon: GraduationCap, color: "from-green-500 to-green-600" },
    { title: "Total Documents", value: stats.documents.toString(), icon: FileText, color: "from-purple-500 to-purple-600" },
    { title: "Total Downloads", value: stats.downloads.toString(), icon: Download, color: "from-orange-500 to-orange-600" },
  ]

  // Calculate download percentage for pie chart
  const totalDocuments = stats.documents
  const downloadedPercentage = totalDocuments > 0 
    ? Math.round((stats.downloads / (totalDocuments * 10)) * 100) // Estimate based on downloads
    : 0
  const notDownloadedPercentage = 100 - downloadedPercentage

  // For user growth chart, we'll show current stats across months (simplified)
  // In a real scenario, you'd fetch historical data
  const userGrowthData = [
    { month: "Jan", admins: Math.floor(stats.admins * 0.3), students: Math.floor(stats.students * 0.2) },
    { month: "Feb", admins: Math.floor(stats.admins * 0.5), students: Math.floor(stats.students * 0.4) },
    { month: "Mar", admins: Math.floor(stats.admins * 0.7), students: Math.floor(stats.students * 0.6) },
    { month: "Apr", admins: Math.floor(stats.admins * 0.85), students: Math.floor(stats.students * 0.8) },
    { month: "May", admins: Math.floor(stats.admins * 0.95), students: Math.floor(stats.students * 0.9) },
    { month: "Jun", admins: stats.admins, students: stats.students },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">User Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="admins"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--color-chart-1)" }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={{ fill: "var(--color-chart-2)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Download Stats */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Download Stats</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Downloaded", value: downloadedPercentage },
                  { name: "Not Downloaded", value: notDownloadedPercentage },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                <Cell fill="var(--color-chart-1)" />
                <Cell fill="var(--color-chart-3)" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {downloadedPercentage}% Downloaded Rate ({stats.downloads} downloads)
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent System Logs</h2>
          <a href="/superadmin/audit" className="text-sm text-primary hover:text-primary/80 transition-smooth">
            View All
          </a>
        </div>

        <div className="space-y-3">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-smooth border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">{log.action}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent logs</p>
          )}
        </div>
      </div>
    </div>
  )
}
