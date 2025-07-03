"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/lib/i18n-client"
import { apiClient } from "@/lib/api"
import { InteractiveMap } from "@/components/interactive-map"
import { 
  MobileMapOverlay, 
  ChatHeader, 
  MessagesList, 
  ChatInput 
} from "@/components/chat"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { Message, Conversation, IpGeolocation } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, PaperclipIcon, User, Bot, Loader2, MoreVertical, Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import { GoogleSignInButton } from "@/components/google-signin-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Disable static generation for this page
export const dynamic = "force-dynamic"

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
  const resizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(35)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingToolOutput, setStreamingToolOutput] = useState<any>(null)
  const [activeSearches, setActiveSearches] = useState<Set<string>>(new Set())
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [ipGeolocation, setIpGeolocation] = useState<IpGeolocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const MIN_MAP_WIDTH = 30 // percent
  const MAX_MAP_WIDTH = 50 // percent

  // Auto-focus input on mount and after sending
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

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
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId)
      loadConversation(conversationId)
    } else if (!conversationId && currentConversationId) {
      // If no URL param but we have a current conversation, try to load last conversation from localStorage
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
  }, [searchParams])

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
    getIpGeolocation() // Get IP geolocation automatically

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

  // IP Geolocation function
  const getIpGeolocation = async () => {
    if (ipGeolocation) return // Already have location data

    setIsLoadingLocation(true)
    
    // Array of IP geolocation services to try
    const geoServices = [
      {
        name: 'ipapi.co',
        url: 'https://ipapi.co/json/',
        parser: (data: any) => ({
          ip: data.ip,
          country: data.country_code || data.country,
          country_name: data.country_name,
          city: data.city,
          region: data.region
        })
      },
      {
        name: 'ip-api.com',
        url: 'https://ip-api.com/json/',
        parser: (data: any) => ({
          ip: data.query,
          country: data.countryCode,
          country_name: data.country,
          city: data.city,
          region: data.regionName
        })
      },
      {
        name: 'ipinfo.io',
        url: 'https://ipinfo.io/json',
        parser: (data: any) => ({
          ip: data.ip,
          country: data.country,
          country_name: data.country, // ipinfo doesn't provide full country name in free tier
          city: data.city,
          region: data.region
        })
      }
    ]

    for (const service of geoServices) {
      try {
        console.log(`Trying ${service.name}...`)
        const response = await fetch(service.url)
        
        if (!response.ok) {
          console.warn(`${service.name} returned ${response.status}`)
          continue
        }
        
        const data = await response.json()
        console.log(`${service.name} response:`, data)
        
        // Check if we got valid data
        if (data && (data.ip || data.query)) {
          const locationData = service.parser(data)
          
          // Validate we got useful location data
          if (locationData.country && locationData.country !== 'Unknown' && locationData.city && locationData.city !== 'Unknown') {
            setIpGeolocation(locationData)
            console.log("IP Geolocation obtained from", service.name, ":", locationData)
            setIsLoadingLocation(false)
            return
          } else {
            console.warn(`${service.name} returned incomplete data:`, locationData)
          }
        }
      } catch (error) {
        console.error(`Error with ${service.name}:`, error)
        continue
      }
    }
    
    // If all services failed, set a basic fallback
    console.warn("All IP geolocation services failed, using fallback")
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const ipData = await response.json()
      setIpGeolocation({
        ip: ipData.ip,
        country: 'US', // Default fallback
        country_name: 'United States',
        city: 'New York'
      })
    } catch (finalError) {
      console.error("Even fallback IP service failed:", finalError)
      // Don't set any geolocation data if everything fails
    }
    
    setIsLoadingLocation(false)
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

    const messagesToSend = [{ role: "user", content: input }]
    let fullResponse = ""
    let finalToolOutput: any = null
    let finalConversationId: string | null = null
    let wasNewConversation = !currentConversationId // Track if this was a new conversation

    try {
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
        ipGeolocation || undefined // Pass IP geolocation if available
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
      
      // Reload conversations if this was a new conversation
      if (wasNewConversation && finalConversationId) {
        loadConversations()
      }
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
    
    // Close sidebar on mobile devices when starting new conversation
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
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
            const hasValidActivities =
              toolOutput.activities && Array.isArray(toolOutput.activities) && toolOutput.activities.length > 0

            const hasAnyValid = hasValidTickets || hasValidHotels || hasValidRestaurants || hasValidActivities

            console.log("Validity check:", {
              hasValidTickets,
              hasValidHotels,
              hasValidRestaurants,
              hasValidActivities,
              hasAnyValid,
            })

            // Only override if the current toolOutput doesn't have valid data
            if (!hasAnyValid) {
              console.log("No valid data in toolOutput, using search results")
              // Match search results to this message based on timing or other criteria
              // For now, we'll just use the search results to create the tool output
              const mapped = srArr.map((sr: any) => {
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
              toolOutput = mapped.length === 1 ? mapped[0] : mapped
            }
          }
        }

        return {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          toolOutput,
        }
      })

      setMessages(loadedMessages)
      setCurrentConversationId(conversationId)
    }
  }

  const loadRoadmap = async (conversationId: string) => {
    const { data } = await apiClient.getConversationSearchResults(conversationId)
    if (data) {
      const pushItems = (arr: any[] | undefined, type: string) => {
        if (!arr || !Array.isArray(arr)) return
        arr.forEach((item: any) => {
          const existingId = item.id || item.combination_id
          if (existingId && !bookedIds.has(existingId)) {
            setBookedItems((prev) => ({
              ...prev,
              [existingId]: {
                ...item,
                id: existingId,
                type,
              },
            }))
          }
        })
      }

      // Process all items from search results
      data.forEach((sr: any) => {
        pushItems(sr.data?.flights, "flight")
        pushItems(sr.data?.hotels, "hotel")
        pushItems(sr.data?.restaurants, "restaurant")
        pushItems(sr.data?.items, "activity")
      })
    }
  }

  const handleBooked = (bookedItem: any, id: string, type: string) => {
    // Enhance display for flights: name as route
    let enhancedItem = { ...bookedItem }
    if (type === 'flight' || type === 'flights') {
      const origin = bookedItem.from || bookedItem.origin || (bookedItem.flights_to?.[0]?.from) || '???'
      const destination = bookedItem.to || bookedItem.destination || (bookedItem.flights_to?.slice(-1)?.[0]?.to) || '???'
      enhancedItem.name = `${origin} → ${destination}`
      enhancedItem.location = `${origin} → ${destination}`
    }
    setBookedItems((prev) => ({ ...prev, [id]: { ...enhancedItem, id, type } }))
    setBookedIds((prev) => new Set([...prev, id.toString()]))
  }

  const handleRemoveItem = (id: string) => {
    setBookedItems((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setBookedIds((prev) => {
      const updated = new Set(prev)
      updated.delete(id)
      return updated
    })
  }

  const handleClearAll = () => {
    setBookedItems({})
    setBookedIds(new Set())
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = mapWidth

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const deltaPx = startXRef.current - ev.clientX
      const deltaPercent = (deltaPx / window.innerWidth) * 100
      const newWidth = Math.max(MIN_MAP_WIDTH, Math.min(MAX_MAP_WIDTH, startWidthRef.current + deltaPercent))
      setMapWidth(newWidth)
    }

    const handleMouseUp = () => {
      resizingRef.current = false
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  console.log(messages)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Map Overlay */}
      <MobileMapOverlay
        showMobileMap={showMobileMap}
        setShowMobileMap={setShowMobileMap}
        bookedItems={bookedItems}
        onRemoveItem={handleRemoveItem}
        onClearAll={handleClearAll}
      />

      {/* Sidebar */}
      <AppSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onConversationSelect={loadConversation}
        onNewChat={startNewConversation}
      />

      {/* Main Content Area with Chat and Map */}
      <div className="flex-1 flex min-w-0">
        {/* Chat Area */}
        <div 
          className="flex flex-col min-w-0 w-full md:w-auto" 
          style={{ width: isMobile ? '100%' : `${100 - mapWidth}%` }}
        >
          {/* Mobile Header */}
          <ChatHeader
            setSidebarOpen={setSidebarOpen}
            setShowMobileMap={setShowMobileMap}
            bookedItemsCount={Object.keys(bookedItems).length}
          />

          {/* Messages Container */}
          <MessagesList
            ref={messagesEndRef}
            messages={messages}
            isStreaming={isStreaming}
            streamingMessage={streamingMessage}
            activeSearches={activeSearches}
            showTypingIndicator={showTypingIndicator}
            bookedIds={bookedIds}
            onBooked={handleBooked}
            onSuggestionClick={setInput}
          />

          {/* Input Area */}
          <ChatInput
            ref={inputRef}
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isStreaming={isStreaming}
          />
        </div>

        {/* Resize Handle - Hidden on mobile */}
        <div
          className="hidden md:block w-1 bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
        </div>

        {/* Map Area - Hidden on mobile, shown on md and up */}
        <div
          className="hidden md:block bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700"
          style={{ width: `${mapWidth}%` }}
        >
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