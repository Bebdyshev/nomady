const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ access_token: string; type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ access_token: string; type: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async googleLogin(token: string) {
    return this.request<{ access_token: string; type: string }>("/auth/google-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async logout() {
    const result = await this.request("/auth/logout", { method: "POST" })
    this.clearToken()
    return result
  }

  async getMe() {
    return this.request("/auth/users/me")
  }

  // Chat methods
  async sendMessage(messages: Array<{ role: string; content: string }>, conversationId?: string) {
    const params = new URLSearchParams()
    if (conversationId) {
      params.append("conversation_id", conversationId)
    }

    return this.request<{
      response: string
      conversation_id: string
      tool_output?: any
    }>(`/chat/?${params.toString()}`, {
      method: "POST",
      body: JSON.stringify({ messages }),
    })
  }

  async getConversations() {
    return this.request<
      Array<{
        id: string
        user_id: number
        created_at: string
        last_updated: string
        messages: Array<{
          id: number
          role: string
          content: string
          timestamp: string
        }>
      }>
    >("/chat/conversations")
  }

  async getConversation(conversationId: string) {
    return this.request(`/chat/conversation/${conversationId}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
