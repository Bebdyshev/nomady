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
    <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 bg-white">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg hover:bg-slate-100 h-12 w-12 md:h-8 md:w-8 flex items-center justify-center"
      >
        <Menu className="h-6 w-6 md:h-5 md:w-5" />
      </button>
      <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
      <button
        onClick={() => setShowMobileMap(true)}
        className="p-2 rounded-lg hover:bg-slate-100 relative h-12 w-12 md:h-8 md:w-8 flex items-center justify-center"
      >
        <Map className="h-6 w-6 md:h-5 md:w-5" />
        {bookedItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {bookedItemsCount}
          </span>
        )}
      </button>
    </div>
  )
} 