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

interface MessageBubbleProps {
  message: Message & { tool_output?: any }
  isStreaming: boolean
  streamingMessage: string
  activeSearches: Set<string>
  currentlyStreamingMessageId: string | null
  bookedIds: Set<string>
  onBooked: (bookedItem: any, id: string, type: string) => void
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
  
  // Show content if we have tool_output data (regardless of tags)
  if (toolOutput) {
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
  
  const isActivityObj = (obj: any) =>
    obj && 
    obj.type === "activities"

  
  // If it's a single object, return it if it contains activity data and is not another type
  return isActivityObj(toolOutput) ? toolOutput : null
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
  onBooked
}: MessageBubbleProps) {
  const t = useTranslations('chat.messages')

  // Memoize parsed content to avoid recalculating on every render
  const parsedContent = useMemo(() => {
    return parseMessageContent(message.content, message.tool_output)
  }, [message])

  // Memoize search animation condition
  const shouldShowSearchAnimation = useMemo(() => {
    return message.role === "assistant" && 
           isStreaming && 
           message.id === currentlyStreamingMessageId &&
           activeSearches.size > 0
  }, [message.role, isStreaming, message.id, currentlyStreamingMessageId, activeSearches.size])

  // Memoize streaming cursor condition
  const shouldShowStreamingCursor = useMemo(() => {
    return message.role === "assistant" && 
           isStreaming && 
           message.content === streamingMessage && 
           activeSearches.size === 0
  }, [message.role, isStreaming, message.content, streamingMessage, activeSearches.size])

  console.log("message ", message)
  const toolOutputDisplay = (
    message.tool_output && (
      message.tool_output.type === "hotels" ? (
        <HotelDisplay
          toolOutput={findHotelData(message.tool_output)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      ) : message.tool_output.type === "restaurants" ? (
        <RestaurantDisplay
          toolOutput={findRestaurantData(message.tool_output)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      ) : message.tool_output.type === "activities" ? (
        <ActivityDisplay
          toolOutput={findActivityData(message.tool_output)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      ) : (
        <TicketDisplay
          toolOutput={findTicketData(message.tool_output)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      )
    )
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex min-w-0 ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] md:max-w-[80%] min-w-0 rounded-lg px-3 md:px-4 py-2 md:py-3 ${
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-white border border-slate-200"
        }`}
      >
        <div className="text-sm md:text-base">
          {/* Show search animations for assistant messages during streaming when searches are active */}
          {shouldShowSearchAnimation ? (
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
                <MarkdownMessage content={parsedContent.text} />
              ) : (
                parsedContent.text
              )}
              {/* Show streaming cursor for assistant messages during streaming */}
              {shouldShowStreamingCursor && (
                <motion.span
                  className="inline-block w-1 h-4 bg-slate-600 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </>
          )}
        </div>

        {message.tool_output && (
          <motion.div
            className="mt-3 md:mt-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {toolOutputDisplay}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}) 