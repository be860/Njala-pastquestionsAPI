"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Cheseed Sharon Bangura",
    course: "Computer Science (Final Year)",
    text: "Njala Past Questions helped me prepare confidently for my exams. The AI tutor feature was especially helpful!",
    avatar: "/portrait-of-african-student-woman.jpg",
  },
  {
    name: "Francis Benjamin Turay",
    course: "Computer Science (Final Year)",
    text: "Having access to organized past questions saved me so much time. I improved my grades by 15% in just one semester.",
    avatar: "/portrait-of-african-student-man.jpg",
  },
  {
    name: "Isha Bah",
    course: "Biology (Second Year)",
    text: "The platform is so easy to use, and the AI summaries help me understand concepts faster. Highly recommended!",
    avatar: "/portrait-of-african-student-woman-smiling.jpg",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold font-poppins mb-4 text-balance">Loved by Njala Students</h2>
          <p className="text-lg text-muted-foreground">See what students are saying about their experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-card border border-border rounded-2xl hover:border-primary/50 transition-smooth hover:shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
