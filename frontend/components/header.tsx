"use client"

import { useState } from "react"
import { Menu, X, BookOpen } from "lucide-react"
import Link from "next/link"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img src="/njala-logo.png" alt="Njala Logo" className="w-8 h-8" />
            <span className="font-poppins font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Njala PQ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#home" className="text-sm font-medium hover:text-primary transition-smooth">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Features
            </Link>
            <Link href="/#about" className="text-sm font-medium hover:text-primary transition-smooth">
              About
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-primary transition-smooth">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <button className="text-sm font-medium px-4 py-2 hover:text-primary transition-smooth">Login</button>
            </Link>
            <Link href="/register">
              <button className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg transition-smooth font-medium">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-slide-up">
            <Link href="/#home" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-smooth">
              Home
            </Link>
            <Link href="/#features" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-smooth">
              Features
            </Link>
            <Link href="/#about" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-smooth">
              About
            </Link>
            <Link href="/#contact" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-smooth">
              Contact
            </Link>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <button className="w-full px-4 py-2 text-sm hover:bg-muted rounded-lg transition-smooth">Login</button>
              </Link>
              <Link href="/register" className="flex-1">
                <button className="w-full px-4 py-2 text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg transition-smooth font-medium">
                  Get Started
                </button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
