"use client"

import { Menu, Map } from "lucide-react"
import { useTranslations } from "@/lib/i18n-client"

interface ChatHeaderProps {
  setSidebarOpen: (open: boolean) => void
  setShowMobileMap: (show: boolean) => void
  bookedItemsCount: number
}

export function ChatHeader({
  setSidebarOpen,
  setShowMobileMap,
  bookedItemsCount
}: ChatHeaderProps) {
  const t = useTranslations('chat')

  return (
    <div className="md:hidden flex items-center justify-between p-2 border-b border-slate-200 bg-white">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-1.5 rounded-lg hover:bg-slate-100 h-10 w-10 flex items-center justify-center"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <h1 className="text-base font-semibold text-slate-900">{t('title')}</h1>
      
      <button
        onClick={() => setShowMobileMap(true)}
        className="p-1.5 rounded-lg hover:bg-slate-100 relative h-10 w-10 flex items-center justify-center"
      >
        <Map className="h-5 w-5" />
        {bookedItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {bookedItemsCount}
          </span>
        )}
      </button>
    </div>
  )
} 