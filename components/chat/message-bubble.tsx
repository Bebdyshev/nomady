"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SearchAnimation } from "@/components/search-animations"
import { TicketDisplay } from "@/components/displays/ticket-display"
import { HotelDisplay } from "@/components/displays/hotels-display"
import { RestaurantDisplay } from "@/components/displays/restaurant-display"
import { ActivityDisplay } from "@/components/displays/activity-display"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  isStreaming: boolean
  streamingMessage: string
  activeSearches: Set<string>
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

// Helper function to find restaurant data in toolOutput
const findRestaurantData = (toolOutput: any) => {
  if (!toolOutput) return null
  
  // If it's an array, find the restaurant data object
  if (Array.isArray(toolOutput)) {
    const restaurantData = toolOutput.find(
      (item) =>
      item.restaurants || 
      item.type === "restaurants" ||
        (item.source === "tripadvisor" && item.restaurants && Array.isArray(item.restaurants)),
    )
    return restaurantData || null
  }
  
  // If it's a single object, return it if it contains restaurant data
  if (toolOutput.restaurants || toolOutput.type === "restaurants") {
    return toolOutput
  }
  
  return null
}

// Helper function to find activity data in toolOutput
const findActivityData = (toolOutput: any) => {
  if (!toolOutput) return null
  
  // If it's an array, find the activity data object
  if (Array.isArray(toolOutput)) {
    const activityData = toolOutput.find(
      (item) =>
      item.activities || 
      item.type === "activities" ||
        (item.items && Array.isArray(item.items)),
    )
    return activityData || null
  }
  
  // If it's a single object, return it if it contains activity data
  if (toolOutput.activities || toolOutput.type === "activities") {
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

export function MessageBubble({
  message,
  isStreaming,
  streamingMessage,
  activeSearches,
  bookedIds,
  onBooked
}: MessageBubbleProps) {
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
          {message.role === "assistant" && 
           isStreaming && 
           activeSearches.size > 0 && 
           (message.content === streamingMessage || message.content === "") ? (
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
            {message.content.includes("<hotels>") || message.content.includes("Hotels in") ? (
              (() => {
                const hotelData = findHotelData(message.toolOutput)
                return hotelData ? (
                  <HotelDisplay
                    toolOutput={hotelData}
                    bookedIds={bookedIds}
                    onBooked={onBooked}
                  />
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No hotel data found
                  </div>
                )
              })()
            ) : message.content.includes("<restaurants>") || message.content.includes("Restaurants in") ? (
              (() => {
                const restaurantData = findRestaurantData(message.toolOutput)
                return restaurantData ? (
                  <RestaurantDisplay
                    toolOutput={restaurantData}
                    bookedIds={bookedIds}
                    onBooked={onBooked}
                  />
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No restaurant data found
                  </div>
                )
              })()
            ) : message.content.includes("<activities>") || message.content.includes("Activities in") ? (
              (() => {
                const activityData = findActivityData(message.toolOutput)
                return activityData ? (
                  <ActivityDisplay
                    toolOutput={activityData}
                    bookedIds={bookedIds}
                    onBooked={onBooked}
                  />
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No activity data found
                  </div>
                )
              })()
            ) : (
              (() => {
                const ticketData = findTicketData(message.toolOutput)
                return ticketData ? (
                  <TicketDisplay
                    toolOutput={ticketData}
                    bookedIds={bookedIds}
                    onBooked={onBooked}
                  />
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No ticket data found
                  </div>
                )
              })()
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 