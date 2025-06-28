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
        className="relative rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 group flex items-center space-x-2 px-3 py-2"
      >
        <Globe className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {currentLanguage?.name}
        </span>
        <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      </Button>
    </motion.div>
  )
} 