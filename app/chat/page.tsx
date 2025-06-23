"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Send, User, Bot, Sparkles, X, Menu, Plus, Loader2, MapPin, CheckCircle2, Heart, Sun, Moon, LogOut } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { TicketDisplay } from "@/components/displays/ticket-display"
import { HotelDisplay } from "@/components/displays/hotels-display"
import { InteractiveMap } from "@/components/interactive-map"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolOutput?: any
}

interface Conversation {
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [bookedItems, setBookedItems] = useState<Record<string, any>>({})
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapWidth, setMapWidth] = useState(35) // Map width as percentage
  const [isResizing, setIsResizing] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-focus input on mount and after sending
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load conversations from URL params on mount
  useEffect(() => {
    const conversationId = searchParams.get("c")
    if (conversationId) {
      setCurrentConversationId(conversationId)
      loadConversation(conversationId)
    }
  }, [searchParams])

  // Auto-close sidebar on mobile when conversation loads
  useEffect(() => {
    if (currentConversationId && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [currentConversationId])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    loadBookings()

    // Check for pending trip prompt from landing page
    const pendingPrompt = sessionStorage.getItem("pendingTripPrompt")
    if (pendingPrompt) {
      setInput(pendingPrompt)
      sessionStorage.removeItem("pendingTripPrompt")
    }
  }, [isAuthenticated, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    const { data } = await apiClient.getConversations()
    if (data) {
      setConversations(data)
    }
  }

  const loadBookings = async () => {
    const { data } = await apiClient.getBookings()
    if (data) {
      const ids = new Set<string>()
      data.forEach((b: any) => {
        const id = b.data?.id || b.data?.combination_id
        if (id) ids.add(id)
      })
      setBookedIds(ids)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const messagesToSend = [{ role: "user", content: input }]

      const { data, error } = await apiClient.sendMessage(messagesToSend, currentConversationId || undefined)

      // Log the backend response structure
      console.log("Backend Response:", {
        response: data?.response,
        conversation_id: data?.conversation_id,
        tool_output: data?.tool_output,
        full_data: data
      })

      if (data && !error) {
        // Prepare tool output combined with search_result_id
        let combinedOutput: any = data.tool_output
        const srArr = (data as any).search_results
        if (srArr && Array.isArray(srArr) && srArr.length > 0) {
          const mapped = srArr.map((sr: any) => {
            // Create a copy of the search result data
            const resultData = { ...sr.data }
            
            // Add search_result_id to the main object
            resultData.search_result_id = sr.id
            resultData.type = sr.search_type
            
            // Propagate search_result_id to all nested items
            if (resultData.flights && Array.isArray(resultData.flights)) {
              resultData.flights = resultData.flights.map((flight: any) => ({
                ...flight,
                search_result_id: sr.id
              }))
            }
            
            if (resultData.hotels && Array.isArray(resultData.hotels)) {
              resultData.hotels = resultData.hotels.map((hotel: any) => ({
                ...hotel,
                search_result_id: sr.id
              }))
            }
            
            if (resultData.restaurants && Array.isArray(resultData.restaurants)) {
              resultData.restaurants = resultData.restaurants.map((restaurant: any) => ({
                ...restaurant,
                search_result_id: sr.id
              }))
            }
            
            if (resultData.items && Array.isArray(resultData.items)) {
              resultData.items = resultData.items.map((item: any) => ({
                ...item,
                search_result_id: sr.id
              }))
            }
            
            return resultData
          })
          combinedOutput = mapped.length === 1 ? mapped[0] : mapped
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          toolOutput: combinedOutput,
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (!currentConversationId) {
          setCurrentConversationId(data.conversation_id)
          loadConversations()
        }
      } else {
        throw new Error(error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    localStorage.removeItem("lastConversationId")
    setInput("")
  }

  const loadConversation = async (conversationId: string) => {
    const { data } = await apiClient.getConversation(conversationId)
    if (data && (data as any).messages) {
      // Load search results for the conversation
      const { data: searchResults } = await apiClient.getConversationSearchResults(conversationId)
      
      console.log("Search results:", searchResults)
      console.log("Search results detailed:", {
        searchResults,
        length: searchResults?.length,
        firstResult: searchResults?.[0],
        firstResultKeys: searchResults?.[0] ? Object.keys(searchResults[0]) : [],
        firstResultData: searchResults?.[0]?.data,
        firstResultDataKeys: searchResults?.[0]?.data ? Object.keys(searchResults[0].data) : []
      })

      const loadedMessages: Message[] = (data as any).messages.map((msg: any) => {
        let toolOutput = msg.tool_output
        
        console.log("Processing message:", {
          msgId: msg.id,
          role: msg.role,
          hasToolOutput: !!toolOutput,
          toolOutputKeys: toolOutput ? Object.keys(toolOutput) : []
        })
        
        // If this message has tool_output and we have search results, process it
        if (toolOutput && searchResults && Array.isArray(searchResults)) {
          const srArr = searchResults
          if (srArr.length > 0) {
            console.log("Replacing toolOutput with search results for message", msg.id)
            
            const mapped = srArr.map((sr: any) => {
              // Create a copy of the search result data
              const resultData = { ...sr.data }
              
              // Add search_result_id to the main object
              resultData.search_result_id = sr.id
              resultData.type = sr.search_type
              
              // Propagate search_result_id to all nested items
              if (resultData.flights && Array.isArray(resultData.flights)) {
                resultData.flights = resultData.flights.map((flight: any) => ({
                  ...flight,
                  search_result_id: sr.id
                }))
              }
              
              if (resultData.hotels && Array.isArray(resultData.hotels)) {
                resultData.hotels = resultData.hotels.map((hotel: any) => ({
                  ...hotel,
                  search_result_id: sr.id
                }))
              }
              
              if (resultData.restaurants && Array.isArray(resultData.restaurants)) {
                resultData.restaurants = resultData.restaurants.map((restaurant: any) => ({
                  ...restaurant,
                  search_result_id: sr.id
                }))
              }
              
              if (resultData.items && Array.isArray(resultData.items)) {
                resultData.items = resultData.items.map((item: any) => ({
                  ...item,
                  search_result_id: sr.id
                }))
              }
              
              return resultData
            })
            
            const newToolOutput = mapped.length === 1 ? mapped[0] : mapped
            console.log("New toolOutput:", {
              original: toolOutput,
              new: newToolOutput,
              mapped: mapped
            })
            
            toolOutput = newToolOutput
          }
        }
        
        return {
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          toolOutput: toolOutput,
        }
      })
      setMessages(loadedMessages)
      setCurrentConversationId(conversationId)
      loadRoadmap(conversationId)
    }
  }

  const loadRoadmap = async (conversationId: string) => {
    const { data } = await apiClient.getRoadmap(conversationId)
    if (data) {
      const items: any[] = []
      const pushItems = (arr: any[] | undefined, type: string) => {
        if (arr && Array.isArray(arr)) {
          arr.forEach((item) => items.push({ ...item, type }))
        }
      }
      pushItems(data.tickets, "flights")
      pushItems(data.hotels, "hotels")
      pushItems(data.restaurants, "restaurants")
      pushItems(data.activities, "activities")
      setBookedItems(items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {} as Record<string, any>))
    }
  }

  // Reload roadmap when conversation id changes
  useEffect(() => {
    if (currentConversationId) {
      loadRoadmap(currentConversationId)
    }
  }, [currentConversationId])

  const handleBooked = (bookedItem: any, id: string, type: string) => {
    setBookedItems((prev) => ({ ...prev, [id]: { ...bookedItem, type } }))
    setBookedIds(new Set(bookedIds).add(id))
  }

  const handleRemoveItem = (id: string) => {
    setBookedItems((prev) => {
      const newItems = { ...prev }
      delete newItems[id]
      return newItems
    })
    const newBookedIds = new Set(bookedIds)
    newBookedIds.delete(id)
    setBookedIds(newBookedIds)
  }

  const handleClearAll = () => {
    setBookedItems({})
    setBookedIds(new Set())
  }

  const parseMessageContent = (content: string, toolOutput?: any) => {
    // Always remove ticket and hotel tags from content for clean display
    const textContent = content.replace(/<(?:tickets|hotels)>[\s\S]*?<\/(?:tickets|hotels)>/g, '').trim()
    
    // Show tickets if we have tool_output data (regardless of tags)
    if (toolOutput) {
      return {
        text: textContent,
        showTickets: true,
        toolOutput
      }
    }
    
    return {
      text: textContent,
      showTickets: false,
      toolOutput: null
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const containerWidth = window.innerWidth - 320 // Subtract sidebar width
      const rightOffset = window.innerWidth - e.clientX
      const newMapWidth = Math.max(20, Math.min(60, (rightOffset / containerWidth) * 100))
      setMapWidth(newMapWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  console.log(messages)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        w-64 md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">TravelAI</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 mb-4">
              {[
                { icon: MessageCircle, label: "Chats", active: true, color: "text-blue-600 dark:text-blue-400", activeColor: "bg-blue-100 dark:bg-blue-900/30" },
                { icon: MapPin, label: "Explore", color: "text-slate-600 dark:text-slate-400" },
                { icon: CheckCircle2, label: "Bookings", color: "text-slate-600 dark:text-slate-400" },
                { icon: Heart, label: "Saved", color: "text-slate-600 dark:text-slate-400" },
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start h-9 text-sm transition-all duration-200 ${
                    item.active 
                      ? `${item.activeColor} text-blue-700 dark:text-blue-300` 
                      : `hover:bg-slate-100 dark:hover:bg-slate-700 ${item.color}`
                  }`}
                  onClick={() => {
                    if (item.label === "Bookings") {
                      router.push("/bookings")
                    } else if (!item.active) {
                      // Handle other navigation
                    }
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                  {item.label === "Chats" && conversations.length > 0 && (
                    <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                      {conversations.length}
                    </span>
                  )}
                </Button>
              ))}
            </nav>

            {/* New Chat Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Chats</h3>
              <Button
                onClick={startNewConversation}
                variant="ghost"
                size="sm"
                className="text-blue-600 dark:text-blue-400 h-8 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentConversationId === conversation.id
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => {
                    setCurrentConversationId(conversation.id)
                    loadConversation(conversation.id)
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {conversation.title || 
                     (conversation.messages.length > 0
                       ? conversation.messages[0].content.slice(0, 40) + "..."
                       : "New conversation")}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
              {conversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <div className="flex items-center space-x-3">
              <Avatar>
                {user?.picture ? (
                  <AvatarImage src={user.picture} alt={user.name || "User"} />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Chat and Map */}
      <div className="flex-1 flex min-w-0">
        {/* Chat Area */}
        <div className="flex flex-col min-w-0" style={{ width: `${100 - mapWidth}%` }}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Travel Assistant</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-3 md:p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">
                  Welcome to Your Travel Assistant
                </h2>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 md:mb-8 max-w-md">
                  Ask me anything about flights, hotels, restaurants, or activities. I'll help you find and book the perfect options for your trip.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl">
                  {[
                    { icon: "✈️", text: "Find flights to Paris" },
                    { icon: "🏨", text: "Hotels in Tokyo" },
                    { icon: "🍽️", text: "Best restaurants in Rome" },
                    { icon: "🎯", text: "Things to do in New York" },
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion.text)}
                      className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg md:text-xl">{suggestion.icon}</span>
                        <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">{suggestion.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="space-y-4 md:space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 md:px-4 py-2 md:py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="text-sm md:text-base">{message.content}</div>
                      {message.toolOutput && (
                        <div className="mt-3 md:mt-4">
                          {(message.toolOutput.search_parameters || message.toolOutput.search_params || message.toolOutput.hotels || message.toolOutput.destination) ? (
                            <HotelDisplay
                              toolOutput={message.toolOutput}
                              bookedIds={bookedIds}
                              onBooked={handleBooked}
                            />
                          ) : (
                            <TicketDisplay
                              toolOutput={message.toolOutput}
                              bookedIds={bookedIds}
                              onBooked={handleBooked}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto p-3 md:p-6">
            <form onSubmit={handleSendMessage} className="flex space-x-2 md:space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  placeholder="Ask about flights, hotels, restaurants, or activities..."
                  className="w-full p-3 md:p-4 pr-12 md:pr-16 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm md:text-base"
                  rows={1}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-2 md:p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
        </div>

        {/* Map Area */}
        <div className="bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700" style={{ width: `${mapWidth}%` }}>
          <InteractiveMap
            selectedItems={Object.values(bookedItems)}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
          />
        </div>
      </div>
    </div>
  )
}
