"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Hotel,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Coffee,
  Shield,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Phone,
  ExternalLink,
  Snowflake,
  Wind,
  Tv,
  Bath,
  Bed,
  Dog,
  Baby,
  Cigarette,
  Zap,
  Shirt,
  Clock,
  Sun,
  TreePine,
  Gamepad2,
  Music,
  Camera,
  Banknote,
  Plane,
  UserCheck,
} from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Hotel {
  // Core fields
  name: string
  
  // Old format fields
  type?: string
  hotel_class?: string | null
  link?: string
  detail_url?: string
  overall_rating?: number | null
  rate_per_night?: number | null
  total_rate?: number | null
  currency?: string
  coordinates?: { latitude: number; longitude: number }
  check_in?: string | null
  check_out?: string | null
  amenities?: string[]
  images?: string[]
  price?: string | number
  details?: {
    rating_score?: string
    [key: string]: any
  }
  image_url?: string
  
  // New booking.com format fields
  booking_url?: string
  search_price?: string
  description?: string
  detailed_rating?: {
    score?: string
    text?: string
    review_count?: string
    [key: string]: any
  }
  facilities?: string[]
  highlights?: string[]
  property_type?: string
  star_rating?: string
  checkin_checkout_policy?: string
  contact_info?: { [key: string]: any }
  room_types?: any[]
  search_image_url?: string
  search_result_id?: number
  location?: {
    address?: string
    distance_from_center?: string
    coordinates?: { latitude: number; longitude: number }
    [key: string]: any
  } | string
}

interface HotelsAPIResponse {
  search_parameters?: {
    query: string
    check_in_date: string
    check_out_date: string
    adults: number
    currency: string
  }
  total_results?: number
  properties?: Hotel[]
  
  // For new structure from user
  destination?: string
  hotels?: Hotel[]
  search_params?: {
    destination: string
    check_in_date: string
    check_out_date: string
    adults: number
    currency: string
  }
  total_found?: number
  success?: boolean
}

interface HotelDisplayProps {
  toolOutput: HotelsAPIResponse
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Hotel Image Gallery Component
const HotelImageGallery = ({ images, hotelName }: { images: string[]; hotelName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center">
        <Hotel className="h-16 w-16 text-slate-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${hotelName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          onLoad={() => setIsLoading(false)}
        />
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_: string, index: number) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Favorite & Share Buttons */}
      <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
          <Heart className="h-4 w-4" />
        </button>
        <button className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Amenity Icon Mapping - Expanded with more variety
const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase()
  
  // Internet & Technology
  if (amenityLower.includes("wifi") || amenityLower.includes("internet") || amenityLower.includes("wireless")) 
    return <Wifi className="h-4 w-4" />
  if (amenityLower.includes("tv") || amenityLower.includes("television") || amenityLower.includes("cable")) 
    return <Tv className="h-4 w-4" />
  
  // Transportation & Parking
  if (amenityLower.includes("parking") || amenityLower.includes("car") || amenityLower.includes("garage")) 
    return <Car className="h-4 w-4" />
  if (amenityLower.includes("airport") || amenityLower.includes("shuttle") || amenityLower.includes("transfer")) 
    return <Plane className="h-4 w-4" />
  
  // Dining & Food
  if (amenityLower.includes("restaurant") || amenityLower.includes("dining")) 
    return <Utensils className="h-4 w-4" />
  if (amenityLower.includes("breakfast") || amenityLower.includes("coffee") || amenityLower.includes("cafe")) 
    return <Coffee className="h-4 w-4" />
  if (amenityLower.includes("bar") || amenityLower.includes("lounge") || amenityLower.includes("pub")) 
    return <Utensils className="h-4 w-4" />
  if (amenityLower.includes("room service") || amenityLower.includes("kitchen") || amenityLower.includes("kitchenette")) 
    return <Utensils className="h-4 w-4" />
  
  // Fitness & Recreation
  if (amenityLower.includes("fitness") || amenityLower.includes("gym") || amenityLower.includes("exercise")) 
    return <Dumbbell className="h-4 w-4" />
  if (amenityLower.includes("pool") || amenityLower.includes("swimming") || amenityLower.includes("spa") || amenityLower.includes("jacuzzi")) 
    return <Waves className="h-4 w-4" />
  if (amenityLower.includes("sauna") || amenityLower.includes("steam")) 
    return <Sun className="h-4 w-4" />
  if (amenityLower.includes("game") || amenityLower.includes("entertainment") || amenityLower.includes("arcade")) 
    return <Gamepad2 className="h-4 w-4" />
  if (amenityLower.includes("music") || amenityLower.includes("piano") || amenityLower.includes("karaoke")) 
    return <Music className="h-4 w-4" />
  
  // Room Amenities
  if (amenityLower.includes("air conditioning") || amenityLower.includes("ac") || amenityLower.includes("climate")) 
    return <Snowflake className="h-4 w-4" />
  if (amenityLower.includes("heating") || amenityLower.includes("heat")) 
    return <Zap className="h-4 w-4" />
  if (amenityLower.includes("bath") || amenityLower.includes("bathroom") || amenityLower.includes("shower")) 
    return <Bath className="h-4 w-4" />
  if (amenityLower.includes("bed") || amenityLower.includes("bedroom") || amenityLower.includes("suite")) 
    return <Bed className="h-4 w-4" />
  if (amenityLower.includes("balcony") || amenityLower.includes("terrace") || amenityLower.includes("patio")) 
    return <Wind className="h-4 w-4" />
  
  // Services
  if (amenityLower.includes("laundry") || amenityLower.includes("dry cleaning") || amenityLower.includes("washing")) 
    return <Shirt className="h-4 w-4" />
  if (amenityLower.includes("concierge") || amenityLower.includes("reception") || amenityLower.includes("front desk")) 
    return <Clock className="h-4 w-4" />
  if (amenityLower.includes("luggage") || amenityLower.includes("storage") || amenityLower.includes("baggage")) 
    return <Users className="h-4 w-4" />
  if (amenityLower.includes("currency") || amenityLower.includes("exchange") || amenityLower.includes("atm")) 
    return <Banknote className="h-4 w-4" />
  if (amenityLower.includes("credit card") || amenityLower.includes("payment")) 
    return <CreditCard className="h-4 w-4" />
  
  // Accessibility & Special Needs
  if (amenityLower.includes("accessible") || amenityLower.includes("wheelchair") || amenityLower.includes("disability")) 
    return <UserCheck className="h-4 w-4" />
  if (amenityLower.includes("pet") || amenityLower.includes("dog") || amenityLower.includes("animal")) 
    return <Dog className="h-4 w-4" />
  if (amenityLower.includes("baby") || amenityLower.includes("crib") || amenityLower.includes("children")) 
    return <Baby className="h-4 w-4" />
  if (amenityLower.includes("smoking") || amenityLower.includes("cigarette")) 
    return <Cigarette className="h-4 w-4" />
  
  // Outdoor & Nature
  if (amenityLower.includes("garden") || amenityLower.includes("park") || amenityLower.includes("nature")) 
    return <TreePine className="h-4 w-4" />
  if (amenityLower.includes("beach") || amenityLower.includes("ocean") || amenityLower.includes("sea")) 
    return <Waves className="h-4 w-4" />
  if (amenityLower.includes("view") || amenityLower.includes("scenic") || amenityLower.includes("photography")) 
    return <Camera className="h-4 w-4" />
  
  // Default icon for unmatched amenities
  return <Shield className="h-4 w-4" />
}

// Enhanced Hotel Card Component - Compact version to match ticket cards
const HotelCard = ({ hotel, searchParams, onBook, isBooked, isBooking }: any) => {
  const formatPrice = (priceInput: number | string | null | undefined) => {
    // Handle new format search_price
    if (hotel.search_price && hotel.search_price !== "N/A") {
      return hotel.search_price
    }
    
    // Handle old format pricing
    if (typeof priceInput === 'number') {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: hotel.currency || "USD",
        minimumFractionDigits: 0,
      }).format(priceInput)
    }
    if (typeof priceInput === 'string' && priceInput.toLowerCase() !== 'n/a') {
      return priceInput
    }
    return "Price on request"
  }

  // Handle rating from multiple sources
  const getRating = () => {
    // New format: detailed_rating.score
    if (hotel.detailed_rating?.score && hotel.detailed_rating.score !== "N/A") {
      const score = parseFloat(hotel.detailed_rating.score)
      if (!isNaN(score)) return score
    }
    
    // Old format: overall_rating
    if (hotel.overall_rating) return hotel.overall_rating
    
    // Old format: details.rating_score
    if (hotel.details?.rating_score) {
      const score = parseFloat(hotel.details.rating_score)
      if (!isNaN(score)) return score
    }
    
    return null
  }

  const ratingValue = getRating()

  const renderStars = (rating: number) => {
    if (rating === 0) return null
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_: undefined, i: number) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-slate-600 dark:text-slate-300 ml-1 text-horizontal">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const calculateNights = () => {
    if (!searchParams?.check_in_date || !searchParams?.check_out_date) return 0
    const checkIn = new Date(searchParams.check_in_date)
    const checkOut = new Date(searchParams.check_out_date)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  // Handle images from multiple sources
  const getHotelImages = (): string[] => {
    // New format: images array with objects
    if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      return hotel.images.map((img: any) => {
        if (typeof img === 'string') return img
        return img.url || img.src || img.image_url || ''
      }).filter((url: string) => url && url !== 'N/A')
    }
    
    // Old format: image_url or search_image_url
    const imageUrl = hotel.image_url || hotel.search_image_url
    if (imageUrl && imageUrl.toLowerCase() !== 'n/a') {
      return [imageUrl]
    }
    
    return []
  }

  const hotelImages = getHotelImages()

  // Get amenities from multiple sources
  const getAmenities = () => {
    // New format: facilities
    if (hotel.facilities && Array.isArray(hotel.facilities)) {
      return hotel.facilities
    }
    
    // Old format: amenities
    if (hotel.amenities && Array.isArray(hotel.amenities)) {
      return hotel.amenities
    }
    
    return []
  }

  const amenities = getAmenities()

  // Get hotel location info
  const getLocationInfo = (): string => {
    // Handle new data structure - location is an object
    if (typeof hotel.location === 'object' && hotel.location !== null) {
      // Try address first
      if (hotel.location.address && hotel.location.address !== 'N/A') {
        return hotel.location.address
      }
      // Try distance_from_center as fallback
      if (hotel.location.distance_from_center && hotel.location.distance_from_center !== 'N/A') {
        return hotel.location.distance_from_center
      }
    }
    
    // Handle old data structure - location is a string
    if (typeof hotel.location === 'string' && hotel.location !== 'N/A') {
      return hotel.location
    }
    
    // Fallback to other hotel properties
    if (hotel.hotel_class && hotel.hotel_class !== 'N/A') {
      return hotel.hotel_class
    }
    if (hotel.type && hotel.type !== 'N/A') {
      return hotel.type
    }
    if (hotel.property_type && hotel.property_type !== 'N/A') {
      return hotel.property_type
    }
    
    return 'Hotel' // Final fallback
  }

  const locationInfo = getLocationInfo()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card
            className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-300 flex flex-col min-h-[300px] card-layout ${
              isBooked
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:shadow-xl"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600" />

            {/* Hotel Image */}
            {hotelImages.length > 0 ? (
              <div className="h-32 w-full overflow-hidden">
                <img 
                  src={hotelImages[0]} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <Hotel className="h-8 w-8 text-slate-400" />
              </div>
            )}

            <CardHeader className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Hotel className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white text-horizontal text-wrap-normal">
                      {hotel.name}
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-horizontal text-wrap-normal">
                      {locationInfo}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-slate-900 dark:text-white text-horizontal">{formatPrice(hotel.rate_per_night ?? hotel.price)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-horizontal">per night</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {/* Rating */}
                {ratingValue && (
                  <div className="flex items-center justify-center">
                    {renderStars(ratingValue)}
                  </div>
                )}

                {/* Amenities Preview */}
                {amenities.length > 0 && (
                  <div className="flex items-center justify-center space-x-2 overflow-hidden">
                    {amenities.slice(0, 3).map((amenity: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-1"
                      >
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                    {amenities.length > 3 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 text-horizontal">+{amenities.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Duration info */}
                {nights > 0 && (
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span className="text-horizontal">{nights} nights</span>
                    <span className="text-horizontal">Total: {formatPrice(hotel.total_rate ?? hotel.price)}</span>
                  </div>
                )}

                {isBooked && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 pt-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium text-horizontal">Booked</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>

      {/* Detailed Hotel Dialog */}
      <DialogContent className="sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 md:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Hotel className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-horizontal">{hotel.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-normal flex items-center space-x-2">
                {locationInfo && <span className="text-horizontal">{locationInfo}</span>}
                {ratingValue && (
                  <>
                    <span>•</span>
                    {renderStars(ratingValue)}
                  </>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Image Gallery */}
          <div className="relative">
            <HotelImageGallery images={hotelImages || []} hotelName={hotel.name} />
          </div>

          {/* Hotel Description */}
          {hotel.description && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">About This Hotel</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{hotel.description}</p>
            </div>
          )}

          {/* Booking Summary */}
          {searchParams?.check_in_date && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4" />
                    <span>Check-in</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {new Date(searchParams.check_in_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {hotel.check_in && <div className="text-sm text-slate-500">{hotel.check_in}</div>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4" />
                    <span>Check-out</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {new Date(searchParams.check_out_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {hotel.check_out && <div className="text-sm text-slate-500">{hotel.check_out}</div>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <Users className="h-4 w-4" />
                    <span>Guests</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">{searchParams.adults} Adults</div>
                  <div className="text-sm text-slate-500">{nights} nights</div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          {amenities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hotel Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenities.map((amenity: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                  >
                    {getAmenityIcon(amenity)}
                    <span className="text-sm text-slate-700 dark:text-slate-300">{amenity}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Contact */}
          {(hotel.coordinates || (typeof hotel.location === 'object' && hotel.location?.coordinates)) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Location & Contact</h3>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                {hotel.coordinates && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {hotel.coordinates.latitude.toFixed(4)}, {hotel.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                )}
                {typeof hotel.location === 'object' && hotel.location?.coordinates && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {hotel.location.coordinates.latitude.toFixed(4)}, {hotel.location.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                )}
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Call Hotel</span>
                  </Button>
                  {(hotel.booking_url || hotel.link || hotel.detail_url) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      onClick={() => window.open(hotel.booking_url || hotel.link || hotel.detail_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(hotel.total_rate ?? hotel.price)}</div>
              {nights > 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {formatPrice(hotel.rate_per_night ?? hotel.price)} × {nights} nights
                </div>
              )}
            </div>

            <Button
              size="lg"
              onClick={() => onBook?.(hotel, "hotels")}
              disabled={isBooking || isBooked}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                  Book Hotel
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function HotelDisplay({ toolOutput, bookedIds = new Set(), onBooked }: HotelDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("price")
  const { toast } = useToast()

  const hotels = toolOutput.properties || toolOutput.hotels || []
  const searchParams = toolOutput.search_parameters || toolOutput.search_params
  const totalResults = toolOutput.total_results ?? toolOutput.total_found ?? 0
  const destination = searchParams ? ('query' in searchParams ? searchParams.query : searchParams.destination) : ''

  const handleBooking = async (hotel: any, type: string) => {
    const itemId = hotel.link || hotel.detail_url || `${hotel.name}-${Date.now()}`
    setBookingStates((prev) => ({ ...prev, [itemId]: true }))

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Hotel Booked Successfully! 🏨",
        description: `${hotel.name} has been reserved for your stay.`,
      })

      onBooked?.(hotel, itemId, type)
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

  // Sort hotels
  const sortedHotels = [...hotels].sort((a, b) => {
    switch (sortBy) {
      case "price":
        const priceA = a.rate_per_night ?? (typeof a.price === 'number' ? a.price : Infinity)
        const priceB = b.rate_per_night ?? (typeof b.price === 'number' ? b.price : Infinity)
        return priceA - priceB
      case "rating":
        const ratingA = a.overall_rating ?? (a.details?.rating_score ? parseFloat(a.details.rating_score) : 0)
        const ratingB = b.overall_rating ?? (b.details?.rating_score ? parseFloat(b.details.rating_score) : 0)
        return ratingB - ratingA
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className="mt-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-2">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                <Hotel className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white text-horizontal">
                  Hotels in {destination}
              </h3>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 text-horizontal">
                  {totalResults.toLocaleString()} properties found
              </p>
            </div>
          </div>

          {/* Sort Options */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-slate-600 dark:text-slate-300 flex-shrink-0 text-horizontal">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-800 flex-1 sm:flex-none min-w-0"
            >
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
        {/* Hotels Grid */}
          <div className="grid-auto-cards">
          <AnimatePresence>
            {sortedHotels.slice(0, 9).map((hotel: Hotel, index: number) => {
              const itemId = hotel.link || hotel.detail_url || `${hotel.name}-${index}`
              const isBooked = bookedIds.has(itemId)
              const isBooking = bookingStates[itemId] || false

              return (
                <motion.div
                  key={itemId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <HotelCard
                    hotel={hotel}
                    searchParams={searchParams || {}}
                    onBook={handleBooking}
                    isBooked={isBooked}
                    isBooking={isBooking}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {totalResults > 9 && (
            <div className="text-center mt-6">
            <Button
              variant="ghost"
                className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 text-sm"
            >
                <span className="text-horizontal">View {totalResults - 9} more hotels</span>
            </Button>
          </div>
        )}
        </div>
      </motion.div>
    </div>
  )
}
