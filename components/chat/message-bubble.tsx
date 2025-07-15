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
  message: Message
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
    return parseMessageContent(message.content, message.toolOutput)
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
    message.toolOutput && (
      message.toolOutput.type === "hotels" ? (
        <HotelDisplay
          toolOutput={findHotelData(message.toolOutput)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      ) : message.toolOutput.type === "restaurants" ? (
        <RestaurantDisplay
          toolOutput={findRestaurantData(message.toolOutput)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      ) : message.toolOutput.type === "activities" ? (
        <ActivityDisplay
          toolOutput={findActivityData(message.toolOutput)}
          bookedIds={bookedIds}
          onBooked={onBooked}
        />
      ) : (
        <TicketDisplay
          toolOutput={findTicketData(message.toolOutput)}
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
            {toolOutputDisplay}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}) 