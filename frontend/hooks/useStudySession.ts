"use client"

import { useEffect, useRef } from "react"
import { studyTimeApi } from "@/lib/api/studytime"
import { API_CONFIG, getAuthToken } from "@/lib/api/config"

const SESSION_STORAGE_KEY = "activeStudySessionId"

export function getStudySubjectFromPath(pathname: string): string {
  if (pathname.includes("/questions")) return "Past Questions"
  if (pathname.includes("/ai-chat")) return "AI Assistant"
  if (pathname.includes("/analytics")) return "Analytics"
  if (pathname.includes("/settings")) return "Settings"
  return "Dashboard"
}

export function useStudySession(subject: string) {
  const sessionIdRef = useRef<string | null>(null)
  const subjectRef = useRef(subject)

  useEffect(() => {
    subjectRef.current = subject
  }, [subject])

  useEffect(() => {
    let cancelled = false

    const ensureSession = async () => {
      if (!getAuthToken()) return

      try {
        const response = await studyTimeApi.startSession(subjectRef.current)
        if (cancelled) return
        sessionIdRef.current = response.id
        sessionStorage.setItem(SESSION_STORAGE_KEY, response.id)
      } catch {
        try {
          const active = await studyTimeApi.getActiveSession()
          if (cancelled) return
          sessionIdRef.current = active.id
          sessionStorage.setItem(SESSION_STORAGE_KEY, active.id)
        } catch {
          sessionStorage.removeItem(SESSION_STORAGE_KEY)
        }
      }
    }

    ensureSession()

    return () => {
      cancelled = true
    }
  }, [subject])

  useEffect(() => {
    const endSession = () => {
      const token = getAuthToken()
      if (!token) return

      fetch(`${API_CONFIG.baseURL}/study-time/end-active`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        keepalive: true,
      }).catch(() => {})

      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      sessionIdRef.current = null
    }

    window.addEventListener("beforeunload", endSession)
    return () => {
      window.removeEventListener("beforeunload", endSession)
      studyTimeApi.endActiveSession().catch(() => {})
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      sessionIdRef.current = null
    }
  }, [])
}
