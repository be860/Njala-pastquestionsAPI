"use client"

import { Award, Users, BookOpen, Zap } from "lucide-react"

export default function WhyChooseSection() {
  const reasons = [
    {
      icon: BookOpen,
      title: "Comprehensive Resources",
      description:
        "Access thousands of past questions, study materials, and exam papers curated specifically for Njala students.",
    },
    {
      icon: Zap,
      title: "AI-Powered Learning",
      description:
        "Get personalized study recommendations and instant help from our intelligent AI tutor available 24/7.",
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Join 1,200+ students who have improved their grades using our platform. Average improvement: 25%.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Learn from peers, share notes, and get help from experienced students who've succeeded before you.",
    },
  ]

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Njala Past Questions?</h2>
          <p className="text-xl text-muted-foreground">Everything you need to succeed in your studies</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 transition-all duration-300 hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
