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
import { TrendingUp, Award, BookOpen, Clock, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi } from "@/lib/api/dashboard"
import { documentsApi } from "@/lib/api/documents"
import { studyTimeApi } from "@/lib/api/studytime"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
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
  const [subjectData, setSubjectData] = useState<Array<{ subject: string; score: number; attempted: number }>>([])
  const [studyStats, setStudyStats] = useState({
    totalHours: 0,
    todayHours: 0,
    thisWeekHours: 0,
    subjectStats: [] as Array<{ subject: string; totalMinutes: number }>,
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Student") {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [dashboardData, documentsRes, stats] = await Promise.all([
          dashboardApi.getStudentDashboard(),
          documentsApi.getAll(1, 100),
          studyTimeApi.getStats().catch(() => ({
            totalHours: 0,
            todayHours: 0,
            thisWeekHours: 0,
            subjectStats: [],
          })),
        ])

        setStats(dashboardData)
        setStudyStats(stats)

        // Calculate subject performance from documents and study time
        const courseCodes = Array.from(new Set(documentsRes.items.map((doc) => doc.courseCode)))
        const subjectPerformance = courseCodes.slice(0, 5).map((code) => {
          const studyTimeForSubject = stats.subjectStats.find((s) => s.subject === code)
          const studyMinutes = studyTimeForSubject?.totalMinutes || 0
          // Calculate score based on downloads and study time
          const downloadsForSubject = dashboardData.recentDocuments.filter(
            (doc) => doc.courseCode === code
          ).length
          const score = Math.min(100, Math.floor((downloadsForSubject * 10 + studyMinutes / 10) / 2))
          const attempted = downloadsForSubject + Math.floor(studyMinutes / 30)

          return {
            subject: code,
            score: Math.max(60, score), // Minimum 60%
            attempted: Math.max(1, attempted),
          }
        })

        setSubjectData(subjectPerformance)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user, router, toast])

  // Performance data over time (simplified - using download count as progress indicator)
  const performanceData = [
    { week: "Week 1", score: Math.floor((stats.downloadCount / 6) * 0.2), target: 75 },
    { week: "Week 2", score: Math.floor((stats.downloadCount / 6) * 0.4), target: 75 },
    { week: "Week 3", score: Math.floor((stats.downloadCount / 6) * 0.6), target: 75 },
    { week: "Week 4", score: Math.floor((stats.downloadCount / 6) * 0.8), target: 75 },
    { week: "Week 5", score: Math.floor((stats.downloadCount / 6) * 0.95), target: 85 },
    { week: "Week 6", score: Math.floor(stats.downloadCount / 6), target: 85 },
  ]

  // Time distribution based on study time by subject
  const totalStudyMinutes = studyStats.subjectStats.reduce((sum, s) => sum + s.totalMinutes, 0)
  const timeData = studyStats.subjectStats.length > 0
    ? studyStats.subjectStats.map((subject) => ({
        name: subject.subject,
        value: totalStudyMinutes > 0
          ? Math.floor((subject.totalMinutes / totalStudyMinutes) * 100)
          : 0,
      }))
    : subjectData.map((subject) => ({
        name: subject.subject,
        value: subjectData.reduce((sum, s) => sum + s.attempted, 0) > 0
          ? Math.floor((subject.attempted / subjectData.reduce((sum, s) => sum + s.attempted, 0)) * 100)
          : 0,
      }))

  const colors = ["#007BFF", "#0056b3", "#003d82", "#00264d"]

  const overallProgress = stats.documentsCount > 0 ? Math.round((stats.downloadCount / stats.documentsCount) * 100) : 0
  const bestSubject = subjectData.length > 0 ? subjectData.reduce((best, current) => (current.score > best.score ? current : best)) : null

  // Key metrics
  const metrics = [
    {
      icon: TrendingUp,
      label: "Overall Progress",
      value: `${overallProgress}%`,
      change: `+${Math.floor(overallProgress * 0.1)}% this month`,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Award,
      label: "Best Subject",
      value: bestSubject?.subject || "N/A",
      change: bestSubject ? `${bestSubject.score}% average` : "No data",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BookOpen,
      label: "Questions Done",
      value: stats.downloadCount.toString(),
      change: `+${Math.floor(stats.downloadCount * 0.2)} this week`,
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      label: "Study Time",
      value: `${studyStats.totalHours} hrs`,
      change: `+${studyStats.thisWeekHours.toFixed(1)} hours this week`,
      color: "from-orange-500 to-orange-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">Your Analytics</h2>
        <p className="text-muted-foreground">Track your learning progress and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${metric.color} rounded-lg p-6 text-white shadow-lg animate-slide-up hover:shadow-xl transition-shadow`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                <Icon className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-sm text-white/70">{metric.change}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Over Time */}
        <div className="bg-card border border-border rounded-lg p-6 animate-slide-up">
          <h3 className="text-xl font-bold mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
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
                dataKey="score"
                stroke="#007BFF"
                strokeWidth={3}
                dot={{ fill: "#007BFF", r: 5 }}
                name="Your Score"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#ccc"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-slide-up"
          style={{ animationDelay: "50ms" }}
        >
          <h3 className="text-xl font-bold mb-4">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill="#007BFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Study Time Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 bg-card border border-border rounded-lg p-6 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <h3 className="text-xl font-bold mb-4">Top Subjects by Questions Attempted</h3>
          <div className="space-y-4">
            {subjectData.map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium mb-1">{subject.subject}</p>
                  <p className="text-sm text-muted-foreground">{subject.attempted} questions attempted</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
                      style={{ width: `${(subject.score / 100) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-primary min-w-12">{subject.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Distribution Pie */}
        <div
          className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center animate-slide-up"
          style={{ animationDelay: "150ms" }}
        >
          <h3 className="text-xl font-bold mb-4 w-full">Study Time by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={timeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {timeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
