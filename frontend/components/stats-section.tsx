"use client"

import { Users, BookOpen, Award, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    label: "Active Students",
    value: "15,000+",
    description: "Learning with Njala PQ",
  },
  {
    icon: BookOpen,
    label: "Questions Available",
    value: "8,500+",
    description: "Past exam papers",
  },
  {
    icon: Award,
    label: "Success Rate",
    value: "94%",
    description: "Students improved grades",
  },
  {
    icon: TrendingUp,
    label: "Study Hours",
    value: "2.5M+",
    description: "Logged on platform",
  },
]

export default function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-1s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold font-poppins mb-4 text-balance">
            Trusted by Students Across Njala
          </h2>
          <p className="text-lg text-muted-foreground">Join our community and ace your exams</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-smooth hover:shadow-lg hover:-translate-y-1 glass hover:glass-dark animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-smooth group-hover:scale-110 group-hover:animate-glow-pulse">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold font-poppins mb-2 group-hover:text-primary transition-smooth animate-bounce-subtle">
                  {stat.value}
                </h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
