"use client"

import { Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const pastQuestions = [
  {
    course: "Mathematics (MTH201)",
    year: "2023",
    semester: "Final Exam",
    downloads: "342",
  },
  {
    course: "Physics (PHY301)",
    year: "2023",
    semester: "Midterm",
    downloads: "289",
  },
  {
    course: "Biology (BIO402)",
    year: "2022",
    semester: "Final Exam",
    downloads: "156",
  },
  {
    course: "Chemistry (CHM105)",
    year: "2023",
    semester: "Final Exam",
    downloads: "421",
  },
  {
    course: "English (ENG201)",
    year: "2023",
    semester: "Midterm",
    downloads: "267",
  },
  {
    course: "History (HST301)",
    year: "2022",
    semester: "Final Exam",
    downloads: "198",
  },
]

export default function PreviewSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold font-poppins mb-4 text-balance">Browse Past Questions</h2>
          <p className="text-lg text-muted-foreground">Explore our comprehensive collection of exam papers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastQuestions.map((item, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-smooth hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-smooth">{item.course}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.year} • {item.semester}
                  </p>
                </div>
              </div>

              <div className="mb-4 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Downloads</p>
                <p className="text-2xl font-bold text-primary">{item.downloads}</p>
              </div>

              <div className="flex gap-3">
                <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
