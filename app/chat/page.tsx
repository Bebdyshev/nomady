"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Send, User, Bot, Sparkles } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { TicketDisplay } from "@/components/displays/ticket-display"
import { HotelDisplay } from "@/components/displays/hotels-display"
import { InteractiveMap } from "@/components/interactive-map"

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
  messages: Array<{
    id: number
    role: string
    content: string
    timestamp: string
  }>
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mapWidth, setMapWidth] = useState(50) // percentage
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    loadConversations()
    loadBookings()

    // Check for pending trip prompt from landing page
    const pendingPrompt = sessionStorage.getItem("pendingTripPrompt")
    if (pendingPrompt) {
      setInputMessage(pendingPrompt)
      sessionStorage.removeItem("pendingTripPrompt")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Restore last opened conversation if available
    if (isAuthenticated) {
      const lastId = localStorage.getItem("lastConversationId")
      if (lastId && !currentConversationId) {
        setCurrentConversationId(lastId)
        loadConversation(lastId)
      }
    }
  }, [isAuthenticated])

  // Persist current conversation id
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem("lastConversationId", currentConversationId)
    }
  }, [currentConversationId])

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
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const messagesToSend = [{ role: "user", content: inputMessage }]

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

  const startNewChat = () => {
    setMessages([])
    setCurrentConversationId(null)
    localStorage.removeItem("lastConversationId")
    setInputMessage("")
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
      setSelectedItems(items)
    }
  }

  // Reload roadmap when conversation id changes
  useEffect(() => {
    if (currentConversationId) {
      loadRoadmap(currentConversationId)
    }
  }, [currentConversationId])

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    setSelectedItems([])
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const containerWidth = window.innerWidth - (sidebarCollapsed ? 64 : 256) // sidebar width
      const newMapWidth = Math.max(20, Math.min(80, ((containerWidth - e.clientX + (sidebarCollapsed ? 64 : 256)) / containerWidth) * 100))
      setMapWidth(newMapWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, sidebarCollapsed])

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

  console.log(messages)

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onConversationSelect={loadConversation}
        onNewChat={startNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-w-0" style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
        {/* Chat Area */}
        <div className="flex flex-col" style={{ width: `${100 - mapWidth}%` }}>
          {/* Chat Header */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 bg-white dark:bg-slate-800">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                {currentConversationId ? "Travel Planning Chat" : "New Trip Planning"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered travel assistant</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6 bg-white dark:bg-slate-800">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Plan Your Perfect Trip</h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Tell me where you'd like to go and I'll help you create an amazing itinerary
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {[
                      "Plan a 5-day trip to Tokyo for 2 people",
                      "Find the best restaurants in Paris",
                      "Create an itinerary for a weekend in New York",
                      "Suggest activities for a family trip to London",
                    ].map((suggestion, index) => (
                      <Card
                        key={index}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        onClick={() => setInputMessage(suggestion)}
                      >
                        <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</p>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 ${message.role === "user" ? "ml-3" : "mr-3"}`}>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          message.role === "user" ? "bg-blue-600" : "bg-green-100 dark:bg-green-900"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      }`}
                    >
                      {(() => {
                        const parsedContent = parseMessageContent(message.content, message.toolOutput)
                        return (
                          <>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{parsedContent.text}</p>
                            {parsedContent.showTickets && parsedContent.toolOutput && (
                              (parsedContent.toolOutput.properties ? (
                                <HotelDisplay
                                  toolOutput={parsedContent.toolOutput}
                                  bookedIds={bookedIds}
                                  onBooked={(bookedItem, id, type) => {
                                    setBookedIds(new Set(bookedIds).add(id))
                                    const safeId = bookedItem.id || bookedItem.combination_id || id
                                    setSelectedItems((prev)=>{
                                      if (prev.some(it=>it.id===safeId)) return prev
                                      return [...prev, { ...bookedItem, id: safeId, type }]
                                    })
                                  }}
                                />
                              ) : (
                                <TicketDisplay 
                                  toolOutput={parsedContent.toolOutput}
                                  bookedIds={bookedIds}
                                  onBooked={(bookedItem, id, type) => {
                                    setBookedIds(new Set(bookedIds).add(id))
                                    const safeId = bookedItem.id || bookedItem.combination_id || id
                                    setSelectedItems((prev)=>{
                                      if (prev.some(it=>it.id===safeId)) return prev
                                      return [...prev, { ...bookedItem, id: safeId, type }]
                                    })
                                  }}
                                />
                              ))
                            )}
                          </>
                        )
                      })()}
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex mr-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                      <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Ask anything about your trip..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                    className="pr-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
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
        <div className="bg-slate-50 dark:bg-slate-900" style={{ width: `${mapWidth}%` }}>
          <InteractiveMap
            selectedItems={selectedItems}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
          />
        </div>
      </div>
    </div>
  )
}
