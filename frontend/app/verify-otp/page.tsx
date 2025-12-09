"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const email = searchParams.get("email") || ""
  const role = searchParams.get("role") || "Student"
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!email) {
      router.push("/register")
    }
  }, [email, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      document.getElementById(`otp-5`)?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await authApi.verifyOtp({
        target: email,
        code: otpCode,
        type: "email",
      })
      
      toast({
        title: "Email Verified",
        description: role === "Admin" 
          ? "Your email has been verified. Your admin account is pending SuperAdmin approval. You will be notified once approved."
          : "Your email has been verified successfully. You can now login.",
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      })
      setOtp(["", "", "", "", "", ""])
      document.getElementById("otp-0")?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    try {
      await authApi.requestOtp({
        target: email,
        type: "email",
      })
      setCountdown(60)
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your email.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Register
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-poppins mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold bg-input border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth"
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium transition-smooth"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={isResending || countdown > 0}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Already verified?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-smooth">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

