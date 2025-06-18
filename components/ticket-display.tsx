"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  Plane, 
  Hotel, 
  Car, 
  Utensils, 
  MapPin, 
  Clock, 
  Star, 
  Calendar,
  DollarSign,
  Users,
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface SearchResult {
  type?: "flights" | "hotels" | "restaurants" | "activities" | "cars"
  id?: string
  name?: string
  description?: string
  price?: string | number
  rating?: number
  location?: string
  duration?: string
  category?: string
  availability?: string
  image_url?: string
  is_selected?: boolean
  refundable?: boolean
  validating_airline?: string
  check_in?: string
  check_out?: string
  amenities?: string[]
  flights_to?: Array<{
    from: string
    to: string
    departure_date?: string
    departure_time?: string
    arrival_date?: string
    arrival_time?: string
    flight_number?: string
    airline?: string
    airplane?: string
    duration?: string
    seats?: string
  }>
  flights_return?: Array<{
    from: string
    to: string
    departure_date?: string
    departure_time?: string
    arrival_date?: string
    arrival_time?: string
    flight_number?: string
    airline?: string
    airplane?: string
    duration?: string
    seats?: string
  }>
  hotels?: Array<{
    id?: string
    name?: string
    description?: string
    price?: string | number
    rating?: number
    location?: string
    duration?: string
    category?: string
    availability?: string
    image_url?: string
    is_selected?: boolean
    [key: string]: any
  }>
  restaurants?: Array<{
    id?: string
    name?: string
    description?: string
    price?: string | number
    rating?: number
    location?: string
    duration?: string
    category?: string
    availability?: string
    image_url?: string
    is_selected?: boolean
    [key: string]: any
  }>
  items?: Array<{
    id?: string
    name: string
    description?: string
    price?: string | number
    rating?: number
    location?: string
    duration?: string
    category?: string
    availability?: string
    image_url?: string
    is_selected?: boolean
    [key: string]: any
  }>
  [key: string]: any
}

interface TicketDisplayProps {
  toolOutput: SearchResult | SearchResult[]
  bookedIds: Set<string>
  onBooked: (item: any, id: string, type: string) => void
}

export function TicketDisplay({ toolOutput, bookedIds, onBooked }: TicketDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Normalize toolOutput to array for consistent processing
  const outputArray: SearchResult[] = Array.isArray(toolOutput) ? toolOutput : [toolOutput]

  const handleBooking = async (item: any, type: string) => {
    const itemId = item.id || item.combination_id || `${type}-${Date.now()}`
    setBookingStates(prev => ({ ...prev, [itemId]: true }))

    try {
      let response
      switch (type) {
        case "flights":
          response = await apiClient.bookTicket(item)
          break
        case "hotels":
          response = await apiClient.bookHotel(item)
          break
        case "restaurants":
          response = await apiClient.bookRestaurant(item)
          break
        case "activities":
          response = await apiClient.bookActivity(item)
          break
        default:
          throw new Error(`Unknown booking type: ${type}`)
      }

      if (response.data) {
        toast({
          title: "Booking Successful!",
          description: `${item.name} has been booked successfully.`,
        })

        onBooked(item, itemId, type)
      } else {
        throw new Error(response.error || "Booking failed")
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBookingStates(prev => ({ ...prev, [itemId]: false }))
    }
  }

  // Group search results by type
  const groupedResults = outputArray.reduce((acc, result) => {
    if (result.flights) {
      acc.flights = [...(acc.flights || []), ...result.flights]
    }
    if (result.hotels) {
      acc.hotels = [...(acc.hotels || []), ...result.hotels]
    }
    if (result.restaurants) {
      acc.restaurants = [...(acc.restaurants || []), ...result.restaurants]
    }
    if (result.items) {
      const type = result.type || "activities"
      acc[type] = [...(acc[type] || []), ...result.items]
    }
    // Handle direct result items
    if (result.type && result.name) {
      acc[result.type] = [...(acc[result.type] || []), result]
    }
    return acc
  }, {} as Record<string, any[]>)

  const getIcon = (type: string) => {
    switch (type) {
      case "flights":
        return <Plane className="h-5 w-5" />
      case "hotels":
        return <Hotel className="h-5 w-5" />
      case "restaurants":
        return <Utensils className="h-5 w-5" />
      case "cars":
        return <Car className="h-5 w-5" />
      case "activities":
        return <MapPin className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
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
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-slate-600 dark:text-slate-400 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  const renderItemCard = (item: any, type: string, index: number) => {
    const itemId = item.id || item.combination_id || `${type}-${index}`
    const isBooking = bookingStates[itemId] || false
    const isSelected = bookedIds.has(itemId) || item.is_selected

    return (
      <Card 
        key={itemId} 
        className={`border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:shadow-xl hover:scale-105 transition-transform duration-200 text-base ${
          isSelected ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : ''
        }`}
      >
        <CardHeader className="p-4 pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1">
              {item.name}
              {isSelected && (
                <Badge className="ml-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[10px] px-1.5 py-0.5">
                  Selected
                </Badge>
              )}
            </CardTitle>
            {item.price && (
              <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs px-2 py-0.5">
                {formatPrice(item.price)}
              </Badge>
            )}
          </div>
          {item.rating && renderStars(item.rating)}
        </CardHeader>
        
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          {type === "hotels" && item.image_url && (
            <img src={item.image_url} alt={item.name} className="w-full h-24 object-cover rounded-md" />
          )}
          {/* Compact view: hide long description */}
          {/* Location & duration */}
          <div className="space-y-1">
            {type === "flights" && item.flights_to && (
              <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-300">
                <Plane className="h-3 w-3" />
                <span className="truncate max-w-[7rem]">
                  {item.flights_to[0].from}→{item.flights_to[item.flights_to.length-1].to}
                </span>
              </div>
            )}
            {type === "flights" && item.flights_to && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{item.flights_to[0].departure_date} {item.flights_to[0].departure_time}</span>
                <span>•</span>
                <span>{item.flights_to[item.flights_to.length-1].arrival_date} {item.flights_to[item.flights_to.length-1].arrival_time}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[7rem]">{item.location}</span>
              </div>
            )}
            {item.duration && (
              <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-300">
                <Clock className="h-3 w-3" />
                <span>{item.duration}</span>
              </div>
            )}
          </div>
          
          {type === "flights" && (
            <div className="flex flex-wrap gap-1 text-xs">
              {item.refundable && <Badge variant="outline">Refundable</Badge>}
              {item.flights_to && item.flights_to.length > 1 && (
                <Badge variant="outline">{item.flights_to.length - 1} stops</Badge>
              )}
              {item.validating_airline && (
                <Badge variant="outline">{item.validating_airline}</Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-3 text-sm text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
                >
                  Details
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[560px] text-base">
                <DialogHeader>
                  <DialogTitle>{item.name}</DialogTitle>
                  {item.location && (
                    <DialogDescription className="flex items-center space-x-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </DialogDescription>
                  )}
                </DialogHeader>

                <div className="space-y-3 text-sm">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-56 object-cover rounded-lg shadow" />
                  )}

                  {item.description && <p>{item.description}</p>}

                  <div className="flex flex-wrap gap-2 text-sm">
                    {item.price && (
                      <Badge variant="secondary">Price: {formatPrice(item.price)}</Badge>
                    )}
                    {item.rating && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {renderStars(item.rating)}
                      </Badge>
                    )}
                    {item.duration && (
                      <Badge variant="secondary">Duration: {item.duration}</Badge>
                    )}
                    {item.category && (
                      <Badge variant="secondary">{item.category}</Badge>
                    )}
                    {item.availability && (
                      <Badge variant="secondary">{item.availability}</Badge>
                    )}
                    {type === "flights" && item.validating_airline && (
                      <Badge variant="secondary" className="ml-1 flex-shrink-0 text-[10px] px-1.5 py-0.5">
                        {item.validating_airline}
                      </Badge>
                    )}
                    {type === "hotels" && item.check_in && (
                      <Badge variant="secondary">Check-in: {item.check_in}</Badge>
                    )}
                    {type === "hotels" && item.check_out && (
                      <Badge variant="secondary">Check-out: {item.check_out}</Badge>
                    )}
                  </div>
                </div>

                {type === "flights" && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Outbound</h4>
                    {item.flights_to.map((seg: any, i: number) => (
                      <div key={i} className="border p-3 rounded-md bg-slate-50 dark:bg-slate-900 text-sm space-y-0.5">
                        <div className="flex justify-between"><span>{seg.from} → {seg.to}</span><span>{seg.duration}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>{seg.departure_time}</span><span>{seg.arrival_time}</span></div>
                        <div className="flex justify-between"><span>{seg.airline}</span><span>{seg.flight_number}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {type === "flights" && item.flights_return && (
                  <div className="space-y-3 pt-4">
                    <h4 className="font-medium">Return</h4>
                    {item.flights_return.map((seg: any, i: number) => (
                      <div key={i} className="border p-3 rounded-md bg-slate-50 dark:bg-slate-900 text-sm space-y-0.5">
                        <div className="flex justify-between"><span>{seg.from} → {seg.to}</span><span>{seg.duration}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>{seg.departure_time}</span><span>{seg.arrival_time}</span></div>
                        <div className="flex justify-between"><span>{seg.airline}</span><span>{seg.flight_number}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {type === "hotels" && item.amenities && (
                  <div className="pt-3">
                    <h4 className="font-medium mb-1">Amenities</h4>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {item.amenities.slice(0, 20).map((am: string, i: number) => (
                        <Badge key={i} variant="outline" className="mb-1">
                          {am}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-4">
                  <Button
                    size="sm"
                    onClick={() => handleBooking(item, type)}
                    disabled={isBooking || isSelected}
                    className="text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white disabled:opacity-50 shadow"
                  >
                    {isBooking ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isSelected ? (
                      "Booked"
                    ) : (
                      "Book"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-4 space-y-6">
      {Object.entries(groupedResults).map(([type, items]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center space-x-2">
            {getIcon(type)}
            <h3 className="font-semibold text-slate-900 dark:text-white capitalize text-sm">
              {type}
            </h3>
            <Badge className={`${getTypeColor(type)} text-[11px]`}> 
              {items.length}
            </Badge>
          </div>
          
          {(() => {
            const hasBooked = items.some((it: any, idx: number) => {
              const itId = it.id || it.combination_id || `${type}-${idx}`
              return bookedIds.has(itId) || it.is_selected
            })
            const visibleItems = hasBooked ? items.filter((it: any, idx:number)=>{
              const itId = it.id || it.combination_id || `${type}-${idx}`
              return bookedIds.has(itId) || it.is_selected
            }) : items.slice(0,8)
            return (
              <div className="grid gap-3 max-w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
                <AnimatePresence>
                  {visibleItems.map((item,index)=>(
                    <motion.div key={item.id||item.combination_id||index}
                      initial={{opacity:0,scale:0.9}}
                      animate={{opacity:1,scale:1}}
                      exit={{opacity:0,scale:0.9}}
                      transition={{duration:0.2}}
                    >
                      {renderItemCard(item,type,index)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          })()}
          
          {items.length > 8 && (
            <div className="text-center">
              <Button variant="ghost" className="text-xs text-blue-600 dark:text-blue-400">
                View {items.length - 8} more
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 