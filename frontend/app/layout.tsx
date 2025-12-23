import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Njala Past Questions - Study Smarter",
  description: "Access past exam questions, AI-powered tutoring, and study resources for Njala University students",
  generator: "Next.js",
  icons: {
    icon: [
      {
        url: "/njala-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/njala-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/njala-logo.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/njala-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${poppins.variable} ${inter.variable}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
