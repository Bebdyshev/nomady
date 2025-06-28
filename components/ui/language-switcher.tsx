"use client"

import React from 'react'
import { Button } from './button'
import { useI18n } from '@/lib/i18n-client'
import { type Locale } from '@/i18n'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const languages = [
    { code: 'en' as Locale, name: 'English', flag: '' },
    { code: 'ru' as Locale, name: 'Русский', flag: '' }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale)
  const otherLanguage = languages.find(lang => lang.code !== locale)

  const handleLanguageChange = () => {
    if (otherLanguage) {
      setLocale(otherLanguage.code)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLanguageChange}
        className="relative rounded-lg glass-button glass-enhanced transition-all duration-300 hover:scale-105 group flex items-center space-x-2 px-3 py-2"
      >
        <Globe className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {currentLanguage?.name}
        </span>
        <motion.div
          initial={false}
          animate={{ rotate: locale === 'ru' ? 360 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        >
          {locale === 'en' ? '🇺🇸' : '🇷🇺'}
        </motion.div>
      </Button>
    </motion.div>
  )
} 