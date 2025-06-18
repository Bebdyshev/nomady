"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: number
  email: string
  name: string
  type: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cookie utilities for SSR compatibility
const getCookie = (name: string): string | null => {
  if (typeof document !== "undefined") {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getCookie("access_token")
      if (token) {
        apiClient.setToken(token)
        const { data, error } = await apiClient.getMe()
        if (data && !error) {
          setUser(data as User)
        } else {
          apiClient.clearToken()
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await apiClient.login(email, password)
      if (data && !error) {
        apiClient.setToken(data.access_token)
        await checkAuth()
        return { success: true }
      }
      return { success: false, error: error || "Login failed" }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await apiClient.register(name, email, password)
      if (data && !error) {
        apiClient.setToken(data.access_token)
        await checkAuth()
        return { success: true }
      }
      return { success: false, error: error || "Registration failed" }
    } catch (error) {
      return { success: false, error: "Registration failed" }
    }
  }

  const googleLogin = async (credential: string) => {
    try {
      const { data, error } = await apiClient.googleLogin(credential)
      if (data && !error) {
        apiClient.setToken(data.access_token)
        await checkAuth()
        return { success: true }
      }
      return { success: false, error: error || "Google login failed" }
    } catch (error) {
      return { success: false, error: "Google login failed" }
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      apiClient.clearToken()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
