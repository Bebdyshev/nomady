"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveMap } from "@/components/interactive-map"
import { useTranslations } from "@/lib/i18n-client"

interface MobileMapOverlayProps {
  showMobileMap: boolean
  setShowMobileMap: (show: boolean) => void
  bookedItems: Record<string, any>
  onRemoveItem: (id: string) => void
  onClearAll: () => void
}

export function MobileMapOverlay({
  showMobileMap,
  setShowMobileMap,
  bookedItems,
  onRemoveItem,
  onClearAll
}: MobileMapOverlayProps) {
  const t = useTranslations('chat.map')

  return (
    <AnimatePresence>
      {showMobileMap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setShowMobileMap(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 h-[90vh] bg-white rounded-t-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{t('title')}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMap(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(90vh-60px)]">
              <InteractiveMap
                selectedItems={Object.values(bookedItems)}
                onRemoveItem={onRemoveItem}
                onClearAll={onClearAll}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 