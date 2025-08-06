"use client"

import React, { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchAnimation } from "@/components/search-animations"
import { TicketDisplay } from "@/components/displays/ticket-display"
import { HotelDisplay } from "@/components/displays/hotels-display"
import { RestaurantDisplay } from "@/components/displays/restaurant-display"
import { ActivityDisplay } from "@/components/displays/activity-display"
import { useTranslations } from "@/lib/i18n-client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Message } from "@/types/chat"

// Thinking Animation Component
const ThinkingAnimation = () => {
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-slate-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

interface MessageBubbleProps {
  message: Message & { tool_output?: any; multiple_results?: { [key: string]: any } }
  conversationMode?: string
  isStreaming: boolean
  streamingMessage: string
  activeSearches: Set<string>
  currentlyStreamingMessageId: string | null
  bookedIds: Set<string>
  onBooked: (bookedItem: any, id: string, type: string) => void
  isLoading?: boolean
}

// Markdown Message Component for bot responses
const MarkdownMessage = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-slate-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-slate-900">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-slate-900">{children}</h3>,
          
          // Paragraphs
          p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-700">{children}</p>,
          
          // Lists
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-slate-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-700">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
          
          // Code
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-slate-800">
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-slate-100 p-3 rounded-lg text-sm font-mono text-slate-800 overflow-x-auto">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-slate-100 p-3 rounded-lg text-sm font-mono text-slate-800 overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-slate-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-left font-medium text-slate-900 text-sm">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-slate-200 text-slate-700 text-sm">
              {children}
            </td>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-2 italic text-slate-600 bg-slate-50 rounded-r">
              {children}
            </blockquote>
          ),
          
          // Strong and emphasis
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          
          // Horizontal rule
          hr: () => <hr className="border-slate-200 my-3" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Helper function to check if message is from roadmap
const isRoadmapMessage = (message: Message & { tool_output?: any; multiple_results?: { [key: string]: any } }, conversationMode?: string) => {
  let result = message.mode === "generate" || message.tool_output?.mode === "generate" || conversationMode === "generate"
  // Fallback: if assistant and content has roadmap tags
  if (!result && message.role === "assistant" && typeof message.content === "string") {
    if (/<hotel|<activities>|<restaurants>/.test(message.content)) {
      result = true
    }
  }

  return result
}

// Structured Message Component for parsing tags
const StructuredMessage = ({ content, bookedIds, onBooked, message, conversationMode }: { 
  content: string
  bookedIds: Set<string>
  onBooked: (bookedItem: any, id: string, type: string) => void
  message: Message & { tool_output?: any; multiple_results?: { [key: string]: any } }
  conversationMode?: string
}) => {
  // Parse content for tags
  const parseStructuredContent = (text: string) => {
    const parts = []
    let currentIndex = 0
    
    // Regular expressions for different tag types
    const hotelRegex = /<hotel id="(\d+)">([\s\S]*?)<\/hotel>/g
    const activitiesRegex = /<activities id="(\d+)">([\s\S]*?)<\/activities>/g
    const restaurantsRegex = /<restaurants id="(\d+)">([\s\S]*?)<\/restaurants>/g
    const flightsRegex = /<flights>([\s\S]*?)<\/flights>/g
    
    // Legacy regex patterns for backward compatibility (without id)
    const activitiesLegacyRegex = /<activities>([\s\S]*?)<\/activities>/g
    const restaurantsLegacyRegex = /<restaurants>([\s\S]*?)<\/restaurants>/g
    
    // Find all matches
    const matches = []
    
    // Hotel matches
    let hotelMatch
    while ((hotelMatch = hotelRegex.exec(text)) !== null) {
      matches.push({
        type: 'hotel',
        id: hotelMatch[1],
        content: hotelMatch[2].trim(),
        start: hotelMatch.index,
        end: hotelMatch.index + hotelMatch[0].length
      })
    }
    
    // Activities matches
    let activitiesMatch
    while ((activitiesMatch = activitiesRegex.exec(text)) !== null) {
      matches.push({
        type: 'activities',
        id: activitiesMatch[1],
        content: activitiesMatch[2].trim(),
        start: activitiesMatch.index,
        end: activitiesMatch.index + activitiesMatch[0].length
      })
    }
    
    // Activities legacy matches (without id)
    let activitiesLegacyMatch
    while ((activitiesLegacyMatch = activitiesLegacyRegex.exec(text)) !== null) {
      matches.push({
        type: 'activities',
        id: null,
        content: activitiesLegacyMatch[1].trim(),
        start: activitiesLegacyMatch.index,
        end: activitiesLegacyMatch.index + activitiesLegacyMatch[0].length
      })
    }
    
    // Restaurants matches
    let restaurantsMatch
    while ((restaurantsMatch = restaurantsRegex.exec(text)) !== null) {
      matches.push({
        type: 'restaurants',
        id: restaurantsMatch[1],
        content: restaurantsMatch[2].trim(),
        start: restaurantsMatch.index,
        end: restaurantsMatch.index + restaurantsMatch[0].length
      })
    }
    
    // Restaurants legacy matches (without id)
    let restaurantsLegacyMatch
    while ((restaurantsLegacyMatch = restaurantsLegacyRegex.exec(text)) !== null) {
      matches.push({
        type: 'restaurants',
        id: null,
        content: restaurantsLegacyMatch[1].trim(),
        start: restaurantsLegacyMatch.index,
        end: restaurantsLegacyMatch.index + restaurantsLegacyMatch[0].length
      })
    }
    
    // Flights matches
    let flightsMatch
    while ((flightsMatch = flightsRegex.exec(text)) !== null) {
      matches.push({
        type: 'flights',
        content: flightsMatch[1].trim(),
        start: flightsMatch.index,
        end: flightsMatch.index + flightsMatch[0].length
      })
    }
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start)
    
    // Build parts array
    for (const match of matches) {
      // Add text before match
      if (match.start > currentIndex) {
        const textBefore = text.slice(currentIndex, match.start)
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore })
        }
      }
      
      // Add match
      parts.push({
        type: match.type,
        id: match.id,
        content: match.content
      })
      
      currentIndex = match.end
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex)
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText })
      }
    }
    
    return parts
  }
  
  const parts = parseStructuredContent(content)
  
  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div key={index} className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-700">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-slate-700">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-700">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
                }}
              >
                {part.content}
              </ReactMarkdown>
            </div>
          )
        }
        
        if (part.type === 'hotel') {
          // Try to find real hotel data from roadmap responses
          let hotelData = null
          let hotelIndex = null
          if (part.id) {
            // id in tag is 1-based, JS array is 0-based
            hotelIndex = parseInt(part.id, 10) - 1
          }
          // Check for roadmap response with multiple_results
          if (message.multipleResults?.hotels && Array.isArray(message.multipleResults.hotels.hotels)) {
            const hotelsArr = message.multipleResults.hotels.hotels
            if (hotelIndex !== null && hotelIndex >= 0 && hotelIndex < hotelsArr.length) {
              hotelData = {
                hotels: [hotelsArr[hotelIndex]]
              }
            }
          }
          // Fallback: Check for roadmap response with direct data (backward compatibility)
          else if (message.toolOutput?.hotels && Array.isArray(message.toolOutput.hotels)) {
            if (hotelIndex !== null && hotelIndex >= 0 && hotelIndex < message.toolOutput.hotels.length) {
              hotelData = {
                hotels: [message.toolOutput.hotels[hotelIndex]]
              }
            }
          }
          // Fallback: Check for roadmap response with search_results (backward compatibility)
          else if (message.toolOutput?.type === 'roadmap_generation' && message.toolOutput.data?.search_results?.hotels) {
            const hotelsArr = message.toolOutput.data.search_results.hotels
            if (hotelIndex !== null && hotelIndex >= 0 && hotelIndex < hotelsArr.length) {
              hotelData = {
                hotels: [hotelsArr[hotelIndex]]
              }
            }
          }
          // Fallback: Check for regular hotel data
          else if (message.toolOutput?.type === 'hotels') {
            if (hotelIndex !== null && hotelIndex >= 0 && hotelIndex < message.toolOutput.hotels.length) {
              hotelData = {
                hotels: [message.toolOutput.hotels[hotelIndex]]
              }
            }
          }
          
          if (hotelData && hotelData.hotels && Array.isArray(hotelData.hotels) && hotelData.hotels.length > 0) {
            return (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                <HotelDisplay
                  toolOutput={hotelData}
                  bookedIds={bookedIds}
                  onBooked={onBooked}
                  hideHeaders={message.mode === 'generate'}
                  isRoadmap={isRoadmapMessage(message, conversationMode)}
                />
              </div>
            )
          } else {
            // Show only text content if no real data
            return (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                <div className="text-sm text-slate-700">
                  <strong>Hotel Option {part.id}:</strong> {part.content}
                </div>
              </div>
            )
          }
        }
        
        if (part.type === 'activities') {
          // Try to find real activity data from roadmap responses
          let activityData = null
          let activityIndex = null
          if (part.id) {
            // id in tag is 1-based, JS array is 0-based
            activityIndex = parseInt(part.id, 10) - 1
          }
          
          // Check for roadmap response with multiple_results
          if (message.multipleResults?.activities && Array.isArray(message.multipleResults.activities.activities)) {
            const activitiesArr = message.multipleResults.activities.activities
            if (activityIndex !== null && activityIndex >= 0 && activityIndex < activitiesArr.length) {
              activityData = {
                type: 'activities',
                activities: [activitiesArr[activityIndex]]
              }
            }
          }
          // Fallback: Check for roadmap response with direct data (backward compatibility)
          else if (message.toolOutput?.activities && Array.isArray(message.toolOutput.activities)) {
            if (activityIndex !== null && activityIndex >= 0 && activityIndex < message.toolOutput.activities.length) {
              activityData = {
                type: 'activities',
                activities: [message.toolOutput.activities[activityIndex]]
              }
            }
          }
          // Fallback: Check for roadmap response with search_results (backward compatibility)
          else if (message.toolOutput?.type === 'roadmap_generation' && message.toolOutput.data?.search_results?.activities) {
            const activitiesArr = message.toolOutput.data.search_results.activities
            if (activityIndex !== null && activityIndex >= 0 && activityIndex < activitiesArr.length) {
              activityData = {
                type: 'activities',
                activities: [activitiesArr[activityIndex]]
              }
            }
          }
          // Fallback: Check for regular activity data
          else if (message.toolOutput?.type === 'activities') {
            if (activityIndex !== null && activityIndex >= 0 && activityIndex < message.toolOutput.activities.length) {
              activityData = {
                type: 'activities',
                activities: [message.toolOutput.activities[activityIndex]]
              }
            }
          }
          
          if (activityData && activityData.activities && Array.isArray(activityData.activities) && activityData.activities.length > 0) {
            return (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                <ActivityDisplay
                  toolOutput={activityData}
                  bookedIds={bookedIds}
                  onBooked={onBooked}
                  hideHeaders={message.mode === 'generate'}
                  isRoadmap={isRoadmapMessage(message, conversationMode)}
                />
              </div>
            )
          } else {
            // Show only text content if no real data
            return (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                <div className="text-sm text-slate-700">
                  <strong>Activities{part.id ? ` (Set ${part.id})` : ''}:</strong> {part.content}
                </div>
              </div>
            )
          }
        }
        
        if (part.type === 'restaurants') {
          // Try to find real restaurant data from roadmap responses
          let restaurantData = null
          let restaurantIndex = null
          if (part.id) {
            // id in tag is 1-based, JS array is 0-based
            restaurantIndex = parseInt(part.id, 10) - 1
          }
          
          // Check for roadmap response with multiple_results
          if (message.multipleResults?.restaurants && Array.isArray(message.multipleResults.restaurants.restaurants)) {
            const restaurantsArr = message.multipleResults.restaurants.restaurants
            if (restaurantIndex !== null && restaurantIndex >= 0 && restaurantIndex < restaurantsArr.length) {
              restaurantData = {
                type: 'restaurants',
                restaurants: [restaurantsArr[restaurantIndex]]
              }
            }
          }
          // Fallback: Check for roadmap response with direct data (backward compatibility)
          else if (message.toolOutput?.restaurants && Array.isArray(message.toolOutput.restaurants)) {
            if (restaurantIndex !== null && restaurantIndex >= 0 && restaurantIndex < message.toolOutput.restaurants.length) {
              restaurantData = {
                type: 'restaurants',
                restaurants: [message.toolOutput.restaurants[restaurantIndex]]
              }
            }
          }
          // Fallback: Check for roadmap response with search_results (backward compatibility)
          else if (message.toolOutput?.type === 'roadmap_generation' && message.toolOutput.data?.search_results?.restaurants) {
            const restaurantsArr = message.toolOutput.data.search_results.restaurants
            if (restaurantIndex !== null && restaurantIndex >= 0 && restaurantIndex < restaurantsArr.length) {
              restaurantData = {
                type: 'restaurants',
                restaurants: [restaurantsArr[restaurantIndex]]
              }
            }
          }
          // Fallback: Check for regular restaurant data
          else if (message.toolOutput?.type === 'restaurants') {
            if (restaurantIndex !== null && restaurantIndex >= 0 && restaurantIndex < message.toolOutput.restaurants.length) {
              restaurantData = {
                type: 'restaurants',
                restaurants: [message.toolOutput.restaurants[restaurantIndex]]
              }
            }
          }
          
          if (restaurantData && restaurantData.restaurants && Array.isArray(restaurantData.restaurants) && restaurantData.restaurants.length > 0) {
            return (
              <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r">
                <RestaurantDisplay
                  toolOutput={restaurantData}
                  bookedIds={bookedIds}
                  onBooked={onBooked}
                  hideHeaders={message.mode === 'generate'}
                  isRoadmap={isRoadmapMessage(message, conversationMode)}
                />
              </div>
            )
          } else {
            // Show only text content if no real data
            return (
              <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r">
                <div className="text-sm text-slate-700">
                  <strong>Restaurants{part.id ? ` (Set ${part.id})` : ''}:</strong> {part.content}
                </div>
              </div>
            )
          }
        }
        
        if (part.type === 'flights') {
          // Try to find real flight data
          const flightData = message.multipleResults?.flights || 
                           (message.toolOutput?.type === 'flights' ? message.toolOutput : null)
          
          if (flightData && flightData.tickets && Array.isArray(flightData.tickets) && flightData.tickets.length > 0) {
            return (
              <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
                <TicketDisplay
                  toolOutput={flightData}
                  bookedIds={bookedIds}
                  onBooked={onBooked}
                />
              </div>
            )
          } else {
            // Show only text content if no real data
            return (
              <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
                <div className="text-sm text-slate-700">
                  <strong>Flights:</strong> {part.content}
                </div>
              </div>
            )
          }
        }
        
        return null
      })}
    </div>
  )
}

const parseMessageContent = (content: string, toolOutput?: any) => {
  // Remove all search tags and content tags from content for clean display
  const textContent = content
    .replace(/<(?:searching_tickets|searching_hotels|searching_restaurants|searching_activities)>/g, "")
    .replace(/<\/(?:searching_tickets|searching_hotels|searching_restaurants|searching_activities)>/g, "")
    .replace(/<(?:tickets|hotels|restaurants|activities)>[\s\S]*?<\/(?:tickets|hotels|restaurants|activities)>/g, "")
    .trim()
  
  // Show content if we have tool_output data OR if we have text content
  if (toolOutput || textContent) {
    return {
      text: textContent,
      showContent: true,
      toolOutput,
    }
  }
  
  return {
    text: textContent,
    showContent: false,
    toolOutput: null,
  }
}

// Helper function to find hotel data in toolOutput
const findHotelData = (toolOutput: any) => {
  if (!toolOutput) return null
  
  const isHotelObj = (obj: any) =>
    obj && 
    obj.type === "hotels"

  
  // If it's a single object, return it if it contains hotel data and is not another type
  return isHotelObj(toolOutput) ? toolOutput : null
}

// Helper function to find restaurant data in toolOutput
const findRestaurantData = (toolOutput: any) => {
  if (!toolOutput) return null
  
  const isRestaurantObj = (obj: any) =>
    obj && 
    obj.type === "restaurants"

  // If it's a single object, return it if it contains restaurant data and is not another type
  return isRestaurantObj(toolOutput) ? toolOutput : null
}

// Helper function to find activity data in toolOutput
const findActivityData = (toolOutput: any) => {
  if (!toolOutput) return null
  
  // Check if it's already an activities object
  if (toolOutput.type === "activities" && Array.isArray(toolOutput.activities)) {
    return toolOutput
  }
  
  const isActivityObj = (obj: any) =>
    obj && 
    obj.type === "activities"
  
  // If it's a single object, return it if it contains activity data and is not another type
  const result = isActivityObj(toolOutput) ? toolOutput : null
  return result
}

// Helper function to find ticket data in toolOutput  
const findTicketData = (toolOutput: any) => {
  if (!toolOutput) return null

  // Always return the summary object for tickets
  if (toolOutput.type === "tickets" && Array.isArray(toolOutput.tickets)) {
    return toolOutput
  }

  const isTicketObj = (obj: any) =>
    obj && obj.type === "tickets"

  // If it's a single object, return it if it contains ticket data
  return isTicketObj(toolOutput) ? toolOutput : null
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  isStreaming,
  streamingMessage,
  activeSearches,
  currentlyStreamingMessageId,
  bookedIds,
  onBooked,
  isLoading = false,
  conversationMode
}: MessageBubbleProps) {
  const t = useTranslations('chat')
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const isStreamingThisMessage = isStreaming && currentlyStreamingMessageId === message.id
  const content = isStreamingThisMessage ? streamingMessage : message.content
  const showThinkingAnimation = isAssistant && !content && isLoading

  // Determine mode badge
  const modeBadge = isRoadmapMessage(message, conversationMode) ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
      ✨ Generate
    </span>
  ) : message.mode === "search" ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
      🔍 Search
    </span>
  ) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        <div className={`flex items-start space-x-2 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser 
              ? "bg-blue-500 text-white" 
              : "bg-slate-100 text-slate-600"
          }`}>
            {isUser ? "U" : "AI"}
          </div>

          {/* Message Content */}
          <div className={`flex-1 min-w-0 ${isUser ? "text-right" : ""}`}>
            {/* Mode Badge */}
            {modeBadge && (
              <div className={`mb-1 ${isUser ? "text-right" : "text-left"}`}>
                {modeBadge}
              </div>
            )}
            
            {/* Message Bubble */}
            <div className={`inline-block p-3 rounded-lg ${
              isUser 
                ? "bg-blue-500 text-white" 
                : "bg-white border border-slate-200 text-slate-900"
            }`}>
              {isAssistant ? (
                content ? (
                  <div>
                    {message.role === "assistant" ? (
                      <StructuredMessage content={content} bookedIds={bookedIds} onBooked={onBooked} message={message} conversationMode={conversationMode} />
                    ) : (
                      <MarkdownMessage content={content} />
                    )}
                    {/* Tool Output Display inside bubble - only if no structured content */}
                    {(message.toolOutput || message.multipleResults) && 
                     !content.includes('<hotel') && 
                     !content.includes('<activities') && 
                     !content.includes('<restaurants') && 
                     !content.includes('<flights') && 
                     !content.includes('<searching_') && (() => {
                      const parsed = parseMessageContent(content, message.toolOutput)
                      
                      
                      
                      // Handle multiple results
                      if (message.multipleResults) {
                        const results = []
                        
                        // Check each result type
                        if (message.multipleResults.hotels) {
                          const hotelData = message.multipleResults.hotels
                          if (hotelData.hotels && Array.isArray(hotelData.hotels) && hotelData.hotels.length > 0) {
                            results.push(
                              <HotelDisplay
                                key="hotels"
                                toolOutput={hotelData}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                                isRoadmap={isRoadmapMessage(message, conversationMode)}
                              />
                            )
                          } else {
                          }
                        }
                        
                        if (message.multipleResults.restaurants) {
                          const restaurantData = message.multipleResults.restaurants
                          if (restaurantData.restaurants && Array.isArray(restaurantData.restaurants) && restaurantData.restaurants.length > 0) {
                            results.push(
                              <RestaurantDisplay
                                key="restaurants"
                                toolOutput={restaurantData}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                                isRoadmap={isRoadmapMessage(message, conversationMode)}
                              />
                            )
                          } else {
                          }
                        }
                        
                        if (message.multipleResults.activities) {
                          const activityData = message.multipleResults.activities
                          if (activityData.activities && Array.isArray(activityData.activities) && activityData.activities.length > 0) {
                            results.push(
                              <ActivityDisplay
                                key="activities"
                                toolOutput={activityData}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                                isRoadmap={isRoadmapMessage(message, conversationMode)}
                              />
                            )
                          } else {
                          }
                        }
                        
                        if (message.multipleResults.flights) {
                          const flightData = message.multipleResults.flights
                          if (flightData.tickets && Array.isArray(flightData.tickets) && flightData.tickets.length > 0) {
                            results.push(
                              <TicketDisplay
                                key="flights"
                                toolOutput={flightData}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                              />
                            )
                          } else {
                          }
                        }
                      
                        if (results.length > 0) {
                          return (
                            <div className="mt-4 space-y-4">
                              {results}
                            </div>
                          )
                        }
                      }
                      
                      // Handle single result (backward compatibility)
                      if (parsed.showContent && parsed.toolOutput) {
                        // Check if there are any items to display
                        const hasItems = (() => {
                          if (parsed.toolOutput.type === "hotels" && parsed.toolOutput.hotels) {
                            return Array.isArray(parsed.toolOutput.hotels) && parsed.toolOutput.hotels.length > 0
                          } else if (parsed.toolOutput.type === "restaurants" && parsed.toolOutput.restaurants) {
                            return Array.isArray(parsed.toolOutput.restaurants) && parsed.toolOutput.restaurants.length > 0
                          } else if (parsed.toolOutput.type === "activities" && parsed.toolOutput.activities) {
                            return Array.isArray(parsed.toolOutput.activities) && parsed.toolOutput.activities.length > 0
                          } else if (parsed.toolOutput.type === "tickets" && parsed.toolOutput.tickets) {
                            return Array.isArray(parsed.toolOutput.tickets) && parsed.toolOutput.tickets.length > 0
                          }
                          return false
                        })()
                        
                        if (!hasItems) return null
                        
                        return (
                          <div className="mt-4">
                            {parsed.toolOutput.type === "hotels" ? (
                              <HotelDisplay
                                toolOutput={parsed.toolOutput}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                                isRoadmap={isRoadmapMessage(message, conversationMode)}
                              />
                            ) : parsed.toolOutput.type === "restaurants" ? (
                              (() => {
                                return (
                                  <RestaurantDisplay
                                    toolOutput={parsed.toolOutput}
                                    bookedIds={bookedIds}
                                    onBooked={onBooked}
                                    isRoadmap={isRoadmapMessage(message, conversationMode)}
                                  />
                                )
                              })()
                            ) : parsed.toolOutput.type === "activities" ? (
                              <ActivityDisplay
                                toolOutput={parsed.toolOutput}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                                isRoadmap={isRoadmapMessage(message, conversationMode)}
                              />
                            ) : (
                              <TicketDisplay
                                toolOutput={parsed.toolOutput}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                              />
                            )}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                ) : showThinkingAnimation ? (
                  <ThinkingAnimation />
                ) : null
              ) : (
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}) 