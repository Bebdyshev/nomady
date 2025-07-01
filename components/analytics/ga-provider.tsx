"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { pageview } from "@/lib/gtag"

export function GoogleAnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Проверяем что мы на клиенте и GA загружен
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      pageview(url)
    }
  }, [pathname, searchParams])

  return null
} 