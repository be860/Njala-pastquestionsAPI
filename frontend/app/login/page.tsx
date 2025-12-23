"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Chrome, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"

declare global {
  interface Window {
    google: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login, googleLogin, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleGoogleCallback = useCallback(async (response: any) => {
    setGoogleLoading(true)
    try {
      await googleLogin(response.credential)
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login with Google. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGoogleLoading(false)
    }
  }, [googleLogin, toast])

  useEffect(() => {
    // Initialize Google Sign-In when script loads
    const initGoogleSignIn = () => {
      if (typeof window !== "undefined" && window.google?.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleCallback,
        })

        const buttonElement = document.getElementById("google-signin-button")
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            width: "100%",
          })
        }
      }
    }

    // Check if Google script is already loaded
    if (typeof window !== "undefined" && window.google?.accounts) {
      initGoogleSignIn()
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (typeof window !== "undefined" && window.google?.accounts) {
          initGoogleSignIn()
          clearInterval(checkGoogle)
        }
      }, 100)

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000)
    }
  }, [handleGoogleCallback])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.prompt()
    } else {
      toast({
        title: "Google Sign-In",
        description: "Google Sign-In is initializing. Please wait a moment and try again.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-poppins mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Login to access past questions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium transition-smooth"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && 
           process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "your_google_client_id_here" && (
            <>
              <Script
                src="https://accounts.google.com/gsi/client"
                strategy="lazyOnload"
                onLoad={() => {
                  if (typeof window !== "undefined" && window.google?.accounts) {
                    window.google.accounts.id.initialize({
                      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
                      callback: handleGoogleCallback,
                    })

                    const buttonElement = document.getElementById("google-signin-button")
                    if (buttonElement) {
                      window.google.accounts.id.renderButton(buttonElement, {
                        theme: "outline",
                        size: "large",
                        width: "100%",
                      })
                    }
                  }
                }}
              />

              <div id="google-signin-button" className="w-full mb-3"></div>
            </>
          )}

          {googleLoading && (
            <div className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-gray-700 h-11 font-medium rounded-lg mb-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in with Google...
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-smooth">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
