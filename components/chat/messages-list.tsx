"use client"

import { forwardRef } from "react"
import { AnimatePresence } from "framer-motion"
import { MessageBubble } from "./message-bubble"
import { WelcomeScreen } from "./welcome-screen"
import { TypingIndicator } from "@/components/search-animations"
import { Message } from "@/types/chat"

interface MessagesListProps {
  messages: Message[]
  isStreaming: boolean
  streamingMessage: string
  activeSearches: Set<string>
  currentlyStreamingMessageId: string | null
  showTypingIndicator: boolean
  bookedIds: Set<string>
  onBooked: (bookedItem: any, id: string, type: string) => void
  onSuggestionClick: (text: string) => void
}

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({
    messages,
    isStreaming,
    streamingMessage,
    activeSearches,
    currentlyStreamingMessageId,
    showTypingIndicator,
    bookedIds,
    onBooked,
    onSuggestionClick
  }, ref) => {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-3 md:p-6">
          {messages.length === 0 && (
            <WelcomeScreen onSuggestionClick={onSuggestionClick} />
          )}

          {messages.length > 0 && (
            <div className="space-y-4 md:space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming}
                    streamingMessage={streamingMessage}
                    activeSearches={activeSearches}
                    currentlyStreamingMessageId={currentlyStreamingMessageId}
                    bookedIds={bookedIds}
                    onBooked={onBooked}
                  />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {showTypingIndicator && <TypingIndicator />}
              </AnimatePresence>

              <div ref={ref} />
            </div>
          )}
        </div>
      </div>
    )
  }
)

MessagesList.displayName = "MessagesList" 