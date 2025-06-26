"use client"

import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const suggestions = [
    { icon: "✈️", text: "Find flights to Paris" },
    { icon: "🏨", text: "Hotels in Tokyo" },
    { icon: "🍽️", text: "Best restaurants in Rome" },
    { icon: "🎯", text: "Things to do in New York" },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 md:mb-6">
        <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">
        Welcome to Your Travel Assistant
      </h2>
      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 md:mb-8 max-w-md">
        Ask me anything about flights, hotels, restaurants, or activities. I'll help you find and book the
        perfect options for your trip.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg md:text-xl">{suggestion.icon}</span>
              <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">
                {suggestion.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
} 