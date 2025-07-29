const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  destination_city?: string
  destination_coordinates?: { lat: number; lng: number }
  people_count?: number
  budget_level?: number  // 1-4: budget, average, high, premium
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

interface City {
  name: string
  slug: string
  country: string
  image?: string
  overall_score: number
  cost_for_nomad_in_usd?: number
  internet_speed?: number
  safety_level?: number
}

interface ExploreResponse {
  success: boolean
  total_cities: number
  filtered_cities: number
  cities: City[]
  timestamp: string
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

  setToken(accessToken: string, refreshToken?: string) {
    this.token = accessToken
    setCookie("access_token", accessToken, 1) // Store for 1 day
    if (refreshToken) {
      setCookie("refresh_token", refreshToken, 30) // Store for 30 days
    }
  }

  clearToken() {
    this.token = null
    deleteCookie("access_token")
    deleteCookie("refresh_token")
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
        if (response.status === 401 && !headers["X-No-Retry"]) {
          const refreshTokenValue = getCookie("refresh_token")
          if (refreshTokenValue) {
            const { data: refreshData, error: refreshError } = await this.refreshToken(refreshTokenValue)
            if (refreshData && !refreshError) {
              this.setToken(refreshData.access_token, refreshData.refresh_token)
              // Retry original request
              headers.Authorization = `Bearer ${refreshData.access_token}`
              return this.request<T>(endpoint, { ...options, headers })
            }
          }
          // If refresh fails or no refresh token, logout
          this.clearToken()
          // Reload to redirect to login page if not already there
          // if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          //   window.location.reload()
          // }
        }
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
    return this.request<{ access_token: string; refresh_token: string; type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ message: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async verifyCode(email: string, code: string) {
    return this.request<{ message: string; access_token?: string; type?: string }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
  }

  async resendCode(email: string) {
    return this.request<{ message: string }>("/auth/resend-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async googleLogin(token: string) {
    return this.request<{ access_token: string; refresh_token: string; type: string }>("/auth/google-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async logout() {
    // We send the access token, backend will invalidate the refresh token.
    const result = await this.request("/auth/logout", { method: "POST" })
    this.clearToken()
    return result
  }

  async getMe() {
    return this.request("/auth/users/me")
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ access_token: string; refresh_token: string; type: string }>(
      "/auth/token/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: { "X-No-Retry": "true" },
      }
    )
  }

  // Chat methods
  async sendMessage(
    messages: { role: string; content: string }[],
    mode: string = "search",
    conversationId?: string,
    ipGeolocation?: any
  ): Promise<ApiResponse<{
    response: string
    conversation_id: string
    tool_output?: any
    multiple_results?: { [key: string]: any }  // Для множественных результатов
    destination_city?: string
    destination_coordinates?: { lat: number; lng: number }
    people_count?: number
    budget_level?: number
  }>> {
    const params = new URLSearchParams()
    if (conversationId && conversationId !== "null" && conversationId !== "undefined") {
      params.append("conversation_id", conversationId)
    }

    const requestBody: any = { messages }
    if (mode) {
      requestBody.mode = mode
    }
    if (ipGeolocation) {
      requestBody.location = {
        country: ipGeolocation.country,
        country_name: ipGeolocation.country_name,
        city: ipGeolocation.city,
        region: ipGeolocation.region,
        ip: ipGeolocation.ip
      }
    }

    const url = `/chat/?${params.toString()}`
    return this.request<{
      response: string
      conversation_id: string
      tool_output?: any
      destination_city?: string
      destination_coordinates?: { lat: number; lng: number }
    }>(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
  }

  async sendMessageStream(
    messages: Array<{ role: string; content: string }>, 
    mode?: string,
    conversationId?: string,
    ipGeolocation?: { ip: string; country: string; country_name: string; city: string; region?: string }
  ): Promise<ReadableStream<Uint8Array>> {
    const params = new URLSearchParams()
    if (conversationId && conversationId !== "null" && conversationId !== "undefined") {
      params.append("conversation_id", conversationId)
    }

    const requestBody: any = { messages }
    if (mode) {
      requestBody.mode = mode
    }
    if (ipGeolocation) {
      requestBody.location = {
        country: ipGeolocation.country,
        country_name: ipGeolocation.country_name,
        city: ipGeolocation.city,
        region: ipGeolocation.region,
        ip: ipGeolocation.ip
      }
    }

    const url = `${this.baseURL}/chat/stream?${params.toString()}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.body!
  }

  // Оставляем только sendMessage для обычного POST /chat
  // sendMessageStream больше не используется для чата с эффектом стриминга

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
    return this.request<{
      id: string
      user_id: number
      created_at: string
      last_updated: string
      title?: string
      destination?: string
      people_count?: number
      budget_level?: number
      messages: Array<{
        id: number
        role: string
        content: string
        timestamp: string
      }>
    }>(`/chat/conversation/${conversationId}`)
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

  // Explore methods
  async exploreCities(limit: number = 50) {
    return this.request<ExploreResponse>("/explore/cities", {
      method: "POST",
      body: JSON.stringify({ limit }),
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

  // Roadmap methods
  async getUserRoadmaps(activeOnly: boolean = true) {
    return this.request(`/roadmap/?active_only=${activeOnly}`)
  }

  async getRoadmapById(roadmapId: number) {
    return this.request(`/roadmap/${roadmapId}`)
  }

  async getRoadmapCoordinates(roadmapId: number) {
    return this.request(`/roadmap/${roadmapId}/coordinates`)
  }

  // Demo chat (no auth)
  async sendDemoMessage(messages: Array<{ role: string; content: string }>) {
    return this.request<{ response: string }>("/chat/demo", {
      method: "POST",
      body: JSON.stringify({ messages }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
