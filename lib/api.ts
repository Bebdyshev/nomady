const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface ApiResponse<T> {
  data?: T
  error?: string
}

// Cookie utilities
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document !== "undefined") {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`
  }
}

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

const deleteCookie = (name: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = getCookie("access_token")
    }
  }

  setToken(token: string) {
    this.token = token
    setCookie("access_token", token, 7) // Store for 7 days
  }

  clearToken() {
    this.token = null
    deleteCookie("access_token")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
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

  async getConversationSearchResults(conversationId: string) {
    return this.request<any[]>(`/chat/conversation/${conversationId}/search-results`)
  }

  // Booking methods
  async getBookings() {
    return this.request<
      Array<{
        id: number
        user_id: number
        booking_type: string
        data: Record<string, any>
        created_at: string
      }>
    >("/book/")
  }

  async createBooking(bookingType: string, data: Record<string, any>) {
    return this.request<{
      id: number
      user_id: number
      booking_type: string
      data: Record<string, any>
      created_at: string
    }>("/book/", {
      method: "POST",
      body: JSON.stringify({
        booking_type: bookingType,
        data: data,
      }),
    })
  }

  async bookTicket(selection: { search_result_id: number; selected_item_id: string }) {
    return this.request<{
      id: number
      booking_type: string
      data: Record<string, any>
      is_selected: boolean
      created_at: string
    }>("/book/ticket", {
      method: "POST",
      body: JSON.stringify(selection),
    })
  }

  async bookHotel(selection: { search_result_id: number; selected_item_id: string }) {
    return this.request<{
      id: number
      booking_type: string
      data: Record<string, any>
      is_selected: boolean
      created_at: string
    }>("/book/hotel", {
      method: "POST",
      body: JSON.stringify(selection),
    })
  }

  async bookRestaurant(selection: { search_result_id: number; selected_item_id: string }) {
    return this.request<{
      id: number
      booking_type: string
      data: Record<string, any>
      is_selected: boolean
      created_at: string
    }>("/book/restaurant", {
      method: "POST",
      body: JSON.stringify(selection),
    })
  }

  async bookActivity(selection: { search_result_id: number; selected_item_id: string }) {
    return this.request<{
      id: number
      booking_type: string
      data: Record<string, any>
      is_selected: boolean
      created_at: string
    }>("/book/activity", {
      method: "POST",
      body: JSON.stringify(selection),
    })
  }

  async getBooking(bookingId: number) {
    return this.request<{
      id: number
      user_id: number
      booking_type: string
      data: Record<string, any>
      created_at: string
    }>(`/book/${bookingId}`)
  }

  async getRoadmap(conversationId: string) {
    return this.request<{
      conversation_id: string
      tickets?: any[]
      hotels?: any[]
      restaurants?: any[]
      activities?: any[]
    }>(`/roadmap/${conversationId}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
