"use client"

import { useTheme } from "@/components/shared/theme-provider"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 32, height = 32 }: LogoProps) {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true)
    } else if (theme === "light") {
      setIsDark(false)
    } else {
      // For system theme, check the actual computed theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)
      
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])
  
  return (
    <Image
      src={isDark ? "/logo-light.svg" : "/logo-light.svg"}
      alt="Nomady Logo"
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority
    />
  )
} 