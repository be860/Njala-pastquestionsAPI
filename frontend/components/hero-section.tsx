"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section
      id="home"
      className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/2 w-full h-full bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/2 w-full h-full bg-gradient-to-l from-accent/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in space-y-6">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium glass hover:glass-dark transition-smooth">
              🎓 Welcome to Excellence
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold font-poppins leading-tight text-balance">
              Empowering Njala Students to Excel
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed text-balance">
              Access past questions, study resources, and personalized AI tutoring—all in one place. Study smarter, not
              harder.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-xl transition-smooth hover:scale-105 animate-glow-pulse"
              >
                Explore Resources <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/5 transition-smooth bg-transparent hover:scale-105"
              >
                Learn More
              </Button>
            </div>

            <div className="flex gap-8 pt-8">
              <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <p className="text-2xl font-bold">2,500+</p>
                <p className="text-sm text-muted-foreground">Past Questions</p>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <p className="text-2xl font-bold">1,200+</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="animate-float hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl animate-glow-pulse" />
              <img
                src="/diverse-students-studying-on-laptops-in-modern-lib.jpg"
                alt="Students studying with technology"
                className="w-full rounded-3xl shadow-2xl relative z-10 hover:shadow-primary/50 transition-smooth hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
