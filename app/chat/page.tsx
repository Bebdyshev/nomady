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
import { useConversations } from "@/contexts/conversations-context"

// Disable static generation for this page
export const dynamic = "force-dynamic"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { conversations, loadConversations } = useConversations()
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
  const [currentlyStreamingMessageId, setCurrentlyStreamingMessageId] = useState<string | null>(null)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [ipGeolocation, setIpGeolocation] = useState<IpGeolocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Debouncing for streaming updates to reduce DOM thrashing
  const [pendingStreamingUpdate, setPendingStreamingUpdate] = useState<string>("")
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')

  // Получить название текущего чата
  const currentConversation = currentConversationId
    ? conversations.find((c) => c.id === currentConversationId)
    : null
  const chatTitle = currentConversation?.title?.trim()
    ? currentConversation.title
    : (!currentConversationId ? t('sidebar.newConversation') : t('sidebar.newConversation'))

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const MIN_MAP_WIDTH = 30 // percent
  const MAX_MAP_WIDTH = 50 // percent
  
  // Функция для проверки, находится ли пользователь внизу чата
  const isUserAtBottom = () => {
    if (!messagesEndRef.current) return true
    
    const container = messagesEndRef.current.parentElement
    if (!container) return true
    
    const threshold = 100 // пикселей от низа
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold
    return isAtBottom
  }

  // Debounced update function for streaming to reduce DOM updates
  const updateStreamingMessage = (assistantMessageId: string, newContent: string) => {
    // Update pending content for debouncing
    setPendingStreamingUpdate(newContent)
    
    // Clear existing timeout
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current)
    }
    
    // Set new timeout for batched update
    streamingTimeoutRef.current = setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: newContent } : msg,
        ),
      )
      setPendingStreamingUpdate("")
    }, 50) // Update every 50ms instead of every character
    
    // Also update immediately if this is the first content or if there's significant new content
    if (newContent.length === 1 || newContent.length % 20 === 0) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: newContent } : msg,
        ),
      )
    }
  }

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
    // Во время стриминга прокручиваем только если пользователь внизу чата
    if (isStreaming && !isUserAtBottom()) return
    
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showTypingIndicator, activeSearches, isStreaming])

  // Auto-scroll when streaming ends
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [isStreaming, messages.length])

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
        const response = await fetch(service.url)
        
        if (!response.ok) {
          console.warn(`${service.name} returned ${response.status}`)
          continue
        }
        
        const data = await response.json()
        
        // Check if we got valid data
        if (data && (data.ip || data.query)) {
          const locationData = service.parser(data)
          
          // Validate we got useful location data
          if (locationData.country && locationData.country !== 'Unknown' && locationData.city && locationData.city !== 'Unknown') {
            setIpGeolocation(locationData)
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
    
    // Прокрутка к новому сообщению пользователя
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)
    
    setIsLoading(true)
    setIsStreaming(true)

    // Add a placeholder for the assistant's response
    const assistantMessageId = (Date.now() + 1).toString()
    setCurrentlyStreamingMessageId(assistantMessageId)
    const assistantMessagePlaceholder: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      toolOutput: null,
    }
    setMessages((prev) => [...prev, assistantMessagePlaceholder])
    
    // Прокрутка к placeholder сообщению ассистента
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    let fullResponse = ""
    let finalToolOutput: any = null
    let finalConversationId: string | null = currentConversationId
    const wasNewConversation = !currentConversationId

    try {
      const messagesToSend = [{ role: "user", content: input }]
      const response = await apiClient.sendMessage(
        messagesToSend,
        currentConversationId || undefined,
        ipGeolocation || undefined,
      )

      console.log('Backend response:', response.data)

      // Обновить ассистентское сообщение корректно
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: response.data?.response || "",
                toolOutput: response.data?.tool_output || null,
              }
            : msg,
        )
        console.log('Updated messages after setMessages:', updated)
        return updated
      })

      // --- Добавлено: сохраняем conversation_id, если это новый чат ---
      if (wasNewConversation && response.data?.conversation_id) {
        setCurrentConversationId(response.data.conversation_id)
      }
      // --- конец добавления ---

      // Имитация стриминга (по желанию, можно оставить или убрать)
      // Если нужен эффект набора текста, можно реализовать через setInterval по response.data?.response

    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                isError: true,
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setActiveSearches(new Set())
      setCurrentlyStreamingMessageId(null)
      
      // Clear any pending streaming updates and ensure final content is set
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current)
        streamingTimeoutRef.current = null
      }
      
      // REMOVE this block to prevent overwriting toolOutput with null
      // setMessages((prev) =>
      //   prev.map((msg) =>
      //     msg.id === assistantMessageId && !finalToolOutput
      //       ? { ...msg, toolOutput: null }
      //       : msg
      //   )
      // )
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
      const loadedMessages: Message[] = (data as any).messages.map((msg: any) => {
        let toolOutput = msg.tool_output
        
        // Parse tool_output if it's a string
        if (typeof toolOutput === 'string') {
          try {
            toolOutput = JSON.parse(toolOutput)
          } catch (e) {
            console.warn('Failed to parse tool_output for message', msg.id, e)
            toolOutput = null
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
        currentConversationId={currentConversationId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onConversationSelect={loadConversation}
        onNewChat={startNewConversation}
      />

      {/* Main Content Area with Chat and Map */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header (Desktop) */}
        <header className="hidden md:flex items-center justify-between h-11 px-6 bg-white sticky top-0 z-30 border-b">
          <span className="font-medium text-base mx-4">{chatTitle}</span>
        </header>
        {/* Chat and Map Columns */}
        <div className="flex-1 flex min-w-0">
          {/* Chat Area */}
          <div 
            className="flex flex-col min-w-0 w-full md:w-auto" 
            style={{ width: isMobile ? '100%' : `${100 - mapWidth}%` }}
          >
            {/* Mobile Header - make sticky */}
            <div className="md:hidden sticky top-0 z-30">
              <ChatHeader
                setSidebarOpen={setSidebarOpen}
                setShowMobileMap={setShowMobileMap}
                bookedItemsCount={Object.keys(bookedItems).length}
              />
            </div>

            {/* Messages Container - add extra bottom padding on mobile */}
            <div className="flex-1 overflow-y-auto" style={{ paddingBottom: isMobile ? 112 : 0 }}>
              <MessagesList
                ref={messagesEndRef}
                messages={messages}
                isStreaming={isStreaming}
                streamingMessage={streamingMessage}
                activeSearches={activeSearches}
                currentlyStreamingMessageId={currentlyStreamingMessageId}
                showTypingIndicator={showTypingIndicator}
                bookedIds={bookedIds}
                onBooked={handleBooked}
                onSuggestionClick={setInput}
              />
            </div>

            {/* Input Area - sticky on mobile */}
            <div className="md:static md:mt-0 sticky bottom-0 z-40">
              <ChatInput
                ref={inputRef}
                input={input}
                setInput={setInput}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isStreaming={isStreaming}
              />
            </div>
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
    </div>
  )
}