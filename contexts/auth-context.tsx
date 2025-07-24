"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: number
  email: string
  name: string
  type: string
  created_at: string
  picture?: string // Google profile picture URL
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string; email?: string }>
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; error?: string; message?: string }>
  resendCode: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setLoading(true)
    try {
      const { data, error } = await apiClient.getMe()
      if (data && !error) {
        setUser(data as User)
      } else {
        setUser(null)
        apiClient.clearToken() // Ensure tokens are cleared if getMe fails
      }
    } catch (error) {
      setUser(null)
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await apiClient.login(email, password)
      if (data && !error) {
        apiClient.setToken(data.access_token, data.refresh_token)
        localStorage.removeItem('anon_chat_session_id');
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
        // Registration successful but user is not logged in yet - needs email verification
        return { success: true, message: data.message, email: data.email }
      }
      return { success: false, error: error || "Registration failed" }
    } catch (error) {
      return { success: false, error: "Registration failed" }
    }
  }

  const verifyCode = async (email: string, code: string) => {
    try {
      const { data, error } = await apiClient.verifyCode(email, code)
      if (data && !error) {
        // If verification includes access token, log the user in
        if (data.access_token) {
          apiClient.setToken(data.access_token)
          localStorage.removeItem('anon_chat_session_id');
          await checkAuth()
        }
        return { success: true, message: data.message }
      }
      return { success: false, error: error || "Code verification failed" }
    } catch (error) {
      return { success: false, error: "Code verification failed" }
    }
  }

  const resendCode = async (email: string) => {
    try {
      const { data, error } = await apiClient.resendCode(email)
      if (data && !error) {
        return { success: true, message: data.message }
      }
      return { success: false, error: error || "Failed to resend verification code" }
    } catch (error) {
      return { success: false, error: "Failed to resend verification code" }
    }
  }

  const googleLogin = async (credential: string) => {
    try {
      const { data, error } = await apiClient.googleLogin(credential)
      if (data && !error) {
        apiClient.setToken(data.access_token, data.refresh_token)
        localStorage.removeItem('anon_chat_session_id');
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
      await apiClient.logout() // apiClient handles token removal
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyCode,
        resendCode,
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
