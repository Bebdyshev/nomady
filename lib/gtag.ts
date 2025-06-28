// Google Analytics utility functions

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

// Проверка что мы на клиенте и GA инициализирован
const isGAReady = () => {
  return typeof window !== 'undefined' && 
         window.gtag && 
         GA_TRACKING_ID &&
         typeof window.gtag === 'function'
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (isGAReady()) {
    try {
      window.gtag('config', GA_TRACKING_ID!, {
        page_path: url,
      })
    } catch (error) {
      console.warn('GA pageview error:', error)
    }
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (isGAReady()) {
    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    } catch (error) {
      console.warn('GA event error:', error)
    }
  }
}

// Custom events for travel app
export const trackBooking = (type: 'hotel' | 'restaurant' | 'activity', name: string) => {
  event({
    action: 'booking',
    category: type,
    label: name,
  })
}

export const trackSearch = (query: string, type?: string) => {
  event({
    action: 'search',
    category: 'chat',
    label: `${type || 'general'}: ${query}`,
  })
}

export const trackMapInteraction = (action: 'open' | 'close' | 'marker_click') => {
  event({
    action: action,
    category: 'map',
  })
}

// Global gtag declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
} 