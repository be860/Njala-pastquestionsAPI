"use client"

import { BookOpen, BarChart3, Brain, Award } from "lucide-react"

export default function HowItWorksSection() {
  const steps = [
    {
      icon: BookOpen,
      title: "Browse Questions",
      description: "Access thousands of past examination questions organized by subject and year",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Monitor your performance with detailed analytics and personalized insights",
    },
    {
      icon: Brain,
      title: "AI Assistance",
      description: "Get instant explanations and hints from our intelligent study assistant",
    },
    {
      icon: Award,
      title: "Achieve Goals",
      description: "Reach your target grades with structured learning paths and practice tests",
    },
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">Four simple steps to academic excellence</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-gradient-to-r from-primary to-primary/30" />
                )}

                <div className="bg-card border border-border rounded-xl p-8 h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center mb-6 group">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                  <div className="mt-4 text-primary font-bold text-sm">Step {index + 1}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
