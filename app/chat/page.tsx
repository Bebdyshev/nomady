"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Send, User, X, Menu, Plus, Loader2, MapPin, CheckCircle2, Heart, Sun, Moon, LogOut } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { TicketDisplay } from "@/components/displays/ticket-display"
import { HotelDisplay } from "@/components/displays/hotels-display"
import { InteractiveMap } from "@/components/interactive-map"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
import { SearchAnimation, TypingIndicator } from "@/components/search-animations"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Disable static generation for this page
export const dynamic = "force-dynamic"

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
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingToolOutput, setStreamingToolOutput] = useState<any>(null)
  const [activeSearches, setActiveSearches] = useState<Set<string>>(new Set())
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

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
  }, [messages, showTypingIndicator, activeSearches])

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
    } else {
      // If no URL param, try to load last conversation from localStorage
      const lastConversationId = localStorage.getItem("lastConversationId")
      if (lastConversationId && conversations.length > 0) {
        // Check if the conversation still exists
        const conversationExists = conversations.find((c) => c.id === lastConversationId)
        if (conversationExists) {
          setCurrentConversationId(lastConversationId)
          loadConversation(lastConversationId)
        }
      }
    }
  }, [searchParams, conversations])

  // Save current conversation ID to localStorage whenever it changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem("lastConversationId", currentConversationId)
      // Update URL to include conversation ID
      const url = new URL(window.location.href)
      url.searchParams.set("c", currentConversationId)
      window.history.replaceState({}, "", url.toString())
    }
  }, [currentConversationId])

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

  const requestGeolocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    try {
      setLocationError(null)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        )
      })

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }

      setUserLocation(location)
      setLocationEnabled(true)
      setLocationError(null)
    } catch (error: any) {
      console.error("Error getting location:", error)
      let errorMessage = "Unable to get your location"
      
      if (error.code === 1) {
        errorMessage = "Location access denied. Please enable location permissions."
      } else if (error.code === 2) {
        errorMessage = "Location information is unavailable."
      } else if (error.code === 3) {
        errorMessage = "Location request timed out."
      }
      
      setLocationError(errorMessage)
      setLocationEnabled(false)
      setUserLocation(null)
    }
  }

  const toggleLocation = () => {
    if (locationEnabled) {
      setLocationEnabled(false)
      setUserLocation(null)
      setLocationError(null)
    } else {
      requestGeolocation()
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsStreaming(true)
    setShowTypingIndicator(true)
    setStreamingMessage("")
    setStreamingToolOutput(null)

    // Show typing indicator for a brief moment before streaming starts
    setTimeout(() => {
      setShowTypingIndicator(false)
    }, 1000)

    // Add temporary streaming message
    const streamingMessageId = (Date.now() + 1).toString()
    const tempMessage: Message = {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, tempMessage])
    }, 1000)

    try {
      const messagesToSend = [{ role: "user", content: input }]
      let fullResponse = ""
      let finalToolOutput: any = null
      let finalConversationId: string | null = null

      for await (const chunk of apiClient.sendMessageStream(
        messagesToSend,
        currentConversationId || undefined,
        () => {
          // onToolStart - show tool is starting
          console.log("Tool started")
        },
        (output) => {
          // onToolOutput - handle tool output
          setStreamingToolOutput(output)
        },
        userLocation && locationEnabled ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: userLocation.accuracy
        } : undefined
      )) {
        if (chunk.type === "text_chunk") {
          fullResponse += chunk.data
          setStreamingMessage(fullResponse)
          finalConversationId = chunk.conversation_id || finalConversationId

          // Check for search tags in the new chunk
          const searchStartTags = chunk.data.match(
            /<(searching_tickets|searching_hotels|searching_restaurants|searching_activities)>/g,
          )
          const searchEndTags = chunk.data.match(
            /<\/(searching_tickets|searching_hotels|searching_restaurants|searching_activities)>/g,
          )

          if (searchStartTags || searchEndTags) {
            setActiveSearches((prev) => {
              const newSearches = new Set(prev)

              // Add new searches
              searchStartTags?.forEach((tag: string) => {
                const searchType = tag.replace(/<searching_|>/g, "")
                newSearches.add(searchType)
              })

              // Remove completed searches
              searchEndTags?.forEach((tag: string) => {
                const searchType = tag.replace(/<\/searching_|>/g, "")
                newSearches.delete(searchType)
              })

              return newSearches
            })
          }

          // Update the streaming message in real-time
          setMessages((prev) =>
            prev.map((msg) => (msg.id === streamingMessageId ? { ...msg, content: fullResponse } : msg)),
          )
        } else if (chunk.type === "tool_output") {
          finalToolOutput = chunk.data
          setStreamingToolOutput(chunk.data)
        } else if (chunk.type === "complete") {
          finalConversationId = chunk.conversation_id || finalConversationId
          finalToolOutput = chunk.tool_output || finalToolOutput

          // Process search results like in the original code
          let combinedOutput: any = finalToolOutput
          const searchResults = chunk.search_results
          if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
            const mapped = searchResults.map((sr: any) => {
            const resultData = { ...sr.data }
            resultData.search_result_id = sr.id
            resultData.type = sr.search_type
            
              // Propagate search_result_id to nested items
            if (resultData.flights && Array.isArray(resultData.flights)) {
              resultData.flights = resultData.flights.map((flight: any) => ({
                ...flight,
                  search_result_id: sr.id,
              }))
            }
            
            if (resultData.hotels && Array.isArray(resultData.hotels)) {
              resultData.hotels = resultData.hotels.map((hotel: any) => ({
                ...hotel,
                  search_result_id: sr.id,
              }))
            }
            
            if (resultData.restaurants && Array.isArray(resultData.restaurants)) {
              resultData.restaurants = resultData.restaurants.map((restaurant: any) => ({
                ...restaurant,
                  search_result_id: sr.id,
              }))
            }
            
            if (resultData.items && Array.isArray(resultData.items)) {
              resultData.items = resultData.items.map((item: any) => ({
                ...item,
                  search_result_id: sr.id,
              }))
            }
            
            return resultData
          })
          combinedOutput = mapped.length === 1 ? mapped[0] : mapped
        }

          // Update final message with tool output
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId ? { ...msg, content: fullResponse, toolOutput: combinedOutput } : msg,
            ),
          )

        if (!currentConversationId) {
            setCurrentConversationId(finalConversationId)
          loadConversations()
        }
        } else if (chunk.type === "error") {
          throw new Error(chunk.data || "Streaming error")
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Replace streaming message with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
        content: "Sorry, I encountered an error. Please try again.",
                toolOutput: null,
      }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setShowTypingIndicator(false)
      setStreamingMessage("")
      setStreamingToolOutput(null)
      setActiveSearches(new Set())
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    localStorage.removeItem("lastConversationId")
    setInput("")
    
    // Clear conversation ID from URL
    const url = new URL(window.location.href)
    url.searchParams.delete("c")
    window.history.replaceState({}, "", url.toString())
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
        firstResultDataKeys: searchResults?.[0]?.data ? Object.keys(searchResults[0].data) : [],
      })

      const loadedMessages: Message[] = (data as any).messages.map((msg: any) => {
        let toolOutput = msg.tool_output
        
        console.log("Processing message:", {
          msgId: msg.id,
          role: msg.role,
          hasToolOutput: !!toolOutput,
          toolOutputKeys: toolOutput ? Object.keys(toolOutput) : [],
        })
        
        // If this message has tool_output and we have search results, process it
        if (toolOutput && searchResults && Array.isArray(searchResults)) {
          const srArr = searchResults
          if (srArr.length > 0) {
            // Check if toolOutput already has valid data
            const hasValidTickets =
              toolOutput.flights && Array.isArray(toolOutput.flights) && toolOutput.flights.length > 0
            const hasValidHotels = toolOutput.hotels && Array.isArray(toolOutput.hotels) && toolOutput.hotels.length > 0
            const hasValidRestaurants =
              toolOutput.restaurants && Array.isArray(toolOutput.restaurants) && toolOutput.restaurants.length > 0
            
            // Check what type of data the search results contain
            const searchHasTickets = srArr.some(
              (sr) => sr.data.flights && Array.isArray(sr.data.flights) && sr.data.flights.length > 0,
            )
            const searchHasHotels = srArr.some(
              (sr) => sr.data.hotels && Array.isArray(sr.data.hotels) && sr.data.hotels.length > 0,
            )
            const searchHasRestaurants = srArr.some(
              (sr) => sr.data.restaurants && Array.isArray(sr.data.restaurants) && sr.data.restaurants.length > 0,
            )
            
            // Only replace if:
            // 1. No valid data exists, OR
            // 2. Search results match the same data type, OR  
            // 3. Original data is empty but search has results
            const shouldReplace =
              (!hasValidTickets && !hasValidHotels && !hasValidRestaurants) ||
                                   (hasValidTickets && searchHasTickets) ||
                                   (hasValidHotels && searchHasHotels) ||
                                   (hasValidRestaurants && searchHasRestaurants) ||
              (toolOutput.total_found === 0 && srArr.some((sr) => sr.data.total_found > 0))
            
            if (shouldReplace) {
              console.log("Replacing toolOutput with search results for message", msg.id, {
                reason:
                  !hasValidTickets && !hasValidHotels && !hasValidRestaurants
                    ? "no valid data"
                    : hasValidTickets && searchHasTickets
                      ? "matching tickets"
                      : hasValidHotels && searchHasHotels
                        ? "matching hotels"
                        : hasValidRestaurants && searchHasRestaurants
                          ? "matching restaurants"
                          : "empty data with new results",
              })
              
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
                    search_result_id: sr.id,
                  }))
                }
                
                if (resultData.hotels && Array.isArray(resultData.hotels)) {
                  resultData.hotels = resultData.hotels.map((hotel: any) => ({
                    ...hotel,
                    search_result_id: sr.id,
                  }))
                }
                
                if (resultData.restaurants && Array.isArray(resultData.restaurants)) {
                  resultData.restaurants = resultData.restaurants.map((restaurant: any) => ({
                    ...restaurant,
                    search_result_id: sr.id,
                  }))
                }
                
                if (resultData.items && Array.isArray(resultData.items)) {
                  resultData.items = resultData.items.map((item: any) => ({
                    ...item,
                    search_result_id: sr.id,
                  }))
                }
                
                return resultData
              })
              
              const newToolOutput = mapped.length === 1 ? mapped[0] : mapped
              console.log("New toolOutput:", {
                original: toolOutput,
                new: newToolOutput,
                mapped: mapped,
              })
              
              toolOutput = newToolOutput
            } else {
              console.log("Keeping existing toolOutput for message", msg.id, "because:", {
                hasValidTickets,
                hasValidHotels,
                hasValidRestaurants,
                searchHasTickets,
                searchHasHotels,
                searchHasRestaurants,
                reason: "data type mismatch or already has valid data",
              })
            }
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
    // Remove all search tags and ticket/hotel tags from content for clean display
    const textContent = content
      .replace(/<(?:searching_tickets|searching_hotels|searching_restaurants|searching_activities)>/g, "")
      .replace(/<\/(?:searching_tickets|searching_hotels|searching_restaurants|searching_activities)>/g, "")
      .replace(/<(?:tickets|hotels)>[\s\S]*?<\/(?:tickets|hotels)>/g, "")
      .trim()
    
    // Show tickets if we have tool_output data (regardless of tags)
    if (toolOutput) {
      return {
        text: textContent,
        showTickets: true,
        toolOutput,
      }
    }
    
    return {
      text: textContent,
      showTickets: false,
      toolOutput: null,
    }
  }

  // Helper function to find hotel data in toolOutput
  const findHotelData = (toolOutput: any) => {
    if (!toolOutput) return null
    
    // If it's an array, find the hotel data object
    if (Array.isArray(toolOutput)) {
      const hotelData = toolOutput.find(
        (item) =>
        item.hotels || 
        item.properties || 
        item.destination || 
          (item.type !== "tickets" && (item.total_found > 0 || item.success)),
      )
      return hotelData || null
    }
    
    // If it's a single object, return it if it contains hotel data
    if (toolOutput.hotels || toolOutput.properties || toolOutput.destination) {
      return toolOutput
    }
    
    return null
  }

  // Helper function to find ticket data in toolOutput  
  const findTicketData = (toolOutput: any) => {
    if (!toolOutput) return null
    
    // If it's an array, find the ticket data object
    if (Array.isArray(toolOutput)) {
      const ticketData = toolOutput.find(
        (item) =>
        item.flights || 
        item.type === "tickets" ||
        item.type === "flights" ||
          (item.items && Array.isArray(item.items)),
      )
      return ticketData || toolOutput[0] // fallback to first item if no specific ticket data found
    }
    
    // If it's a single object, return it
    return toolOutput
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
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  console.log(messages)

  // Markdown Message Component for bot responses
  const MarkdownMessage = ({ content }: { content: string }) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-slate-900 dark:text-white">{children}</h3>,
            
            // Paragraphs
            p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-700 dark:text-slate-300">{children}</p>,
            
            // Lists
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            
            // Links
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                {children}
              </a>
            ),
            
            // Code
            code: ({ children, className }) => {
              const isInline = !className
              if (isInline) {
                return (
                  <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200">
                    {children}
                  </code>
                )
              }
              return (
                <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto mb-2">
                {children}
              </pre>
            ),
            
            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-left font-medium text-slate-900 dark:text-white text-sm">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                {children}
              </td>
            ),
            
            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-2 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r">
                {children}
              </blockquote>
            ),
            
            // Strong and emphasis
            strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
            em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
            
            // Horizontal rule
            hr: () => <hr className="border-slate-200 dark:border-slate-700 my-3" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        w-64 md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Logo width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Nomady</span>
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
                {
                  icon: MessageCircle,
                  label: "Chats",
                  active: true,
                  color: "text-blue-600 dark:text-blue-400",
                  activeColor: "bg-blue-100 dark:bg-blue-900/30",
                },
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
                  <AvatarImage src={user.picture || "/placeholder.svg"} alt={user?.name || "User"} />
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
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
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
                    Ask me anything about flights, hotels, restaurants, or activities. I'll help you find and book the
                    perfect options for your trip.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl">
                  {[
                    { icon: "✈️", text: "Find flights to Paris" },
                    { icon: "🏨", text: "Hotels in Tokyo" },
                    { icon: "🍽️", text: "Best restaurants in Rome" },
                    { icon: "🎯", text: "Things to do in New York" },
                  ].map((suggestion, index) => (
                      <motion.button
                      key={index}
                      onClick={() => setInput(suggestion.text)}
                      className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg md:text-xl">{suggestion.icon}</span>
                          <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                            {suggestion.text}
                          </span>
                      </div>
                      </motion.button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="space-y-4 md:space-y-6">
                  <AnimatePresence>
                {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 md:px-4 py-2 md:py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="text-sm md:text-base">
                            {/* Show search animations instead of text when searches are active */}
                            {message.role === "assistant" && 
                             isStreaming && 
                             message.content === streamingMessage && 
                             activeSearches.size > 0 ? (
                              <div className="space-y-2">
                                <AnimatePresence>
                                  {Array.from(activeSearches).map((searchType) => (
                                    <SearchAnimation key={searchType} searchType={searchType} />
                                  ))}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <>
                                {message.role === "assistant" ? (
                                  <MarkdownMessage content={parseMessageContent(message.content).text} />
                                ) : (
                                  parseMessageContent(message.content).text
                                )}
                                {/* Show streaming cursor for assistant messages during streaming */}
                                {message.role === "assistant" && 
                                 isStreaming && 
                                 message.content === streamingMessage && 
                                 activeSearches.size === 0 && (
                                  <motion.span
                                    className="inline-block w-1 h-4 bg-slate-600 dark:bg-slate-300 ml-1"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                                  />
                                )}
                              </>
                            )}
                      </div>

                      {message.toolOutput && (
                            <motion.div
                              className="mt-3 md:mt-4"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              {message.content.includes("<hotels>") || message.content.includes("Hotels in")
                                ? (() => {
                              const hotelData = findHotelData(message.toolOutput)
                              return hotelData ? (
                                <HotelDisplay
                                  toolOutput={hotelData}
                                  bookedIds={bookedIds}
                                  onBooked={handleBooked}
                                />
                              ) : (
                                <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                                  No hotel data found
                                </div>
                              )
                            })()
                                : (() => {
                              const ticketData = findTicketData(message.toolOutput)
                              return ticketData ? (
                                <TicketDisplay
                                  toolOutput={ticketData}
                                  bookedIds={bookedIds}
                                  onBooked={handleBooked}
                                />
                              ) : (
                                <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                                  No ticket data found
                                </div>
                              )
                                  })()}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  <AnimatePresence>{showTypingIndicator && <TypingIndicator />}</AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto p-3 md:p-6">
            {/* Location Status */}
            {locationError && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
              </div>
            )}
            {locationEnabled && userLocation && (
              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location sharing enabled (±{Math.round(userLocation.accuracy)}m accuracy)
                </p>
              </div>
            )}
            
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
                  className="w-full p-3 md:p-4 pr-24 md:pr-28 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm md:text-base"
                  rows={1}
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
                
                {/* Location Toggle Button */}
                <motion.button
                  type="button"
                  onClick={toggleLocation}
                  className={`absolute right-12 md:right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    locationEnabled
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={locationEnabled ? "Disable location sharing" : "Enable location sharing"}
                >
                  <MapPin className={`h-4 w-4 ${locationEnabled ? "fill-current" : ""}`} />
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim() || isStreaming}
                  className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-2 md:p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading || isStreaming ? (
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </motion.button>
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
      <div
        className="bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700"
        style={{ width: `${mapWidth}%` }}
      >
        <InteractiveMap
          selectedItems={Object.values(bookedItems)}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  )
}