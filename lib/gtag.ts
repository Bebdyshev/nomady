// Google Analytics utility functions

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
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
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
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