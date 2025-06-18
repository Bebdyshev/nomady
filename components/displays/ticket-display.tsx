"use client"

import React from "react"
import { useState, useEffect } from "react"
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
  Loader2,
  ArrowRight,
  Wifi,
  Luggage,
  Shield,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface FlightSegment {
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
}

interface SearchResult {
  type?: "flights" | "hotels" | "restaurants" | "activities" | "cars"
  id?: string
  combination_id?: string
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
  images?: string[]
  amenities?: string[]
  flights_to?: FlightSegment[]
  flights_return?: FlightSegment[]
  hotels?: any[]
  restaurants?: any[]
  items?: any[]
  [key: string]: any
}

interface TicketDisplayProps {
  toolOutput: SearchResult | SearchResult[]
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Animated Flight Path Component
const FlightPath = ({ segments, isReturn = false }: { segments: FlightSegment[]; isReturn?: boolean }) => {
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative py-6">
      <div className="flex items-center justify-between relative">
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center space-y-2 z-10">
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
              <div className="text-center">
                <div className="font-semibold text-sm text-slate-900 dark:text-white">{segment.from}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{segment.departure_time}</div>
              </div>
            </div>

            {index < segments.length - 1 && (
              <div className="flex-1 relative mx-4">
                <div className="h-0.5 bg-slate-200 dark:bg-slate-700 relative overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: index * 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                  />
                </div>
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 text-blue-600"
                  animate={{ x: [0, 50, 100, 150] }}
                  transition={{ duration: 2, delay: index * 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  <Plane className="h-4 w-4 rotate-90" />
                </motion.div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {segment.duration}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="flex flex-col items-center space-y-2 z-10">
          <div className="w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-lg" />
          <div className="text-center">
            <div className="font-semibold text-sm text-slate-900 dark:text-white">
              {segments[segments.length - 1]?.to}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {segments[segments.length - 1]?.arrival_time}
            </div>
          </div>
        </div>
      </div>

      {isReturn && (
        <div className="absolute top-0 right-0">
          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
            Return
          </Badge>
        </div>
      )}
    </div>
  )
}

// Enhanced Flight Card Component
const FlightCard = ({ item, onBook, isBooked, isBooking }: any) => {
  const [currentPage, setCurrentPage] = useState(0)
  const itemId = item.combination_id || item.id || `flight-${Date.now()}`

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KZT",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const totalDuration =
    item.flights_to?.reduce((acc: number, flight: FlightSegment) => {
      const duration = flight.duration?.match(/(\d+)ч\s*(\d+)?м?/)
      if (duration) {
        const hours = Number.parseInt(duration[1]) || 0
        const minutes = Number.parseInt(duration[2]) || 0
        return acc + hours * 60 + minutes
      }
      return acc
    }, 0) || 0

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card
            className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
              isBooked
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-xl"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600" />

            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm md:text-base lg:text-lg font-bold text-slate-900 dark:text-white">
                      {item.validating_airline}
                    </CardTitle>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
                      {item.flights_to?.[0]?.from} → {item.flights_to?.[item.flights_to.length - 1]?.to}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{formatPrice(item.price)}</div>
                  <div className="flex items-center space-x-1 text-sm">
                    {item.refundable && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Refundable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[4rem] text-xs md:text-sm">
                        {item.flights_to?.[0]?.departure_time}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[5rem]">
                        {item.flights_to?.[0]?.departure_date}
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <div className="h-0.5 w-8 bg-slate-300 dark:bg-slate-600" />
                        <Plane className="h-4 w-4 text-slate-400 rotate-90" />
                        <div className="h-0.5 w-8 bg-slate-300 dark:bg-slate-600" />
                      </div>
                    </div>

                    <div className="text-center min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[4rem] text-xs md:text-sm">
                        {item.flights_to?.[item.flights_to.length - 1]?.arrival_time}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[5rem]">
                        {item.flights_to?.[item.flights_to.length - 1]?.arrival_date}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Duration: {formatDuration(totalDuration)}</span>
                  <span>
                    {item.flights_to && item.flights_to.length > 1
                      ? `${item.flights_to.length - 1} stop${item.flights_to.length > 2 ? "s" : ""}`
                      : "Direct"}
                  </span>
                  <span>Seats: {item.flights_to?.[0]?.seats}</span>
                </div>

                {isBooked && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Booked</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{item.validating_airline}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-normal">Flight Details & Booking</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price and Key Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(item.price)}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Total for 1 passenger</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.refundable && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Refundable
                  </Badge>
                )}
                <Badge variant="outline">
                  <Luggage className="h-3 w-3 mr-1" />
                  Baggage Included
                </Badge>
                <Badge variant="outline">
                  <Wifi className="h-3 w-3 mr-1" />
                  WiFi Available
                </Badge>
              </div>
            </div>
          </div>

          {/* Flight Path Visualization */}
          {item.flights_to && (
            <div className="space-y-6 md:space-y-0 md:flex md:space-x-6">
              {/* Outbound */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-blue-600" />
                  Outbound
                </h3>
                {/* Detailed Segments */}
                <div className="space-y-3">
                  {item.flights_to.map((segment: FlightSegment, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-xs md:text-sm shadow-sm"
                    >
                      <div className="flex justify-between"><span>{segment.from} → {segment.to}</span><span>{segment.duration}</span></div>
                      <div className="flex justify-between text-slate-500"><span>{segment.departure_time}</span><span>{segment.arrival_time}</span></div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Return if exists */}
              {item.flights_return && (
                <div className="flex-1 space-y-4 mt-10 md:mt-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2 text-orange-600 rotate-180" />
                    Return
                  </h3>

                  <div className="space-y-3">
                    {item.flights_return.map((segment: FlightSegment, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700 text-xs md:text-sm shadow-sm"
                      >
                        <div className="flex justify-between"><span>{segment.from} → {segment.to}</span><span>{segment.duration}</span></div>
                        <div className="flex justify-between text-slate-500"><span>{segment.departure_time}</span><span>{segment.arrival_time}</span></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(item.price)}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Total price for 1 passenger</div>
            </div>

            <Button
              size="sm"
              onClick={() => onBook?.(item, "flights")}
              disabled={isBooking || isBooked}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Booking...
                </>
              ) : isBooked ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Booked
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Book Flight
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TicketDisplay({ toolOutput, bookedIds = new Set(), onBooked }: TicketDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const outputArray: SearchResult[] = Array.isArray(toolOutput) ? toolOutput : [toolOutput]
  
  const isFromLoadedConversation = outputArray.length > 0 && outputArray[0]?.search_result_id

  const handleBooking = async (item: any, type: string) => {
    const items = groupedResults[type] || []
    const index = items.findIndex(it => 
      (it.id && it.id === item.id) || 
      (it.combination_id && it.combination_id === item.combination_id) ||
      it === item
    )
    const itemId = item.id || item.combination_id || `${type}-${index}`
    setBookingStates((prev) => ({ ...prev, [itemId]: true }))

    try {
      // Debug: Log the item data to understand what's missing
      console.log("Booking item:", {
        item,
        search_result_id: item.search_result_id,
        type,
        itemId,
        allKeys: Object.keys(item)
      })

      // Check if search_result_id is available
      if (!item.search_result_id) {
        console.error("Missing search_result_id. Full item data:", item)
        toast({
          title: "Booking Not Available",
          description: "This item is from an older search. Please make a new search to book items.",
          variant: "destructive",
        })
        return
      }

      const selected_item_id = item.id || item.combination_id || `${index}`
      const bookingData = {
        search_result_id: item.search_result_id,
        selected_item_id: selected_item_id
      }

      let response
      switch (type) {
        case "flights":
          response = await apiClient.bookTicket(bookingData)
          break
        case "hotels":
          response = await apiClient.bookHotel(bookingData)
          break
        case "restaurants":
          response = await apiClient.bookRestaurant(bookingData)
          break
        case "activities":
          response = await apiClient.bookActivity(bookingData)
          break
        default:
          throw new Error(`Unsupported booking type: ${type}`)
      }

      console.log("Booking response:", response)

      toast({
        title: "Booking Successful! ✈️",
        description: `Your ${type} has been booked successfully.`,
      })

      onBooked?.(item, itemId, type)
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBookingStates((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  // Group search results by type
  const groupedResults = outputArray.reduce(
    (acc, result) => {
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
      if (result.type && (result.name || result.combination_id)) {
      acc[result.type] = [...(acc[result.type] || []), result]
    }
    return acc
    },
    {} as Record<string, any[]>,
  )

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

    return (
    <div className="mt-6 space-y-8">
      {Object.entries(groupedResults).map(([type, items]) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
              {getIcon(type)}
                </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white capitalize">{type}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                {items.length} option{items.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Badge className={`${getTypeColor(type)} ml-auto text-xs`}>{items.length}</Badge>
          </div>
          
          {(() => {
            // Check if this data is from a loaded conversation (all items should have search_result_id)
            const isFromLoadedConversation = items.length > 0 && items[0]?.search_result_id
            
            if (isFromLoadedConversation) {
              // For loaded conversations, API already filtered to show only booked items
              // So display all items returned by the API
              const displayItems = items
              
              return (
                <>
                  {/* Responsive grid: 1 col on mobile, 2 on tablet, 3+ on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                    <AnimatePresence>
                      {displayItems.map((item, index) => {
                        const itemId = item.id || item.combination_id || `${type}-${index}`
                        const isBooked = bookedIds.has(itemId) || item.is_selected
                        const isBooking = bookingStates[itemId] || false

                        if (type === "flights") {
                          return (
                            <motion.div
                              key={itemId}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <FlightCard item={item} onBook={handleBooking} isBooked={isBooked} isBooking={isBooking} />
                            </motion.div>
                          )
                        }

                        // For other types, render simplified cards
                        return (
                          <motion.div
                            key={itemId}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="hover:shadow-lg transition-all duration-300">
                              <CardHeader className="p-3 md:p-4">
                                <CardTitle className="text-sm md:text-base lg:text-lg">{item.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 md:p-4 pt-0">
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-4">{item.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm md:text-lg">₸{item.price}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleBooking(item, type)}
                                    disabled={isBooking || isBooked}
                                    className="bg-blue-600 hover:bg-blue-700 px-2 md:px-3 py-1 text-xs md:text-sm"
                                  >
                                    {isBooking ? (
                                      <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                    ) : isBooked ? (
                                      "Booked"
                                    ) : (
                                      "Book Now"
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </>
              )
            } else {
              // For new searches, use the existing logic (show booked items or first 6)
              const hasBooked = items.some((it: any, idx: number) => {
                const itId = it.id || it.combination_id || `${type}-${idx}`
                return bookedIds.has(itId) || it.is_selected
              })
              const displayItems = hasBooked ? items.filter((it: any, idx: number) => {
                const itId = it.id || it.combination_id || `${type}-${idx}`
                return bookedIds.has(itId) || it.is_selected
              }) : items.slice(0, 6)

              return (
                <>
                  {/* Responsive grid: 1 col on mobile, 2 on tablet, 3+ on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                    <AnimatePresence>
                      {displayItems.map((item, index) => {
                        const itemId = item.id || item.combination_id || `${type}-${index}`
                        const isBooked = bookedIds.has(itemId) || item.is_selected
                        const isBooking = bookingStates[itemId] || false

                        if (type === "flights") {
                          return (
                            <motion.div
                              key={itemId}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <FlightCard item={item} onBook={handleBooking} isBooked={isBooked} isBooking={isBooking} />
                            </motion.div>
                          )
                        }

                        // For other types, render simplified cards
                        return (
                          <motion.div
                            key={itemId}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="hover:shadow-lg transition-all duration-300">
                              <CardHeader className="p-3 md:p-4">
                                <CardTitle className="text-sm md:text-base lg:text-lg">{item.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 md:p-4 pt-0">
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-4">{item.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm md:text-lg">₸{item.price}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleBooking(item, type)}
                                    disabled={isBooking || isBooked}
                                    className="bg-blue-600 hover:bg-blue-700 px-2 md:px-3 py-1 text-xs md:text-sm"
                                  >
                                    {isBooking ? (
                                      <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                    ) : isBooked ? (
                                      "Booked"
                                    ) : (
                                      "Book Now"
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                  {!hasBooked && items.length > 6 && (
                    <div className="text-center">
                      <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs md:text-sm">
                        View {items.length - 6} more {type}
                      </Button>
                    </div>
                  )}
                </>
              )
            }
          })()}
        </motion.div>
      ))}
    </div>
  )
} 
