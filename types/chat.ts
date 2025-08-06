export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolOutput?: any
  multipleResults?: { [key: string]: any }  // Для множественных результатов
  mode?: "search" | "generate"
}

export interface ChatResponse {
  response: string
  conversation_id: string
  tool_output?: any
  multiple_results?: { [key: string]: any }  // Для множественных результатов
  search_results?: any[]
  destination_city?: string
  destination_coordinates?: { lat: number; lng: number }
  people_count?: number
  budget_level?: number  // 1-4: budget, average, high, premium
}

export interface Conversation {
  id: string
  user_id: number
  created_at: string
  last_updated: string
  title?: string
  mode?: "search" | "generate"
  messages: Array<{
    id: number
    role: string
    content: string
    timestamp: string
  }>
}

export interface IpGeolocation {
  ip: string
  country: string
  country_name: string
  city: string
  region?: string
  lat?: number
  lng?: number
} 