"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Plane, Hotel, Car, Utensils, X, Star } from "lucide-react"
import { useTranslations } from "@/lib/i18n-client"

interface SelectedItem {
  id: string
  name: string
  type: string
  price?: string | number
  location?: string | { address?: string; distance_from_center?: string; coordinates?: any; distances?: any }
  rating?: number
  description?: string
  duration?: string
  category?: string
  availability?: string
}

interface InteractiveMapProps {
  selectedItems: SelectedItem[]
  onRemoveItem: (id: string) => void
  onClearAll: () => void
}

export function InteractiveMap({ selectedItems, onRemoveItem, onClearAll }: InteractiveMapProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const t = useTranslations('chat.map')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      // This would be handled by the parent component
      window.dispatchEvent(new CustomEvent("ticketDropped", { detail: data }))
    } catch (error) {
      console.error("Error parsing dropped data:", error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "flights":
        return <Plane className="h-4 w-4" />
      case "hotels":
        return <Hotel className="h-4 w-4" />
      case "restaurants":
        return <Utensils className="h-4 w-4" />
      case "cars":
        return <Car className="h-4 w-4" />
      case "activities":
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "flights":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "hotels":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "restaurants":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "cars":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "activities":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return null
    if (typeof price === "number") {
      return `$${price}`
    }
    return price.toString().includes("$") ? price : `$${price}`
  }

  const renderStars = (rating: number | undefined) => {
    if (!rating) return null
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-slate-600 dark:text-slate-400 ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getLocationDisplay = (loc: any): string => {
    if (!loc) return ""
    if (typeof loc === "string") return loc
    if (typeof loc === "object") {
      if (loc.address && loc.address !== "N/A") return loc.address
      if (loc.distance_from_center && loc.distance_from_center !== "N/A") return loc.distance_from_center
    }
    return ""
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('title')}</h3>
          {selectedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
            >
              {t('clearAll')}
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {selectedItems.length} {selectedItems.length === 1 ? t('itemSelected') : t('itemsSelected')}
        </p>
      </div>

      <div
        className={`flex-1 transition-colors duration-200 ${
          isDragOver
            ? "bg-blue-50 dark:bg-blue-950/30 border-2 border-dashed border-blue-400"
            : "bg-slate-50 dark:bg-slate-900"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedItems.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('noItems')}</h4>
              <p className="text-slate-600 dark:text-slate-300 max-w-sm">
                {t('addItems')}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {selectedItems.map((item, idx) => (
                <div key={item.id} className="flex items-start space-x-3">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </div>
                    {idx < selectedItems.length - 1 && (
                      <div className="flex-1 w-px bg-slate-300 dark:bg-slate-700"></div>
                    )}
                  </div>

                  {/* Card */}
                  <Card className="relative flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getIcon(item.type)}
                          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Badge className={`${getTypeColor(item.type)} w-fit`}>{item.type}</Badge>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">{item.description}</p>
                    )}

                    <div className="space-y-1">
                      {item.location && getLocationDisplay(item.location) && (
                        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{getLocationDisplay(item.location)}</span>
                        </div>
                      )}

                      {item.price && (
                        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      )}

                      {item.rating && <div className="flex items-center space-x-1">{renderStars(item.rating)}</div>}
                    </div>
                  </CardContent>
                </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
