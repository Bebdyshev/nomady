"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Plane, Hotel, Car, Utensils, X, Star } from "lucide-react"
import { useTranslations } from "@/lib/i18n-client"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"

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

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = { lat: 55.751244, lng: 37.618423 } // Moscow as default

const cleanMapStyle = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] }
];

const ultraCleanMapStyle = [
  // Сделать все дороги белыми
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  // Скрыть все подписи дорог
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  // Скрыть районы и микрорайоны
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  // Скрыть все POI (как раньше)
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] }
];

export function InteractiveMap({ selectedItems, onRemoveItem, onClearAll }: InteractiveMapProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const t = useTranslations('chat.map')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  })

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
        return "bg-blue-100 text-blue-800"
      case "hotels":
        return "bg-purple-100 text-purple-800"
      case "restaurants":
        return "bg-orange-100 text-orange-800"
      case "cars":
        return "bg-green-100 text-green-800"
      case "activities":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        <span className="text-xs text-slate-600 ml-1">{rating.toFixed(1)}</span>
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

  // Helper to extract coordinates safely
  const getCoordinates = (loc: any): { lat: number; lng: number } | null => {
    if (!loc) return null
    if (typeof loc === 'object' && loc.coordinates && typeof loc.coordinates.lat === 'number' && typeof loc.coordinates.lng === 'number') {
      return loc.coordinates
    }
    return null
  }

  const firstCoord = selectedItems.map(item => getCoordinates(item.location)).find(Boolean) || defaultCenter

  const mapOptions = {
    mapTypeControl: false,
    styles: ultraCleanMapStyle,
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className={`flex-1 transition-colors duration-200 ${
          isDragOver
            ? "bg-blue-50 border-2 border-dashed border-blue-400"
            : "bg-slate-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minHeight: 400 }}
      >
        {apiKey ? (
          isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={firstCoord}
              zoom={12}
              options={mapOptions}
            >
              {selectedItems.map((item, idx) => {
                const coord = getCoordinates(item.location)
                return coord ? (
                  <Marker
                    key={item.id}
                    position={coord}
                    label={`${idx + 1}`}
                  />
                ) : null
              })}
            </GoogleMap>
          ) : (
            <div className="h-full flex items-center justify-center">Loading...</div>
          )
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Google Maps API key missing</h4>
              <p className="text-slate-600 max-w-sm">
                Please set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment variables.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
