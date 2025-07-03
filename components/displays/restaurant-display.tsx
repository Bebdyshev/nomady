"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { trackBooking } from "@/lib/gtag"
import { useTranslations } from "@/lib/i18n-client"
import {
  Utensils,
  Star,
  Clock,
  Globe,
  Loader2,
  CheckCircle2,
  Award,
} from "lucide-react"

interface RestaurantProperty {
  name: string
  rating?: number
  review_count?: number
  cuisine_types?: string[]
  price_range?: string
  sponsored?: boolean
  status?: string
  travelers_choice_2024?: boolean
  url?: string
  search_result_id?: number
  address?: string
  phone?: string
  website?: string
  opening_hours?: string[]
  features?: string[]
  menu_highlights?: string[]
  images?: string[]
  image_url?: string
  coordinates?: { latitude: number; longitude: number }
  reservation_required?: boolean
  average_meal_price?: number
  currency?: string
}

interface RestaurantsAPIResponse {
  restaurants: RestaurantProperty[]
  restaurants_url?: string
  returned_count?: number
  search_result_id?: number
  source?: string
  total_found?: number
  type?: string
  // Legacy support
  search_parameters?: {
    query?: string
    location?: string
    cuisine_type?: string
    price_range?: string
  }
  total_results?: number
}

interface RestaurantDisplayProps {
  toolOutput: RestaurantsAPIResponse
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Price Range Display
const getPriceRangeDisplay = (priceRange: string) => {
  const t = useTranslations('chat.displays.restaurants')
  
  switch (priceRange?.toLowerCase()) {
    case "budget":
    case "$":
      return { symbol: "$", label: t('budget'), color: "text-green-400" }
    case "mid-range":
    case "$$":
    case "$$ - $$$":
      return { symbol: "$$", label: t('midRange'), color: "text-yellow-400" }
    case "expensive":
    case "$$$":
      return { symbol: "$$$", label: t('expensive'), color: "text-orange-400" }
    case "luxury":
    case "$$$$":
      return { symbol: "$$$$", label: t('luxury'), color: "text-red-400" }
    default:
      return { symbol: "$$", label: t('midRange'), color: "text-yellow-400" }
  }
}

// Enhanced Restaurant Card Component (Hotel-style)
const RestaurantCard = ({ restaurant, onBook, isBooked, isBooking }: any) => {
  const t = useTranslations('chat.displays')
  const priceDisplay = getPriceRangeDisplay(restaurant.price_range)
  
  // Get cuisine display - handle both single cuisine and array
  const getCuisineDisplay = () => {
    if (restaurant.cuisine_types && Array.isArray(restaurant.cuisine_types)) {
      // Filter out "Menu" entries and take first 2
      const validCuisines = restaurant.cuisine_types.filter((c: string) => c !== "Menu")
      return validCuisines.slice(0, 2).join(", ") || t('restaurants.restaurant')
    }
    if (restaurant.cuisine) {
      return restaurant.cuisine
    }
    return t('restaurants.restaurant')
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-white/40"}`}
          />
        ))}
        <span className="text-xs text-white font-medium ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // Get the restaurant image URL
  const getRestaurantImage = () => {
    // First check for images array
    if (restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0) {
      return restaurant.images[0]
    }
    // Then check for single image_url
    if (restaurant.image_url && restaurant.image_url.trim() !== '') {
      return restaurant.image_url
    }
    // No image found
    return null
  }

  // Get a nice background color if no image
  const getBackgroundGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ]
    const index = (restaurant.name?.charCodeAt(0) || 0) % gradients.length
    return gradients[index]
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card
        className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-300 aspect-square ${
          isBooked
            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
            : "border-slate-200 dark:border-slate-700 hover:border-orange-300 hover:shadow-xl"
        }`}
      >
        {/* Background with gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: getRestaurantImage() 
              ? `url(${getRestaurantImage()})` 
              : getBackgroundGradient()
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </div>

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-between p-3">
          {/* Top section - Rating and special badges */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              {restaurant.rating && renderStars(restaurant.rating)}
              {restaurant.travelers_choice_2024 && (
                <Badge className="bg-orange-500/90 text-white border-none text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {t('restaurants.travelersChoice')}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1">
              {isBooked && (
                <Badge className="bg-green-500/90 text-white border-none text-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('restaurants.reserved')}
                </Badge>
              )}
              {restaurant.sponsored && (
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                  {t('restaurants.sponsored')}
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom section - Restaurant info and actions */}
          <div className="space-y-2">
            {/* Restaurant Name and Cuisine */}
            <div>
              <h3 className="text-white font-bold text-base line-clamp-2 leading-tight">
                {restaurant.name}
              </h3>
              <p className="text-white/80 text-sm">
                {getCuisineDisplay()}
              </p>
              {restaurant.review_count && (
                <p className="text-white/60 text-xs">
                  {restaurant.review_count} {t('common.reviews')}
                </p>
              )}
            </div>

            {/* Status and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Status indicator */}
                {restaurant.status && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${restaurant.status === 'open' ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white/80 text-xs">
                      {restaurant.status === 'open' ? t('restaurants.open') : t('restaurants.closed')}
                    </span>
                  </div>
                )}
                
                {/* Price range */}
                <div className="flex items-center space-x-1">
                  <span className={`font-bold text-sm ${priceDisplay.color}`}>
                    {priceDisplay.symbol}
                  </span>
                  <span className="text-white/60 text-xs">{priceDisplay.label}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                {restaurant.url && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(restaurant.url, '_blank')
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 text-xs px-2 py-1"
                  >
                    <Globe className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onBook?.(restaurant, "restaurants")
                  }}
                  disabled={isBooking || isBooked}
                  size="sm"
                  className={`transition-all duration-200 text-xs px-2 py-1 ${
                    isBooked
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-white/90 hover:bg-white text-slate-900 hover:text-slate-900"
                  }`}
                >
                  {isBooking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isBooked ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    t('restaurants.reserve')
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function RestaurantDisplay({ toolOutput, bookedIds = new Set(), onBooked }: RestaurantDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")
  const { toast } = useToast()
  const t = useTranslations('chat.displays')

  const handleBooking = async (restaurant: any, type: string) => {
    const itemId = restaurant.url || restaurant.search_result_id || `${restaurant.name}-${Date.now()}`
    setBookingStates((prev) => ({ ...prev, [itemId]: true }))

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: t('restaurants.reservationConfirmed'),
        description: t('restaurants.reservationConfirmedDesc', { name: restaurant.name }),
      })

      trackBooking('restaurant', restaurant.name)

      onBooked?.(restaurant, itemId, type)
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: t('restaurants.reservationFailed'),
        description: t('restaurants.reservationFailedDesc'),
        variant: "destructive",
      })
    } finally {
      setBookingStates((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const allRestaurants = toolOutput.restaurants || []

  // Sort restaurants
  const sortedRestaurants = [...allRestaurants].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Always display all restaurants (multiple bookings allowed)
  const displayRestaurants = sortedRestaurants

  const totalResults = toolOutput.total_found || toolOutput.total_results || displayRestaurants.length

  // Get location for header - try different sources
  const getLocationDisplay = () => {
    if (toolOutput.search_parameters?.location) {
      return toolOutput.search_parameters.location
    }
    if (toolOutput.source === 'tripadvisor') {
      return t('restaurants.yourArea')
    }
    return t('restaurants.yourSearch')
  }

  return (
    <div className="mt-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg">
              <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('restaurants.restaurantsIn', { location: getLocationDisplay() })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('restaurants.restaurantsFound', { count: totalResults.toLocaleString() })}
                {toolOutput.source && (
                  <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {t('restaurants.via')} {toolOutput.source}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Sort Options - Simplified */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('common.sort')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 max-w-full"
            >
              <option value="rating">{t('common.rating')}</option>
              <option value="name">{t('common.name')}</option>
            </select>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <AnimatePresence>
            {displayRestaurants.slice(0, 12).map((restaurant: RestaurantProperty, index: number) => {
              const itemId = restaurant.url || restaurant.search_result_id || `${restaurant.name}-${index}`
              const isBooked = bookedIds.has(itemId.toString())
              const isBooking = bookingStates[itemId] || false

              return (
                <motion.div
                  key={itemId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <RestaurantCard
                    restaurant={restaurant}
                    onBook={handleBooking}
                    isBooked={isBooked}
                    isBooking={isBooking}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {(allRestaurants.length || 0) > 12 && (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              {t('common.viewMore', { count: (allRestaurants.length || 0) - 12, type: 'restaurants' })}
            </Button>
          </div>
        )}

        {/* External link if available */}
        {toolOutput.restaurants_url && (
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => window.open(toolOutput.restaurants_url, '_blank')}
              className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              <Globe className="h-4 w-4 mr-2" />
              {t('restaurants.viewAllExternal', { source: toolOutput.source || 'external site' })}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
