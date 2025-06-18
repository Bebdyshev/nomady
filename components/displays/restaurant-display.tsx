"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Utensils,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Users,
  Loader2,
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ChefHat,
  Wine,
  Leaf,
  Award,
} from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface RestaurantProperty {
  name: string
  type: string
  cuisine?: string
  price_range?: string
  rating?: number
  reviews_count?: number
  address?: string
  phone?: string
  website?: string
  opening_hours?: string[]
  features?: string[]
  menu_highlights?: string[]
  images?: string[]
  coordinates?: { latitude: number; longitude: number }
  reservation_required?: boolean
  average_meal_price?: number
  currency?: string
}

interface RestaurantsAPIResponse {
  search_parameters: {
    query: string
    location: string
    cuisine_type?: string
    price_range?: string
  }
  total_results: number
  restaurants: RestaurantProperty[]
}

interface RestaurantDisplayProps {
  toolOutput: RestaurantsAPIResponse
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Restaurant Image Gallery Component
const RestaurantImageGallery = ({ images, restaurantName }: { images: string[]; restaurantName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-orange-200 to-red-300 dark:from-orange-700 dark:to-red-800 rounded-xl flex items-center justify-center">
        <Utensils className="h-16 w-16 text-orange-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${restaurantName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
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
          {images.map((_, index) => (
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

// Feature Icon Mapping
const getFeatureIcon = (feature: string) => {
  const featureLower = feature.toLowerCase()
  if (featureLower.includes("outdoor") || featureLower.includes("patio")) return <Leaf className="h-4 w-4" />
  if (featureLower.includes("wine") || featureLower.includes("bar")) return <Wine className="h-4 w-4" />
  if (featureLower.includes("chef") || featureLower.includes("kitchen")) return <ChefHat className="h-4 w-4" />
  if (featureLower.includes("award") || featureLower.includes("michelin")) return <Award className="h-4 w-4" />
  if (featureLower.includes("reservation")) return <Users className="h-4 w-4" />
  return <Utensils className="h-4 w-4" />
}

// Price Range Display
const getPriceRangeDisplay = (priceRange: string) => {
  switch (priceRange?.toLowerCase()) {
    case "budget":
    case "$":
      return { symbol: "$", label: "Budget-friendly", color: "text-green-600" }
    case "mid-range":
    case "$$":
      return { symbol: "$$", label: "Mid-range", color: "text-yellow-600" }
    case "expensive":
    case "$$$":
      return { symbol: "$$$", label: "Expensive", color: "text-orange-600" }
    case "luxury":
    case "$$$$":
      return { symbol: "$$$$", label: "Luxury", color: "text-red-600" }
    default:
      return { symbol: "$$", label: "Mid-range", color: "text-yellow-600" }
  }
}

// Enhanced Restaurant Card Component
const RestaurantCard = ({ restaurant, onBook, isBooked, isBooking }: any) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: restaurant.currency || "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{rating.toFixed(1)}</span>
        {restaurant.reviews_count && (
          <span className="text-xs text-slate-500 dark:text-slate-400">({restaurant.reviews_count})</span>
        )}
      </div>
    )
  }

  const priceDisplay = getPriceRangeDisplay(restaurant.price_range)

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
                : "border-slate-200 dark:border-slate-700 hover:border-orange-300 hover:shadow-xl"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600" />

            <CardHeader className="p-0">
              <RestaurantImageGallery images={restaurant.images || []} restaurantName={restaurant.name} />
            </CardHeader>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Restaurant Name & Cuisine */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {restaurant.name}
                    </CardTitle>
                    {restaurant.cuisine && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{restaurant.cuisine}</p>
                    )}
                  </div>
                  {isBooked && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Reserved
                    </Badge>
                  )}
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between">
                  {restaurant.rating && renderStars(restaurant.rating)}
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-lg ${priceDisplay.color}`}>{priceDisplay.symbol}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{priceDisplay.label}</span>
                  </div>
                </div>

                {/* Features Preview */}
                {restaurant.features && restaurant.features.length > 0 && (
                  <div className="flex items-center space-x-2 overflow-hidden">
                    {restaurant.features.slice(0, 3).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-1"
                      >
                        {getFeatureIcon(feature)}
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-20">{feature}</span>
                      </div>
                    ))}
                    {restaurant.features.length > 3 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{restaurant.features.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Location & Hours */}
                <div className="space-y-1">
                  {restaurant.address && (
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                  )}
                  {restaurant.opening_hours && restaurant.opening_hours.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{restaurant.opening_hours[0]}</span>
                    </div>
                  )}
                </div>

                {/* Average Meal Price */}
                {restaurant.average_meal_price && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(restaurant.average_meal_price)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">avg. per person</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>

      {/* Detailed Restaurant Dialog */}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{restaurant.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-normal flex items-center space-x-2">
                {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
                {restaurant.rating && (
                  <>
                    <span>•</span>
                    {renderStars(restaurant.rating)}
                  </>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Image Gallery */}
          <div className="relative">
            <RestaurantImageGallery images={restaurant.images || []} restaurantName={restaurant.name} />
          </div>

          {/* Restaurant Info */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    {restaurant.address && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-300">{restaurant.address}</span>
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-300">{restaurant.phone}</span>
                      </div>
                    )}
                    {restaurant.website && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {restaurant.average_meal_price && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pricing</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(restaurant.average_meal_price)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">per person</div>
                      <div className={`font-bold text-lg ${priceDisplay.color}`}>{priceDisplay.symbol}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {restaurant.opening_hours && restaurant.opening_hours.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Opening Hours</h3>
                    <div className="space-y-1">
                      {restaurant.opening_hours.map((hours, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-300">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {restaurant.reservation_required && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Reservation Required
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Highlights */}
          {restaurant.menu_highlights && restaurant.menu_highlights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Menu Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {restaurant.menu_highlights.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                  >
                    <ChefHat className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {restaurant.features && restaurant.features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Restaurant Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {restaurant.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                  >
                    {getFeatureIcon(feature)}
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              {restaurant.average_meal_price ? (
                <>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(restaurant.average_meal_price)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Average per person</div>
                </>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${priceDisplay.color}`}>{priceDisplay.symbol}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{priceDisplay.label}</div>
                </>
              )}
            </div>

            <Button
              size="lg"
              onClick={() => onBook?.(restaurant, "restaurants")}
              disabled={isBooking || isBooked}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Reserving...
                </>
              ) : isBooked ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Reserved
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Make Reservation
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RestaurantDisplay({ toolOutput, bookedIds = new Set(), onBooked }: RestaurantDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating")
  const { toast } = useToast()

  const handleBooking = async (restaurant: any, type: string) => {
    const itemId = restaurant.name || `${restaurant.name}-${Date.now()}`
    setBookingStates((prev) => ({ ...prev, [itemId]: true }))

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Reservation Confirmed! 🍽️",
        description: `Your table at ${restaurant.name} has been reserved.`,
      })

      onBooked?.(restaurant, itemId, type)
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Reservation Failed",
        description: "There was an error processing your reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBookingStates((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  // Sort restaurants
  const sortedRestaurants = [...toolOutput.restaurants].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "price":
        return (a.average_meal_price || 0) - (b.average_meal_price || 0)
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
            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg">
              <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Restaurants in {toolOutput.search_parameters.location}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {toolOutput.total_results.toLocaleString()} restaurants found
              </p>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-800"
            >
              <option value="rating">Rating</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sortedRestaurants.slice(0, 9).map((restaurant, index) => {
              const itemId = restaurant.name || `${restaurant.name}-${index}`
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

        {toolOutput.restaurants.length > 9 && (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              View {toolOutput.restaurants.length - 9} more restaurants
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
