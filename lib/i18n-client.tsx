"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl'
import { detectLocale, type Locale, locales } from '../i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: AbstractIntlMessages | null
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [messages, setMessages] = useState<AbstractIntlMessages | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load messages for a specific locale
  const loadMessages = async (newLocale: Locale) => {
    try {
      const messageModule = await import(`../messages/${newLocale}.json`)
      setMessages(messageModule.default)
    } catch (error) {
      console.error(`Failed to load messages for locale: ${newLocale}`, error)
      // Fallback to English
      const fallbackModule = await import(`../messages/en.json`)
      setMessages(fallbackModule.default)
    }
  }

  // Set locale and save to localStorage
  const setLocale = async (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      return
    }
    
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    await loadMessages(newLocale)
  }

  // Initialize locale on mount
  useEffect(() => {
    const initializeLocale = async () => {
      const detectedLocale = detectLocale()
      setLocaleState(detectedLocale)
      await loadMessages(detectedLocale)
      setIsLoading(false)
    }

    initializeLocale()
  }, [])

  const value: I18nContextType = {
    locale,
    setLocale,
    messages
  }

  if (isLoading || !messages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <I18nContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Re-export useTranslations from next-intl for convenience
export { useTranslations } from 'next-intl' 