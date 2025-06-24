"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot } from "lucide-react"

// Enhanced Search Animation Component
export const SearchAnimation = ({ searchType }: { searchType: string }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const searchSteps: Record<string, { icon: string; steps: string[] }> = {
    tickets: {
      icon: "✈️",
      steps: ["Scraping flight data...", "Analyzing prices...", "Collecting results..."],
    },
    hotels: {
      icon: "🏨",
      steps: ["Searching accommodations...", "Checking availability...", "Gathering options..."],
    },
    restaurants: {
      icon: "🍽️",
      steps: ["Finding restaurants...", "Reading reviews...", "Curating recommendations..."],
    },
    activities: {
      icon: "🎯",
      steps: ["Discovering activities...", "Checking schedules...", "Collecting experiences..."],
    },
  }

  const search = searchSteps[searchType] || {
    icon: "🔍",
    steps: ["Searching...", "Processing...", "Finalizing..."],
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % search.steps.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [search.steps.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 text-sm py-3 px-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <motion.span
        className="text-lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        {search.icon}
      </motion.span>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="font-medium"
          >
            {search.steps[currentStep]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Typing Indicator Component
export const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-[85%] md:max-w-[80%] rounded-lg px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 