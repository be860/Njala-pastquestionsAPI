"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api/auth"

export default function ForgotPasswordPage() {
    const { toast } = useToast()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await authApi.requestPasswordReset(email)
            setIsSubmitted(true)
            toast({
                title: "Reset Link Sent",
                description: "If an account exists with this email, you will receive a password reset link.",
            })
        } catch (error: any) {
            toast({
                title: "Request Failed",
                description: error.message || "Failed to request password reset. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold font-poppins mb-2">Forgot Password</h1>
                        <p className="text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {!isSubmitted ? (
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

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-medium transition-smooth"
                            >
                                {isLoading ? "Sending Link..." : "Send Reset Link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Check your email</h3>
                                <p className="text-muted-foreground text-sm">
                                    We have sent a password reset link to <strong>{email}</strong>.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Try different email
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
