"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, AuthResponse } from '@/lib/api/auth'
import { setAuthToken, setRefreshToken, removeAuthToken, getAuthToken, getRefreshToken } from '@/lib/api/config'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  avatarUrl?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  googleLogin: (credential: string) => Promise<void>
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>
  logout: () => void
  updateUser: (user: User | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load user from localStorage on mount
    const storedToken = getAuthToken()
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        removeAuthToken()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      
      if ('requiresTwoFactorAuth' in response) {
        throw new Error('Two-factor authentication required')
      }

      const authResponse = response as AuthResponse
      setAuthToken(authResponse.token)
      setRefreshToken(authResponse.refreshToken)
      setToken(authResponse.token)
      setUser(authResponse.user)
      localStorage.setItem('user', JSON.stringify(authResponse.user))

      // Redirect based on role
      if (authResponse.user.role === 'SuperAdmin') {
        router.push('/superadmin/dashboard')
      } else if (authResponse.user.role === 'Admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      throw error
    }
  }

  const googleLogin = async (credential: string) => {
    try {
      const response = await authApi.googleLogin({ credential })
      setAuthToken(response.token)
      setRefreshToken(response.refreshToken)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Redirect based on role
      if (response.user.role === 'SuperAdmin') {
        router.push('/superadmin/dashboard')
      } else if (response.user.role === 'Admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      throw error
    }
  }

  const updateUser = (updatedUser: User | null) => {
    setUser(updatedUser)
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  const register = async (email: string, password: string, fullName: string, role: string = "Student") => {
    try {
      const response = await authApi.register({ email, password, fullName, role })
      // After registration, redirect to OTP verification
      if (role === "Admin") {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=Admin`)
      } else {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
      }
    } catch (error: any) {
      throw error
    }
  }

  const logout = () => {
    removeAuthToken()
    setToken(null)
    setUser(null)
    // Use window.location for a hard redirect to ensure state is cleared
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        googleLogin,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
