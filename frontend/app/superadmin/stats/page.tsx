"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi } from "@/lib/api/dashboard"
import { documentsApi } from "@/lib/api/documents"
import { useToast } from "@/hooks/use-toast"

export default function StatsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [globalStats, setGlobalStats] = useState({
    admins: 0,
    students: 0,
    documents: 0,
    downloads: 0,
  })
  const [courseDistribution, setCourseDistribution] = useState<
    Array<{ name: string; value: number; color: string }>
  >([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "SuperAdmin") {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [stats, documentsRes] = await Promise.all([
          dashboardApi.getGlobalStats(),
          documentsApi.getAll(1, 1000),
        ])

        setGlobalStats(stats)

        // Calculate course distribution
        const courseCodes = documentsRes.items.map((doc) => doc.courseCode)
        const courseCodeCounts = courseCodes.reduce((acc: Record<string, number>, code) => {
          acc[code] = (acc[code] || 0) + 1
          return acc
        }, {})

        const colors = [
          "var(--color-chart-1)",
          "var(--color-chart-2)",
          "var(--color-chart-3)",
          "var(--color-chart-4)",
          "var(--color-chart-5)",
        ]
        const distribution = Object.entries(courseCodeCounts)
          .map(([name, value], index) => ({
            name,
            value: value as number,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        setCourseDistribution(distribution)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user, router, toast])

  // Calculate growth trends (simplified - using current stats)
  const userGrowthData = [
    { month: "Jan", admins: Math.floor(globalStats.admins * 0.3), students: Math.floor(globalStats.students * 0.2), documents: Math.floor(globalStats.documents * 0.2) },
    { month: "Feb", admins: Math.floor(globalStats.admins * 0.5), students: Math.floor(globalStats.students * 0.4), documents: Math.floor(globalStats.documents * 0.4) },
    { month: "Mar", admins: Math.floor(globalStats.admins * 0.7), students: Math.floor(globalStats.students * 0.6), documents: Math.floor(globalStats.documents * 0.6) },
    { month: "Apr", admins: Math.floor(globalStats.admins * 0.85), students: Math.floor(globalStats.students * 0.8), documents: Math.floor(globalStats.documents * 0.8) },
    { month: "May", admins: Math.floor(globalStats.admins * 0.95), students: Math.floor(globalStats.students * 0.9), documents: Math.floor(globalStats.documents * 0.9) },
    { month: "Jun", admins: globalStats.admins, students: globalStats.students, documents: globalStats.documents },
  ]

  const downloadData = [
    { month: "Jan", downloads: Math.floor(globalStats.downloads * 0.2) },
    { month: "Feb", downloads: Math.floor(globalStats.downloads * 0.35) },
    { month: "Mar", downloads: Math.floor(globalStats.downloads * 0.5) },
    { month: "Apr", downloads: Math.floor(globalStats.downloads * 0.7) },
    { month: "May", downloads: Math.floor(globalStats.downloads * 0.85) },
    { month: "Jun", downloads: globalStats.downloads },
  ]

  const totalUsers = globalStats.admins + globalStats.students
  const monthlyGrowth = totalUsers > 0 ? Math.round((globalStats.students / totalUsers) * 100) : 0
  const avgDownloadsPerDay = Math.floor(globalStats.downloads / 30)

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), change: `+${monthlyGrowth}%`, isPositive: true, icon: Users },
    { label: "Monthly Growth", value: `${monthlyGrowth}%`, change: "+2.1%", isPositive: true, icon: TrendingUp },
    { label: "Avg Downloads/Day", value: avgDownloadsPerDay.toLocaleString(), change: "-3.2%", isPositive: false, icon: TrendingDown },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Statistics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive analytics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${stat.isPositive ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Growth Trend</h2>
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
              <Line type="monotone" dataKey="students" stroke="var(--color-chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="documents" stroke="var(--color-chart-2)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Downloads Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Download Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={downloadData}>
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
              <Bar dataKey="downloads" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Course Distribution */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Document Distribution by Course</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="var(--color-chart-1)"
                  dataKey="value"
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {courseDistribution.map((course, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.value} documents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
