"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useTranslations } from "@/lib/i18n-client"
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
// Добавить импорт useMediaQuery для мобильной адаптации

// Aviasales data interfaces
interface AviasalesPrice {
  currency_code: string
  value: number
}

interface AviasalesFlightSegment {
  origin: string
  destination: string
  local_departure_date_time: string
  local_arrival_date_time: string
  departure_unix_timestamp: number
  arrival_unix_timestamp: number
  operating_carrier_designator: {
    carrier: string
    airline_id: string
    number: string
  }
  equipment: {
    code: string
    type: string
    name: string
  }
  technical_stops: any[]
  signature: string
  tags: any[]
  origin_city_ru: string
  destination_city_ru: string
  origin_city_en: string
  destination_city_en: string
  airline_name?: string
}

interface AviasalesTicket {
  id: string
  ticket_id?: string
  price: AviasalesPrice
  flights_to: AviasalesFlightSegment[]
  flights_return?: AviasalesFlightSegment[]
  route_ru: string
  route_en: string
  aviasales_url?: string
  refundable?: boolean
  passengers?: number
}

interface AviasalesData {
  cheapest_ticket: AviasalesTicket
  tickets: AviasalesTicket[]
  search_params?: any
  ai_recommended_indexes?: number[]
}

interface FlightSegment {
  from: string
  to: string
  from_city?: string
  to_city?: string
  departure_date?: string
  departure_time?: string
  arrival_date?: string
  arrival_time?: string
  flight_number?: string
  airline?: string
  airline_name?: string
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
  currency?: string
  rating?: number
  location?: string | {
    address?: string
    distance_from_center?: string
    coordinates?: { latitude: number; longitude: number }
    [key: string]: any
  }
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
  passengers?: number
  [key: string]: any
}

interface TicketDisplayProps {
  toolOutput: AviasalesData
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Function to detect if data is in Aviasales format
function isAviasalesData(data: any): data is AviasalesData {
  console.log("isAviasalesData check received:", data)
  
  const hasTicketsArray = Array.isArray(data?.tickets)
  const hasTickets = hasTicketsArray && data.tickets.length > 0
  const hasPrice = hasTickets && data.tickets[0]?.price
  const hasPriceValue = hasPrice && typeof data.tickets[0].price.value === 'number'
  const hasCurrency = hasPrice && typeof data.tickets[0].price.currency_code === 'string'
  
  const result = data && typeof data === 'object' && hasTicketsArray && hasTickets && hasPrice && hasPriceValue && hasCurrency
  
  console.log({
    hasTicketsArray,
    hasTickets,
    hasPrice,
    hasPriceValue,
    hasCurrency,
    result
  })
  
  return result
}

// Function to transform Aviasales data to SearchResult format
function transformAviasalesData(aviasalesData: AviasalesData): SearchResult[] {
  console.log('transformAviasalesData called with:', aviasalesData)
  
  return aviasalesData.tickets.map((ticket, ticketIndex) => {
    console.log(`Processing ticket ${ticketIndex}:`, ticket)
    
    // Calculate total duration for outbound flights
    const calculateDuration = (segments: any[]): string => {
      if (!segments || segments.length === 0) return "0h 0m"
      
      // Handle both unix timestamps and string timestamps
      const firstSegment = segments[0]
      const lastSegment = segments[segments.length - 1]
      
      let firstDeparture: number
      let lastArrival: number
      
      if (firstSegment.departure_unix_timestamp) {
        firstDeparture = firstSegment.departure_unix_timestamp
      } else if (firstSegment.local_departure_date_time) {
        firstDeparture = new Date(firstSegment.local_departure_date_time).getTime() / 1000
      } else {
        return "0h 0m"
      }
      
      if (lastSegment.arrival_unix_timestamp) {
        lastArrival = lastSegment.arrival_unix_timestamp
      } else if (lastSegment.local_arrival_date_time) {
        lastArrival = new Date(lastSegment.local_arrival_date_time).getTime() / 1000
      } else {
        return "0h 0m"
      }
      
      const totalMinutes = Math.floor((lastArrival - firstDeparture) / 60)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}h ${minutes}m`
    }

    // Transform flight segments with robust property handling
    const transformSegments = (segments: any[]): FlightSegment[] => {
      if (!segments || !Array.isArray(segments)) {
        console.log('No segments or invalid segments:', segments)
        return []
      }
      
      return segments.map((segment, segmentIndex) => {
        console.log(`Processing segment ${segmentIndex}:`, segment)
        
        // Handle datetime parsing with fallbacks
        let depDateTime: Date
        let arrDateTime: Date
        
        try {
          depDateTime = new Date(segment.local_departure_date_time || segment.departure_date_time || '')
          arrDateTime = new Date(segment.local_arrival_date_time || segment.arrival_date_time || '')
        } catch (error) {
          console.error('Error parsing dates for segment:', segment, error)
          depDateTime = new Date()
          arrDateTime = new Date()
        }
        
        // Calculate segment duration with fallbacks
        let segmentDuration = "0h 0m"
        try {
          if (segment.arrival_unix_timestamp && segment.departure_unix_timestamp) {
            const segmentMinutes = Math.floor((segment.arrival_unix_timestamp - segment.departure_unix_timestamp) / 60)
            const segHours = Math.floor(segmentMinutes / 60)
            const segMins = segmentMinutes % 60
            segmentDuration = `${segHours}h ${segMins}m`
          } else if (segment.duration) {
            segmentDuration = segment.duration
          }
        } catch (error) {
          console.error('Error calculating duration for segment:', segment, error)
        }

        // Extract carrier and flight number with fallbacks
        let flightNumber = "N/A"
        let airline = "Unknown"
        let airlineName = "Unknown Airline"
        
        try {
          if (segment.operating_carrier_designator?.carrier && segment.operating_carrier_designator?.number) {
            airline = segment.operating_carrier_designator.carrier
            flightNumber = `${segment.operating_carrier_designator.carrier}${segment.operating_carrier_designator.number}`
            airlineName = segment.airline_name || segment.operating_carrier_designator.carrier
          } else if (segment.carrier && segment.flight_number) {
            airline = segment.carrier
            flightNumber = segment.flight_number
            airlineName = segment.airline_name || segment.carrier
          } else if (segment.airline) {
            airline = segment.airline
            airlineName = segment.airline
            flightNumber = segment.flight_number || "N/A"
          }
        } catch (error) {
          console.error('Error extracting carrier info for segment:', segment, error)
        }

        // Extract airplane with fallback
        let airplane = "N/A"
        try {
          airplane = segment.equipment?.name || segment.aircraft || segment.airplane || "N/A"
        } catch (error) {
          console.error('Error extracting airplane for segment:', segment, error)
        }

        const result = {
          from: segment.origin || segment.from || "N/A",
          to: segment.destination || segment.to || "N/A",
          from_city: segment.origin_city_en || segment.origin_city || segment.from_city || segment.origin || segment.from || "N/A",
          to_city: segment.destination_city_en || segment.destination_city || segment.to_city || segment.destination || segment.to || "N/A",
          departure_date: isNaN(depDateTime.getTime()) ? "N/A" : depDateTime.toISOString().split('T')[0],
          departure_time: isNaN(depDateTime.getTime()) ? "N/A" : depDateTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          arrival_date: isNaN(arrDateTime.getTime()) ? "N/A" : arrDateTime.toISOString().split('T')[0],
          arrival_time: isNaN(arrDateTime.getTime()) ? "N/A" : arrDateTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          flight_number: flightNumber,
          airline: airline,
          airline_name: airlineName,
          airplane: airplane,
          duration: segmentDuration,
          seats: segment.seats || "Available"
        }
        
        console.log(`Transformed segment ${segmentIndex}:`, result)
        return result
      })
    }

    // Get airline name from first segment with fallback to multiple segments
    const getMainAirline = (ticket: any): string => {
      try {
        if (!ticket.flights_to || ticket.flights_to.length === 0) return "Unknown Airline"
        
        const firstSegment = ticket.flights_to[0]
        if (firstSegment.airline_name) {
          return firstSegment.airline_name
        }
        
        if (firstSegment.operating_carrier_designator?.carrier) {
          const carriers = ticket.flights_to.map((segment: any) => 
            segment.operating_carrier_designator?.carrier || segment.carrier || segment.airline || "Unknown"
          )
          const uniqueCarriers = [...new Set(carriers)]
          
          if (uniqueCarriers.length === 1) {
            return uniqueCarriers[0] as string
          } else {
            return uniqueCarriers.join(' + ')
          }
        }
        
        // Fallback to any available carrier info
        return firstSegment.carrier || firstSegment.airline || "Unknown Airline"
      } catch (error) {
        console.error('Error getting main airline:', error)
        return "Unknown Airline"
      }
    }

    const transformedFlightsTo = transformSegments(ticket.flights_to || [])
    const transformedFlightsReturn = ticket.flights_return ? transformSegments(ticket.flights_return) : undefined
    
    const result = {
      type: "flights" as const,
      id: ticket.id || ticket.ticket_id || `ticket-${ticketIndex}`,
      combination_id: ticket.id || ticket.ticket_id || `ticket-${ticketIndex}`,
      price: ticket.price?.value || 0,
      currency: ticket.price?.currency_code || "USD",
      validating_airline: getMainAirline(ticket),
      flights_to: transformedFlightsTo,
      flights_return: transformedFlightsReturn,
      refundable: ticket.refundable || false,
      passengers: ticket.passengers || 1,
      duration: calculateDuration(ticket.flights_to || []),
      route_en: ticket.route_en || "N/A",
      route_ru: ticket.route_ru || "N/A",
      aviasales_url: ticket.aviasales_url
    }
    
    console.log(`Transformed ticket ${ticketIndex}:`, result)
    return result
  })
}

// Animated Flight Path Component
const FlightPath = ({ segments, isReturn = false }: { segments: FlightSegment[]; isReturn?: boolean }) => {
  const [animationProgress, setAnimationProgress] = useState(0)
  const t = useTranslations('chat.displays')

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
                <div className="font-semibold text-sm text-slate-900 dark:text-white text-horizontal">{segment.from}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-horizontal">{segment.departure_time}</div>
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
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400 text-horizontal whitespace-nowrap">
                  {segment.duration}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="flex flex-col items-center space-y-2 z-10">
          <div className="w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-lg" />
          <div className="text-center">
            <div className="font-semibold text-sm text-slate-900 dark:text-white text-horizontal">
              {segments[segments.length - 1]?.to}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 text-horizontal">
              {segments[segments.length - 1]?.arrival_time}
            </div>
          </div>
        </div>
      </div>

      {isReturn && (
        <div className="absolute top-0 right-0">
          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
            {t('flights.return')}
          </Badge>
        </div>
      )}
    </div>
  )
}

// Enhanced Flight Card Component
const FlightCard = ({ item, onBook, isBooked, isBooking, formatPrice, isAIRecommended }: any) => {
  const [currentPage, setCurrentPage] = useState(0)
  const itemId = item.combination_id || item.id || `flight-${Date.now()}`
  const t = useTranslations('chat.displays')
  const [open, setOpen] = useState(false)

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card
            className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-300 flex flex-col min-h-[200px] card-layout ${
              isBooked
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : isAIRecommended
                  ? "border-yellow-400 shadow-yellow-200/40"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-xl"
            }`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isAIRecommended ? 'from-yellow-300 via-yellow-400 to-orange-400' : 'from-blue-500 via-purple-500 to-blue-600'}`} />

            <CardHeader className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white text-horizontal text-wrap-normal leading-tight">
                      {item.validating_airline}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-horizontal text-wrap-normal truncate">
                      {item.flights_to?.[0]?.from_city || item.flights_to?.[0]?.from} → {item.flights_to?.[item.flights_to.length - 1]?.to_city || item.flights_to?.[item.flights_to.length - 1]?.to}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white text-horizontal">{formatPrice(item.price, item.currency)}</div>
                    {item.refundable && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 mt-1 hidden sm:inline-flex">
                      <Shield className="h-3 w-3 mr-1" />
                      <span className="text-horizontal">Refundable</span>
                      </Badge>
                    )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 pt-0 flex-1">
              <div className="space-y-3 sm:space-y-4">
                {/* Flight times and route */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm text-horizontal">
                        {item.flights_to?.[0]?.departure_time}
                      </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-horizontal hidden sm:block">
                        {item.flights_to?.[0]?.departure_date}
                      </div>
                    </div>

                  <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4">
                    <div className="h-0.5 w-4 sm:w-8 bg-slate-300 dark:bg-slate-600" />
                    <Plane className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 rotate-90" />
                    <div className="h-0.5 w-4 sm:w-8 bg-slate-300 dark:bg-slate-600" />
                      </div>

                  <div className="text-center">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm text-horizontal">
                      {item.flights_to?.[item.flights_to.length - 1]?.arrival_time}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-horizontal hidden sm:block">
                        {item.flights_to?.[item.flights_to.length - 1]?.arrival_date}
                    </div>
                  </div>
                </div>

                {/* Flight details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                  <div className="text-horizontal">Duration: {formatDuration(totalDuration)}</div>
                  <div className="text-horizontal hidden sm:block">
                    {item.flights_to && item.flights_to.length > 1
                      ? `${item.flights_to.length - 1} stop${item.flights_to.length > 2 ? "s" : ""}`
                      : "Direct"}
                  </div>
                  <div className="text-horizontal hidden sm:block">Seats: {item.flights_to?.[0]?.seats || "Available"}</div>
                </div>

                {isBooked && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 pt-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium text-horizontal">{t('common.booked')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 md:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold">{item.validating_airline}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-normal">Flight Details & Booking</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Price and Key Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(item.price, item.currency)}</div>
                <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300">Total for {item.passengers} passenger{item.passengers > 1 ? "s" : ""}</div>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {item.refundable && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Refundable
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Luggage className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Baggage Included</span>
                  <span className="sm:hidden">Baggage</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">WiFi Available</span>
                  <span className="sm:hidden">WiFi</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Flight Path Visualization */}
          {item.flights_to && (
            <div className="space-y-6 lg:space-y-0 lg:flex lg:space-x-6">
              {/* Outbound */}
              <div className="flex-1 space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
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
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700 text-xs md:text-sm shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">
                          {segment.from_city || segment.from} → {segment.to_city || segment.to}
                        </span>
                        <span className="text-slate-500">{segment.duration}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>{segment.departure_time} → {segment.arrival_time}</span>
                        <span className="text-xs">
                          {segment.airline_name || segment.airline} {segment.flight_number}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {segment.airplane}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Return if exists */}
              {item.flights_return && (
                <div className="flex-1 space-y-4 mt-6 lg:mt-0">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-600 rotate-180" />
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
                        className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 md:p-4 border border-orange-200 dark:border-orange-700 text-xs md:text-sm shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            {segment.from_city || segment.from} → {segment.to_city || segment.to}
                          </span>
                          <span className="text-slate-500">{segment.duration}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>{segment.departure_time} → {segment.arrival_time}</span>
                          <span className="text-xs">
                            {segment.airline_name || segment.airline} {segment.flight_number}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {segment.airplane}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 md:pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="text-center sm:text-left">
              <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(item.price, item.currency)}</div>
              <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Total price for {item.passengers} passenger{item.passengers > 1 ? "s" : ""}</div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                onBook?.(item, "flights")
                setOpen(false)
              }}
              disabled={isBooking || isBooked}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-2" />
                  Booking...
                </>
              ) : isBooked ? (
                <>
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {t('common.booked')}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 mr-2" />
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
  const t = useTranslations('chat.displays')

  console.log("TicketDisplay received toolOutput:", toolOutput)

  // Transform Aviasales data if needed
  const processedOutput = React.useMemo(() => {
    console.log("Running processedOutput memo...")
    if (isAviasalesData(toolOutput)) {
      console.log("Data is Aviasales format, transforming...")
      const transformedResults = transformAviasalesData(toolOutput)
      console.log("Transformed results:", transformedResults)
      // Return as flights group
      return [{
        type: "flights" as const,
        flights: transformedResults
      }]
    }
    console.log("Data is NOT Aviasales format, using as is.")
    return Array.isArray(toolOutput) ? toolOutput : [toolOutput]
  }, [toolOutput])

  console.log("Final processedOutput:", processedOutput)

  // Global price formatting function
  const formatPrice = (price: number | string, currency: string = "USD") => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    
    // Handle different currencies
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(numPrice)
    } else if (currency === "KZT") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "KZT",
        minimumFractionDigits: 0,
      }).format(numPrice)
    } else {
      // Fallback for other currencies
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
      }).format(numPrice)
    }
  }

  const outputArray: SearchResult[] = processedOutput
  
  const isFromLoadedConversation = outputArray.length > 0 && outputArray[0]?.search_result_id

  // Helper function to safely extract location string
  const getLocationString = (location: any): string => {
    if (typeof location === 'string' && location !== 'N/A') {
      return location
    }
    if (typeof location === 'object' && location !== null) {
      if (location.address && location.address !== 'N/A') {
        return location.address
      }
      if (location.distance_from_center && location.distance_from_center !== 'N/A') {
        return location.distance_from_center
      }
    }
    return ''
  }

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
      // Check if this is an Aviasales flight with URL
      const isAviasalesFlight = type === "flights" && item.aviasales_url
      
      if (isAviasalesFlight) {
        // Open Aviasales URL in new tab
        window.open(item.aviasales_url, '_blank')
        
        // Show success message for Aviasales redirect
        toast({
          title: t('flights.redirectingToAviasales'),
          description: t('flights.aviasalesRedirectDesc'),
        })
        
        // Still record the booking attempt in backend for tracking
        onBooked?.(item, itemId, type)
        return
      }

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
          title: t('common.bookingNotAvailable'),
          description: t('olderSearchError'),
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
        title: t('flights.bookingSuccess'),
        description: t('flights.bookingSuccessDesc', { type }),
      })

      onBooked?.(item, itemId, type)
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: t('common.bookingFailed'),
        description: t('common.bookingFailedDesc'),
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

  // Determine if any flight is already booked
  const hasBookedFlight = (groupedResults.flights || []).some((flt: any, idx: number) => {
    const id = flt.combination_id || flt.id || `${'flights'}-${idx}`
    return bookedIds.has(id.toString()) || flt.is_selected
  })

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

  // Пример фильтров (можно расширить по необходимости)
  const [selectedAirline, setSelectedAirline] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [directOnly, setDirectOnly] = useState<boolean>(false)

  // Мобильная адаптация
  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
      const check = () => setIsMobile(window.matchMedia("(max-width: 640px)").matches)
      check()
      window.addEventListener("resize", check)
      return () => window.removeEventListener("resize", check)
    }, [])
    return isMobile
  }

  // Получить список авиакомпаний для фильтра
  const airlineOptions = React.useMemo(() => {
    const all = (outputArray || []).flatMap(f => f.flights || []).flatMap((t: any) => t.validating_airline ? [t.validating_airline] : [])
    return Array.from(new Set(all))
  }, [outputArray])

  // Фильтрация билетов
  const filteredFlights = React.useMemo(() => {
    let flights = (groupedResults.flights || [])
    if (selectedAirline) flights = flights.filter((f: any) => f.validating_airline === selectedAirline)
    if (maxPrice) flights = flights.filter((f: any) => Number(f.price) <= maxPrice)
    if (directOnly) flights = flights.filter((f: any) => (f.flights_to?.length || 0) <= 1)
    return flights
  }, [groupedResults.flights, selectedAirline, maxPrice, directOnly])

  // --- UI фильтров ---
  const isMobile = useIsMobile()

  return (
    <div className="mt-6 space-y-8">
      {Object.entries(groupedResults).map(([type, items]) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center space-x-4 pb-2">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
              {getIcon(type)}
                </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white capitalize text-horizontal">{type}</h3>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 text-horizontal">
                {t('common.optionsFound', { count: items.length, plural: items.length !== 1 ? 's' : '' })}
              </p>
              </div>
              <Badge className={`${getTypeColor(type)} text-sm px-3 py-1 text-horizontal`}>{items.length}</Badge>
            </div>
          </div>
          
          {(() => {
            // Check if this data is from a loaded conversation (all items should have search_result_id)
            const isFromLoadedConversation = items.length > 0 && items[0]?.search_result_id
            
            if (isFromLoadedConversation) {
              // For loaded conversations, API already filtered to show only booked items
              // So display all items returned by the API
              const displayItems = items
              
              return (
                <div className="max-w-6xl mx-auto px-4">
                  {/* Auto-responsive grid that adapts to parent container width */}
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))' }}>
                    <AnimatePresence>
                      {displayItems.map((item, index) => {
                        const itemId = item.id || item.combination_id || `${type}-${index}`
                        const isBooked = bookedIds.has(itemId.toString()) || item.is_selected
                        const isBooking = bookingStates[itemId] || false
                        const isAIRecommended = toolOutput.ai_recommended_indexes?.includes(index) || false

                        if (type === "flights") {
                          if (hasBookedFlight && !isBooked) return null;
                          return (
                            <motion.div
                              key={itemId}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <FlightCard item={item} onBook={handleBooking} isBooked={isBooked} isBooking={isBooking} formatPrice={formatPrice} isAIRecommended={isAIRecommended} />
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
                            <Card
                              className={`relative overflow-hidden border-2 border-yellow-400 shadow-yellow-200/40 transition-all duration-300 aspect-[4/3] w-full max-w-[260px] min-w-[200px] h-[220px] p-0`}
                            >
                              {/* Always show badge */}
                              <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-yellow-400 text-yellow-900 border-none text-[10px] px-2 py-0.5 shadow-md">
                                  {t('activities.recommendedForYou')}
                                </Badge>
                              </div>
                              <CardHeader className="p-4">
                                <CardTitle className="text-lg font-semibold mb-2 text-horizontal text-wrap-normal">{item.name}</CardTitle>
                                {getLocationString(item.location) && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span className="text-horizontal text-wrap-normal">{getLocationString(item.location)}</span>
                                  </p>
                                )}
                              </CardHeader>
                              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                                <div className="flex-1">
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-horizontal text-wrap-normal">{item.description}</p>
                                  {item.rating && (
                                    <div className="flex items-center mb-4">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i < Math.floor(item.rating)
                                                ? 'text-yellow-400'
                                                : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                        <span className="ml-2 text-sm text-slate-500 text-horizontal">{item.rating}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4">
                                  <span className="font-semibold text-xl text-slate-900 dark:text-white text-horizontal">
                                    {item.price ? formatPrice(item.price, item.currency) : t('common.priceOnRequest')}
                                  </span>
                                  <Button
                                    disabled={(type === 'flights' && hasBookedFlight && !isBooked) || isBooking || isBooked}
                                    size="sm"
                                    onClick={() => handleBooking(item, type)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                                  >
                                    {isBooking ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isBooked ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {t('common.booked')}
                                      </>
                                    ) : (
                                      <span className="text-horizontal">{t('common.bookNow')}</span>
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
                </div>
              )
            } else {
              // For new searches, use the existing logic (show booked items or first 6)
              const hasBooked = items.some((it: any, idx: number) => {
                const itId = it.id || it.combination_id || `${type}-${idx}`
                return bookedIds.has(itId.toString()) || it.is_selected
              })
              const displayItems = hasBooked ? items.filter((it: any, idx: number) => {
                const itId = it.id || it.combination_id || `${type}-${idx}`
                return bookedIds.has(itId.toString()) || it.is_selected
              }) : items.slice(0, 6)

              return (
                <div className="max-w-6xl mx-auto px-4">
                  {/* Auto-responsive grid that adapts to parent container width */}
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))' }}>
                    <AnimatePresence>
                      {displayItems.map((item, index) => {
                        const itemId = item.id || item.combination_id || `${type}-${index}`
                        const isBooked = bookedIds.has(itemId.toString()) || item.is_selected
                        const isBooking = bookingStates[itemId] || false
                        const isAIRecommended = toolOutput.ai_recommended_indexes?.includes(index) || false

                        if (type === "flights") {
                          if (hasBookedFlight && !isBooked) return null;
                          return (
                            <motion.div
                              key={itemId}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <FlightCard item={item} onBook={handleBooking} isBooked={isBooked} isBooking={isBooking} formatPrice={formatPrice} isAIRecommended={isAIRecommended} />
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
                            <Card
                              className={`relative overflow-hidden border-2 border-yellow-400 shadow-yellow-200/40 transition-all duration-300 aspect-[4/3] w-full max-w-[260px] min-w-[200px] h-[220px] p-0`}
                            >
                              {/* Always show badge */}
                              <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-yellow-400 text-yellow-900 border-none text-[10px] px-2 py-0.5 shadow-md">
                                  {t('activities.recommendedForYou')}
                                </Badge>
                              </div>
                              <CardHeader className="p-4">
                                <CardTitle className="text-lg font-semibold mb-2 text-horizontal text-wrap-normal">{item.name}</CardTitle>
                                {getLocationString(item.location) && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span className="text-horizontal text-wrap-normal">{getLocationString(item.location)}</span>
                                  </p>
                                )}
                              </CardHeader>
                              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                                <div className="flex-1">
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-horizontal text-wrap-normal">{item.description}</p>
                                  {item.rating && (
                                    <div className="flex items-center mb-4">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i < Math.floor(item.rating)
                                                ? 'text-yellow-400'
                                                : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                        <span className="ml-2 text-sm text-slate-500 text-horizontal">{item.rating}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4">
                                  <span className="font-semibold text-xl text-slate-900 dark:text-white text-horizontal">
                                    {item.price ? formatPrice(item.price, item.currency) : t('common.priceOnRequest')}
                                  </span>
                                  <Button
                                    disabled={(type === 'flights' && hasBookedFlight && !isBooked) || isBooking || isBooked}
                                    size="sm"
                                    onClick={() => handleBooking(item, type)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                                  >
                                    {isBooking ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isBooked ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {t('common.booked')}
                                      </>
                                    ) : (
                                      <span className="text-horizontal">{t('common.bookNow')}</span>
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
                    <div className="text-center mt-6">
                      <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs md:text-sm">
                        View {items.length - 6} more {type}
                      </Button>
                    </div>
                  )}
                </div>
              )
            }
          })()}
        </motion.div>
      ))}
    </div>
  )
} 
