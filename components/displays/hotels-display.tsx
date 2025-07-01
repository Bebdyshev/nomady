"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/i18n-client"
import { apiClient } from "@/lib/api"
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
      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
        <Hotel className="h-16 w-16 text-slate-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden group">
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
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
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
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <button className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
          <Heart className="h-4 w-4" />
        </button>
        <button className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full z-20">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

// Enhanced Amenity Icon Mapping
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

// Enhanced Hotel Card Component
const HotelCard = ({ hotel, searchParams, onBook, isBooked, isBooking }: any) => {
  const t = useTranslations('chat.displays')
  
  const formatPrice = (priceInput: number | string | null | undefined) => {
    // Handle new format search_price
    if (hotel.search_price && hotel.search_price !== "N/A") {
      return hotel.search_price
    }
    
    // Handle pricing from rooms array (new booking.com format)
    if (hotel.rooms && hotel.rooms.length > 0) {
      const firstRoom = hotel.rooms[0]
      if (firstRoom.price_text && firstRoom.price_text !== "N/A") {
        return firstRoom.price_text
      }
      if (firstRoom.price_value && firstRoom.price_currency) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: firstRoom.price_currency === "KZT" ? "USD" : firstRoom.price_currency,
          minimumFractionDigits: 0,
        }).format(firstRoom.price_value / (firstRoom.price_currency === "KZT" ? 500 : 1))
      }
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
    return t('common.priceOnRequest')
  }

  // Handle rating from multiple sources
  const getRating = () => {
    if (hotel.detailed_rating?.score && hotel.detailed_rating.score !== "N/A") {
      const score = parseFloat(hotel.detailed_rating.score)
      if (!isNaN(score)) return score
    }
    
    if (hotel.overall_rating) return hotel.overall_rating
    
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
            className={`h-3 w-3 ${i < Math.floor(rating * 5 / 10) ? "text-yellow-400 fill-current" : "text-white/40"}`}
          />
        ))}
        <span className="text-xs text-white font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // Handle images from multiple sources
  const getHotelImages = (): string[] => {
    if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      return hotel.images.map((img: any) => {
        if (typeof img === 'string') return img
        return img.url || img.src || img.image_url || ''
      }).filter((url: string) => url && url !== 'N/A')
    }
    
    const imageUrl = hotel.image_url || hotel.search_image_url
    if (imageUrl && imageUrl.toLowerCase() !== 'n/a') {
      return [imageUrl]
    }
    
    return []
  }

  const hotelImages = getHotelImages()

  // Get amenities from multiple sources
  const getAmenities = () => {
    if (hotel.facilities && Array.isArray(hotel.facilities)) {
      return hotel.facilities
    }
    
    if (hotel.amenities && Array.isArray(hotel.amenities)) {
      return hotel.amenities
    }
    
    return []
  }

  const amenities = getAmenities()

  const calculateNights = () => {
    if (!searchParams?.check_in_date || !searchParams?.check_out_date) return 0
    const checkIn = new Date(searchParams.check_in_date)
    const checkOut = new Date(searchParams.check_out_date)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  // Get the primary image for background
  const backgroundImage = hotelImages.length > 0 ? hotelImages[0] : ''

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card
            className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-300 h-80 ${
              isBooked
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:shadow-xl"
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: backgroundImage 
                  ? `url(${backgroundImage})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </div>

            {/* Content overlay */}
            <div className="relative h-full flex flex-col justify-between p-4">
              {/* Top section - Rating and booked status */}
              <div className="flex items-start justify-between">
                <div>
                  {ratingValue && renderStars(ratingValue)}
                </div>
                {isBooked && (
                  <Badge className="bg-green-500/90 text-white border-none">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('common.booked')}
                  </Badge>
                )}
              </div>

              {/* Bottom section - Hotel info and actions */}
              <div className="space-y-1">
                {/* Hotel Name */}
                <div>
                  <h3 className="text-white font-bold text-lg line-clamp-2">
                    {hotel.name}
                  </h3>
                  {(hotel.rooms && hotel.rooms.length > 0 && hotel.rooms[0].room_type) && (
                    <p className="text-white/80 text-sm">
                      {hotel.rooms[0].room_type}
                    </p>
                  )}
                </div>

                {/* Price and Book button */}
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-2xl font-bold">
                      {formatPrice(hotel.price)}
                    </div>
                    <div className="text-white/80 text-sm">
                      {nights > 0 ? t('hotels.forNights', { nights }) : t('hotels.totalPrice')}
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Don't open dialog, just handle booking
                      onBook?.(hotel, "hotels")
                    }}
                    disabled={isBooking || isBooked}
                    size="sm"
                    className={`transition-all duration-200 ${
                      isBooked
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-white/90 hover:bg-white text-slate-900 hover:text-slate-900"
                    }`}
                  >
                    {isBooking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isBooked ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      t('common.book')
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </DialogTrigger>

      {/* Detailed Hotel Dialog */}
      <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
          {/* Left Column - Images and Visual Info */}
          <div className="relative bg-slate-50 dark:bg-slate-900">
            <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
              <DialogTitle className="flex items-start space-x-3 text-white">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Hotel className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{hotel.name}</div>
                  <div className="text-sm text-white/80 font-normal flex items-center space-x-2">
                    {(hotel.hotel_class || hotel.property_type) && (
                      <span>{hotel.hotel_class || hotel.property_type}</span>
                    )}
                    {ratingValue && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_: undefined, i: number) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(ratingValue * 5 / 10) ? "text-yellow-400 fill-current" : "text-white/40"}`}
                            />
                          ))}
                          <span className="text-sm ml-1">{ratingValue.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Enhanced Image Gallery - Full Height */}
            <div className="h-full">
              <HotelImageGallery images={hotelImages} hotelName={hotel.name} />
            </div>

            {/* Price and Booking Section - Overlay at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
              <div className="flex items-end justify-between">
                <div className="text-white">
                  <div className="text-3xl font-bold">
                    {formatPrice(hotel.price)}
                  </div>
                  <div className="text-white/80 text-sm">
                    {nights > 0 ? `for ${nights} nights` : 'total price'}
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => onBook?.(hotel, "hotels")}
                  disabled={isBooking || isBooked}
                  className="bg-white text-slate-900 hover:bg-white/90 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
            </div>
          </div>

          {/* Right Column - Hotel Information */}
          <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto">
            {/* Booking Summary - Compact */}
            {searchParams?.check_in_date && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-xs text-slate-600 dark:text-slate-300 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{t('hotels.checkIn')}</span>
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">
                      {new Date(searchParams.check_in_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center space-x-1 text-xs text-slate-600 dark:text-slate-300 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{t('hotels.checkOut')}</span>
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">
                      {new Date(searchParams.check_out_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center space-x-1 text-xs text-slate-600 dark:text-slate-300 mb-1">
                      <Users className="h-3 w-3" />
                      <span>{t('hotels.guests')}</span>
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{searchParams.adults}</div>
                    <div className="text-xs text-slate-500">{nights} {t('hotels.nights')}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 p-5 space-y-5">
              {/* Hotel Description - Compact */}
              {hotel.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('hotels.about')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                    {hotel.description}
                  </p>
                </div>
              )}

              {/* Room Information */}
              {hotel.rooms && hotel.rooms.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('hotels.roomsAvailable')}</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {hotel.rooms.slice(0, 3).map((room: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-white">{room.room_type}</div>
                            {room.max_guests && (
                              <div className="text-xs text-slate-500">{t('hotels.maxGuests')} {room.max_guests}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-green-600 dark:text-green-400">
                              {room.price_text || t('common.priceOnRequest')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Grid - More Compact */}
              {amenities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('hotels.amenities')}</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {amenities.map((amenity: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="text-slate-600 dark:text-slate-400">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {hotel.featured_reviews && hotel.featured_reviews.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('hotels.reviews')}</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {hotel.featured_reviews.slice(0, 2).map((review: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          {review.replace(/«|»/g, '"')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Contact - Compact */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('hotels.location')}</h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-3">
                  {hotel.location?.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {hotel.location.address}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {(hotel.booking_url || hotel.link || hotel.detail_url) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1 text-xs"
                        onClick={() => window.open(hotel.booking_url || hotel.link || hotel.detail_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{t('hotels.viewDetails')}</span>
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 text-xs">
                      <Phone className="h-3 w-3" />
                      <span>{t('hotels.contact')}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rating Breakdown */}
              {hotel.rating_subscores && Object.keys(hotel.rating_subscores).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('hotels.ratings')}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(hotel.rating_subscores).slice(0, 6).map(([category, score]: [string, any]) => (
                      <div key={category} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded p-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{category}</span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 md:pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="text-center sm:text-left">
              <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(hotel.price)}</div>
              <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                {nights > 0 ? t('hotels.forNights', { nights }) : t('hotels.totalPrice')}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onBook?.(hotel, "hotels")}
              disabled={isBooking || isBooked}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-2" />
                  {t('common.booking')}
                </>
              ) : isBooked ? (
                <>
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {t('common.booked')}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {t('hotels.bookHotel')}
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
  const t = useTranslations('chat.displays')

  const hotels = toolOutput.properties || toolOutput.hotels || []
  const searchParams = toolOutput.search_parameters || toolOutput.search_params
  const totalResults = toolOutput.total_results ?? toolOutput.total_found ?? 0
  const destination = searchParams ? ('query' in searchParams ? searchParams.query : searchParams.destination) : ''

  const handleBooking = async (hotel: any, type: string) => {
    // Определяем идентификатор выбранного элемента (индекс или link / detail_url)
    const index = hotels.findIndex((h) => h === hotel)
    const selected_item_id = hotel.id || hotel.link || hotel.detail_url || `${index}`
    setBookingStates((prev) => ({ ...prev, [selected_item_id]: true }))

    try {
      // Проверяем наличие search_result_id (обязателен для API)
      if (!hotel.search_result_id) {
        toast({
          title: t('common.bookingNotAvailable'),
          description: t('olderSearchError'),
          variant: "destructive",
        })
        return
      }

      const bookingData = {
        search_result_id: hotel.search_result_id,
        selected_item_id: selected_item_id.toString(),
      }

      const response = await apiClient.bookHotel(bookingData)

      if (response.data) {
        toast({
          title: t('hotels.hotelBooked'),
          description: t('hotels.hotelBookedDesc', { name: hotel.name }),
        })

        onBooked?.(hotel, selected_item_id, type)
      } else {
        throw new Error(response.error || 'Booking failed')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast({
        title: t('common.bookingFailed'),
        description: t('common.bookingFailedDesc'),
        variant: 'destructive',
      })
    } finally {
      setBookingStates((prev) => ({ ...prev, [selected_item_id]: false }))
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
    <div className="mt-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
              <Hotel className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('hotels.hotelsIn', { location: destination })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('hotels.propertiesFound', { count: totalResults.toLocaleString() })}
              </p>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('common.sortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-800"
            >
              <option value="price">{t('common.price')}</option>
              <option value="rating">{t('common.rating')}</option>
              <option value="name">{t('common.name')}</option>
            </select>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))' }}>
          <AnimatePresence>
            {sortedHotels.slice(0, 6).map((hotel: Hotel, index: number) => {
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

        {hotels.length > 6 && (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              {t('common.viewMore', { count: hotels.length - 6, type: 'hotels' })}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
