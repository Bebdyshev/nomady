"use client"

import { Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { forwardRef, useEffect, useRef, useLayoutEffect, useState } from "react"
import { trackSearch } from "@/lib/gtag"
import { useTranslations } from "@/lib/i18n-client"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSendMessage: (e: React.FormEvent) => void
  isLoading: boolean
  isStreaming: boolean
}

const MAX_WORDS = 500 // Hidden word limit

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ input, setInput, onSendMessage, isLoading, isStreaming }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const t = useTranslations('chat.input')

    // Combine refs
    useEffect(() => {
      if (ref && textareaRef.current) {
        if (typeof ref === 'function') {
          ref(textareaRef.current)
        } else {
          ref.current = textareaRef.current
        }
      }
    }, [ref])

    // Handle screen size changes for responsive placeholder
    useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      
      return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    const countWords = (text: string): number => {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const wordCount = countWords(newValue)
      
      // Only update if within word limit
      if (wordCount <= MAX_WORDS) {
        setInput(newValue)
      }
    }

    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      
      // Calculate the new height based on content
      const scrollHeight = textarea.scrollHeight
      const minHeight = 52 // Minimum height
      const maxHeight = 200 // Maximum height (about 8 lines)
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      
      // Set the new height
      textarea.style.height = `${newHeight}px`
      
      // Handle scrolling if content exceeds max height
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }

    // Adjust height on input change
    useLayoutEffect(() => {
      adjustTextareaHeight()
    }, [input])

    // Adjust height on component mount
    useEffect(() => {
      adjustTextareaHeight()
    }, [])

    // Responsive placeholder text
    const placeholderText = isMobile 
      ? t('placeholderMobile') 
      : t('placeholder')

    const handleSubmit = (e: React.FormEvent) => {
      if (input.trim()) {
        trackSearch(input.trim())
      }
      onSendMessage(e)
    }

    return (
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto p-3 md:p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="flex items-end space-x-2 md:space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder={placeholderText}
                className="w-full p-3 md:p-4 pr-16 md:pr-14 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm md:text-base leading-6 transition-all duration-200 ease-out"
                rows={1}
                style={{ 
                  minHeight: "52px",
                  maxHeight: "200px",
                  height: "52px",
                  overflowY: "hidden"
                }}
              />
              
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim() || isStreaming}
                className="absolute right-2 md:right-3 bottom-2 md:bottom-3 p-3 md:p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors shadow-md md:shadow-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading || isStreaming ? (
                  <Loader2 className="h-5 w-5 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 md:h-4 md:w-4" />
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    )
  }
)

ChatInput.displayName = "ChatInput" 