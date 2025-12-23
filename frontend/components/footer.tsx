"use client"

import { BookOpen, Mail, Linkedin, Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/njala-logo.png" alt="Njala Logo" className="w-8 h-8" />
              <span className="font-bold text-lg">Njala PQ</span>
            </div>
            <p className="text-background/70 text-sm">
              Empowering Njala students to excel through smart learning tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Updates
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-smooth">
                  Terms
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-smooth"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-smooth"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-smooth"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-background/70">© 2025 Njala Past Questions. All rights reserved.</p>
          <p className="text-sm text-background/70 mt-4 md:mt-0">Built with ❤️ by Francis Benjamin Turay</p>
        </div>
      </div>
    </footer>
  )
}
