"use client"

import { BookOpen, Lightbulb, Brain, Lock } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Smart Search",
    description:
      "Instantly find past questions by course or year. Filter by department, course code, or exam period with lightning-fast results.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Lightbulb,
    title: "AI Insights",
    description:
      "Get summaries and key concepts from uploaded documents. Let our AI extract the most important information for you.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description:
      "Chat with an intelligent tutor trained on Njala materials. Get instant answers and personalized learning guidance.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Lock,
    title: "Secure Access",
    description:
      "Safe downloads and verified resources. Your data is protected with enterprise-grade security and encryption.",
    color: "from-green-500 to-emerald-500",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold font-poppins mb-4 text-balance">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Student Success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to prepare for exams and master your courses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in glass hover:glass-dark"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-smooth group-hover:animate-bounce-subtle`}
                >
                  <Icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold font-poppins mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
