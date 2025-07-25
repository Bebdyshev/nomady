export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolOutput?: any
}

export interface Conversation {
  id: string
  user_id: number
  created_at: string
  last_updated: string
  title?: string
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
} 