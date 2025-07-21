"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 32, height = 32 }: LogoProps) {
  
  useEffect(() => {
    // Логотип всегда светлый
  }, [])
  
  return (
    <Image
      src="/logo-light.svg"
      alt="Nomady Logo"
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority
    />
  )
} 