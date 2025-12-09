"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "What past questions are included?",
      answer:
        "We have past examination questions from Njala University covering all major subjects and programs from the last 10 years, regularly updated with new content.",
    },
    {
      question: "Can I download the past questions?",
      answer:
        "Yes! With a Pro or Premium subscription, you can download all past questions as PDF files for offline studying.",
    },
    {
      question: "How does the AI assistant work?",
      answer:
        "Our AI assistant provides instant explanations, solution hints, and study recommendations based on your performance and learning patterns.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, you can access our Free plan with 100+ past questions and basic materials. Upgrade anytime to unlock premium features.",
    },
    {
      question: "How is my data protected?",
      answer:
        "We use industry-standard encryption and security protocols to protect your personal data and academic progress information.",
    },
  ]

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Find answers to common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden transition-all duration-300 bg-card hover:border-primary animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
              >
                <span className="font-semibold text-left">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-primary/5 border-t border-border animate-slide-down">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
