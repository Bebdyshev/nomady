"use client"

import { MessageCircle, Search, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/i18n-client"
import Image from "next/image"
import { ChatModeSwitcher } from "./chat-mode-switcher"

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void
  currentMode?: "search" | "generate"
  onModeChange?: (mode: "search" | "generate") => void
}

export function WelcomeScreen({ 
  onSuggestionClick, 
  currentMode = "search", 
  onModeChange 
}: WelcomeScreenProps) {
  const t = useTranslations('chat.welcome')

  // Different suggestions based on mode
  const searchSuggestions = [
    { icon: "✈️", text: "Find flights from New York to Tokyo" },
    { icon: "🏨", text: "Best hotels in London under $300" },
    { icon: "🍽️", text: "Family-friendly restaurants in Rome" },
    { icon: "🎯", text: "Things to do in Barcelona" },
  ]

  const generateSuggestions = [
    { icon: "📝", text: "Create a 5-day itinerary for Paris" },
    { icon: "💡", text: "Plan a romantic honeymoon in Bali" },
    { icon: "🎒", text: "Design a budget backpacking trip" },
    { icon: "👨‍👩‍👧‍👦", text: "Plan a family vacation to Disney World" },
  ]

  const suggestions = currentMode === "search" ? searchSuggestions : generateSuggestions

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      {/* Mode Switcher at the top */}
      {onModeChange && (
        <div className="mb-6">
          <ChatModeSwitcher
            currentMode={currentMode}
            onModeChange={onModeChange}
            className="text-sm"
          />
        </div>
      )}
      
      <div className="w-16 bg-blue-500"> </div>
      {
        currentMode === "search" ? (
          <Image src="/welcome-search.png" alt="Logo" width={150} height={150} className="mb-2 md:mb-4 " />
        ) : (
          <Image src="/welcome-generate.png" alt="Logo" width={150} height={150} className="mb-2 md:mb-4 " />
        )
      }
      
      {/* Different titles and subtitles based on mode */}
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">
        {currentMode === "search" ? t('searchTitle') : t('generateTitle')}
      </h2>
      <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 max-w-md">
        {currentMode === "search" ? t('searchSubtitle') : t('generateSubtitle')}
      </p>
      
      <div className="text-sm font-medium text-slate-700 mb-4">
        {currentMode === "search" ? t('searchSuggestionsTitle') : t('generateSuggestionsTitle')}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="p-3 md:p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg md:text-xl">{suggestion.icon}</span>
              <span className="text-sm md:text-base text-slate-700">
                {suggestion.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
} 