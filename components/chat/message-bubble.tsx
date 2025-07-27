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
  message: Message & { tool_output?: any }
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
  isLoading = false
}: MessageBubbleProps) {
  const t = useTranslations('chat')
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const isStreamingThisMessage = isStreaming && currentlyStreamingMessageId === message.id
  const content = isStreamingThisMessage ? streamingMessage : message.content
  const showThinkingAnimation = isAssistant && !content && isLoading

  // Determine mode badge
  const modeBadge = message.mode === "generate" ? (
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
                    <MarkdownMessage content={content} />
                    {/* Tool Output Display inside bubble */}
                    {message.toolOutput && (() => {
                      const parsed = parseMessageContent(content, message.toolOutput)
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
                              />
                            ) : parsed.toolOutput.type === "restaurants" ? (
                              <RestaurantDisplay
                                toolOutput={parsed.toolOutput}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
                              />
                            ) : parsed.toolOutput.type === "activities" ? (
                              <ActivityDisplay
                                toolOutput={parsed.toolOutput}
                                bookedIds={bookedIds}
                                onBooked={onBooked}
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