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
import { dashboardApi, type StudentAnalytics } from "@/lib/api/dashboard"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Student") {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const data = await dashboardApi.getAnalytics()
        setAnalytics(data)
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

  if (isLoading || !analytics) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const timeData = analytics.studyTimeBySubject.map((subject) => {
    const totalMinutes = analytics.studyTimeBySubject.reduce((sum, s) => sum + s.totalMinutes, 0)
    return {
      name: subject.subject,
      value: totalMinutes > 0 ? Math.round((subject.totalMinutes / totalMinutes) * 100) : 0,
      minutes: subject.totalMinutes,
    }
  })

  const colors = ["#007BFF", "#0056b3", "#003d82", "#00264d", "#10b981", "#8b5cf6"]

  const formatChange = (value: number, suffix: string) => {
    if (value > 0) return `+${value}${suffix}`
    if (value < 0) return `${value}${suffix}`
    return `No change ${suffix}`
  }

  const metrics = [
    {
      icon: TrendingUp,
      label: "Overall Progress",
      value: `${analytics.overallProgress}%`,
      change: `${analytics.uniqueDocumentsDownloaded} of ${analytics.totalDocuments} documents explored`,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Award,
      label: "Best Subject",
      value: analytics.bestSubject?.subject || "N/A",
      change: analytics.bestSubject
        ? `${analytics.bestSubject.score}% engagement`
        : "Start studying to see your best subject",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BookOpen,
      label: "Documents Downloaded",
      value: analytics.totalDownloads.toString(),
      change: formatChange(analytics.downloadsThisWeek, " this week"),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      label: "Study Time",
      value: `${analytics.studyTime.totalHours} hrs`,
      change: `${analytics.studyTime.thisWeekHours} hrs this week (${formatChange(analytics.studyTime.weeklyChangePercent, "%")})`,
      color: "from-orange-500 to-orange-600",
    },
  ]

  const hasWeeklyData = analytics.weeklyTrend.some(
    (w) => w.downloads > 0 || w.studyHours > 0
  )

  const hasSubjectData = analytics.subjectPerformance.length > 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">Your Analytics</h2>
        <p className="text-muted-foreground">Track your learning progress and performance</p>
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 animate-slide-up">
          <h3 className="text-xl font-bold mb-4">Weekly Activity Trend</h3>
          {hasWeeklyData ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.weeklyTrend}>
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
                  dataKey="engagementScore"
                  stroke="#007BFF"
                  strokeWidth={3}
                  dot={{ fill: "#007BFF", r: 5 }}
                  name="Engagement Score"
                />
                <Line
                  type="monotone"
                  dataKey="studyHours"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Study Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm text-center px-6">
              No weekly activity yet. Browse past questions or use the AI assistant to start tracking your study time.
            </div>
          )}
        </div>

        <div
          className="bg-card border border-border rounded-lg p-6 animate-slide-up"
          style={{ animationDelay: "50ms" }}
        >
          <h3 className="text-xl font-bold mb-4">Subject Engagement</h3>
          {hasSubjectData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.subjectPerformance}>
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
                <Bar dataKey="engagementScore" fill="#007BFF" radius={[8, 8, 0, 0]} name="Engagement Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm text-center px-6">
              Download documents or study by subject to see engagement scores here.
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 bg-card border border-border rounded-lg p-6 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <h3 className="text-xl font-bold mb-4">Subject Breakdown</h3>
          {hasSubjectData ? (
            <div className="space-y-4">
              {analytics.subjectPerformance.map((subject) => (
                <div
                  key={subject.subject}
                  className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium mb-1">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.downloads} download{subject.downloads === 1 ? "" : "s"} ·{" "}
                      {Math.round(subject.studyMinutes / 60 * 10) / 10} hrs studied
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
                        style={{ width: `${subject.engagementScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-primary min-w-12">{subject.engagementScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Your subject breakdown will appear here once you start studying.
            </p>
          )}
        </div>

        <div
          className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center animate-slide-up"
          style={{ animationDelay: "150ms" }}
        >
          <h3 className="text-xl font-bold mb-4 w-full">Study Time by Subject</h3>
          {timeData.length > 0 ? (
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
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _name, props) => [`${props.payload.minutes} min`, "Study Time"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12 px-4">
              Study sessions are tracked automatically while you use the dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
