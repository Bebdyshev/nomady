import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ru'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

// Auto-detect locale based on browser settings
export function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  // Check saved locale from localStorage
  const savedLocale = localStorage.getItem('locale') as Locale
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale
  }

  // Detect from browser language
  const browserLanguage = navigator.language.split('-')[0] as Locale
  if (locales.includes(browserLanguage)) {
    // Save detected locale for future visits
    localStorage.setItem('locale', browserLanguage)
    return browserLanguage
  }

  // Fallback to default
  localStorage.setItem('locale', defaultLocale)
  return defaultLocale
}

export default getRequestConfig(async () => {
  // This function runs on the server
  // For client-side locale detection, we'll use a different approach
  const locale = defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
}) 