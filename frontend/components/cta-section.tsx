"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-accent to-primary">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold font-poppins text-primary-foreground mb-6 text-balance">
          Join thousands of Njala students already improving their grades
        </h2>

        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Start your journey to academic excellence today. Access all resources with a single account.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-semibold transition-smooth shadow-lg"
          >
            Sign Up Free <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10 font-semibold transition-smooth bg-transparent"
          >
            Schedule Demo
          </Button>
        </div>

        <p className="text-sm text-primary-foreground/70 mt-8">
          No credit card required • 100% free trial • Cancel anytime
        </p>
      </div>
    </section>
  )
}
