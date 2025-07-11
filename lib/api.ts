const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export interface ApiResponse<T> {
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
    messages: Array<{ role: string; content: string }>, 
    conversationId?: string,
    ipGeolocation?: { ip: string; country: string; country_name: string; city: string; region?: string }
  ) {
    const params = new URLSearchParams()
    if (conversationId) {
      params.append("conversation_id", conversationId)
    }

    const requestBody: any = { messages }
    if (ipGeolocation) {
      requestBody.location = {
        country: ipGeolocation.country,
        country_name: ipGeolocation.country_name,
        city: ipGeolocation.city,
        region: ipGeolocation.region,
        ip: ipGeolocation.ip
      }
    }

    return this.request<{
      response: string
      conversation_id: string
      tool_output?: any
    }>(`/chat/?${params.toString()}`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
  }

  async *sendMessageStream(
    messages: Array<{ role: string; content: string }>, 
    conversationId?: string,
    onToolStart?: () => void,
    onToolOutput?: (output: any) => void,
    ipGeolocation?: { ip: string; country: string; country_name: string; city: string; region?: string }
  ): AsyncGenerator<{
    type: 'text_chunk' | 'tool_output' | 'complete' | 'error'
    data?: any
    conversation_id?: string
    tool_output?: any
    search_results?: any[]
    is_complete?: boolean
  }> {
    try {
      const params = new URLSearchParams()
      if (conversationId) {
        params.append("conversation_id", conversationId)
      }

      const url = `${this.baseURL}/chat/stream?${params.toString()}`
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const requestBody: any = { messages }
      if (ipGeolocation) {
        requestBody.location = {
          country: ipGeolocation.country,
          country_name: ipGeolocation.country_name,
          city: ipGeolocation.city,
          region: ipGeolocation.region,
          ip: ipGeolocation.ip
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Process complete lines
          const lines = buffer.split('\n')
          buffer = lines.pop() || "" // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'tool_start') {
                  onToolStart?.()
                } else if (data.type === 'tool_output') {
                  onToolOutput?.(data.data)
                  yield { type: 'tool_output', data: data.data }
                } else if (data.type === 'text_chunk') {
                  yield {
                    type: 'text_chunk',
                    data: data.data,
                    conversation_id: data.conversation_id,
                    is_complete: data.is_complete
                  }
                } else if (data.type === 'complete') {
                  yield {
                    type: 'complete',
                    conversation_id: data.conversation_id,
                    tool_output: data.tool_output,
                    search_results: data.search_results
                  }
                } else if (data.type === 'error') {
                  yield { type: 'error', data: data.data || data.error }
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      yield { 
        type: 'error', 
        data: error instanceof Error ? error.message : "Unknown error" 
      }
    }
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
