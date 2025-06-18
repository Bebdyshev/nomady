"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin,
  Star,
  Clock,
  Users,
  Calendar,
  Loader2,
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Mountain,
  Camera,
  Compass,
  Ticket,
  Shield,
  Info,
  Award,
  Zap,
} from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ActivityProperty {
  name: string
  type: string
  category?: string
  duration?: string
  difficulty?: string
  min_age?: number
  max_group_size?: number
  price?: number
  currency?: string
  rating?: number
  reviews_count?: number
  location?: string
  description?: string
  highlights?: string[]
  included?: string[]
  not_included?: string[]
  meeting_point?: string
  cancellation_policy?: string
  images?: string[]
  coordinates?: { latitude: number; longitude: number }
  available_dates?: string[]
  languages?: string[]
}

interface ActivitiesAPIResponse {
  search_parameters: {
    query: string
    location: string
    activity_type?: string
    date?: string
  }
  total_results: number
  activities: ActivityProperty[]
}

interface ActivityDisplayProps {
  toolOutput: ActivitiesAPIResponse
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Activity Image Gallery Component
const ActivityImageGallery = ({ images, activityName }: { images: string[]; activityName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-green-200 to-blue-300 dark:from-green-700 dark:to-blue-800 rounded-xl flex items-center justify-center">
        <Mountain className="h-16 w-16 text-green-400" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${activityName} - Image ${currentIndex + 1}`}
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

// Activity Category Icon Mapping
const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes("adventure") || categoryLower.includes("outdoor")) return <Mountain className="h-4 w-4" />
  if (categoryLower.includes("tour") || categoryLower.includes("sightseeing")) return <Camera className="h-4 w-4" />
  if (categoryLower.includes("cultural") || categoryLower.includes("historical")) return <Compass className="h-4 w-4" />
  if (categoryLower.includes("entertainment") || categoryLower.includes("show")) return <Ticket className="h-4 w-4" />
  if (categoryLower.includes("extreme") || categoryLower.includes("thrill")) return <Zap className="h-4 w-4" />
  return <MapPin className="h-4 w-4" />
}

// Difficulty Level Display
const getDifficultyDisplay = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
    case "beginner":
      return { label: "Easy", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    case "moderate":
    case "intermediate":
      return { label: "Moderate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
    case "hard":
    case "challenging":
    case "advanced":
      return { label: "Challenging", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
    case "extreme":
      return { label: "Extreme", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" }
    default:
      return { label: "Moderate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
  }
}

// Enhanced Activity Card Component
const ActivityCard = ({ activity, onBook, isBooked, isBooking }: any) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: activity.currency || "USD",
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
        {activity.reviews_count && (
          <span className="text-xs text-slate-500 dark:text-slate-400">({activity.reviews_count})</span>
        )}
      </div>
    )
  }

  const difficultyDisplay = getDifficultyDisplay(activity.difficulty)

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
                : "border-slate-200 dark:border-slate-700 hover:border-green-300 hover:shadow-xl"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-600" />

            <CardHeader className="p-0">
              <ActivityImageGallery images={activity.images || []} activityName={activity.name} />
            </CardHeader>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Activity Name & Category */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {activity.name}
                    </CardTitle>
                    {activity.category && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">{activity.category}</p>
                    )}
                  </div>
                  {isBooked && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Booked
                    </Badge>
                  )}
                </div>

                {/* Rating & Difficulty */}
                <div className="flex items-center justify-between">
                  {activity.rating && renderStars(activity.rating)}
                  {activity.difficulty && <Badge className={difficultyDisplay.color}>{difficultyDisplay.label}</Badge>}
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {activity.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{activity.duration}</span>
                    </div>
                  )}
                  {activity.max_group_size && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>Max {activity.max_group_size}</span>
                    </div>
                  )}
                  {activity.min_age && (
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Age {activity.min_age}+</span>
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {activity.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{activity.description}</p>
                )}

                {/* Pricing */}
                {activity.price && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatPrice(activity.price)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">per person</div>
                      </div>
                      <div className="text-right">
                        {activity.available_dates && activity.available_dates.length > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {activity.available_dates.length} dates available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>

      {/* Detailed Activity Dialog */}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              {getCategoryIcon(activity.category || "activity")}
            </div>
            <div>
              <div className="text-xl font-bold">{activity.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-normal flex items-center space-x-2">
                {activity.category && <span>{activity.category}</span>}
                {activity.rating && (
                  <>
                    <span>•</span>
                    {renderStars(activity.rating)}
                  </>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Image Gallery */}
          <div className="relative">
            <ActivityImageGallery images={activity.images || []} activityName={activity.name} />
          </div>

          {/* Activity Overview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">{activity.duration || "Varies"}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <Users className="h-4 w-4" />
                  <span>Group Size</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {activity.max_group_size ? `Max ${activity.max_group_size}` : "Flexible"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4" />
                  <span>Age Requirement</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {activity.min_age ? `${activity.min_age}+ years` : "All ages"}
                </div>
              </div>
            </div>

            {activity.difficulty && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Difficulty Level:</span>
                  <Badge className={difficultyDisplay.color}>{difficultyDisplay.label}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">About This Activity</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{activity.description}</p>
            </div>
          )}

          {/* Highlights */}
          {activity.highlights && activity.highlights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activity.highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                  >
                    <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* What's Included / Not Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activity.included && activity.included.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-green-600">What's Included</h3>
                <div className="space-y-2">
                  {activity.included.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activity.not_included && activity.not_included.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-red-600">Not Included</h3>
                <div className="space-y-2">
                  {activity.not_included.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-red-300 rounded-full flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meeting Point & Additional Info */}
          <div className="space-y-4">
            {activity.meeting_point && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200">Meeting Point</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{activity.meeting_point}</p>
                  </div>
                </div>
              </div>
            )}

            {activity.cancellation_policy && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Cancellation Policy</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{activity.cancellation_policy}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Dates */}
          {activity.available_dates && activity.available_dates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Available Dates</h3>
              <div className="flex flex-wrap gap-2">
                {activity.available_dates.slice(0, 6).map((date, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {date}
                  </Badge>
                ))}
                {activity.available_dates.length > 6 && (
                  <Badge variant="outline">+{activity.available_dates.length - 6} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              {activity.price ? (
                <>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(activity.price)}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">per person</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Contact for pricing</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Varies by date and group size</div>
                </>
              )}
            </div>

            <Button
              size="lg"
              onClick={() => onBook?.(activity, "activities")}
              disabled={isBooking || isBooked}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                  Book Activity
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ActivityDisplay({ toolOutput, bookedIds = new Set(), onBooked }: ActivityDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name" | "difficulty">("rating")
  const { toast } = useToast()

  const handleBooking = async (activity: any, type: string) => {
    const itemId = activity.name || `${activity.name}-${Date.now()}`
    setBookingStates((prev) => ({ ...prev, [itemId]: true }))

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Activity Booked Successfully! 🎯",
        description: `${activity.name} has been added to your itinerary.`,
      })

      onBooked?.(activity, itemId, type)
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

  // Sort activities
  const sortedActivities = [...toolOutput.activities].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "price":
        return (a.price || 0) - (b.price || 0)
      case "name":
        return a.name.localeCompare(b.name)
      case "difficulty":
        const difficultyOrder = { easy: 1, moderate: 2, hard: 3, extreme: 4 }
        return (
          (difficultyOrder[a.difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 2) -
          (difficultyOrder[b.difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 2)
        )
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
            <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg">
              <Mountain className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Activities in {toolOutput.search_parameters.location}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {toolOutput.total_results.toLocaleString()} activities found
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
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sortedActivities.slice(0, 9).map((activity, index) => {
              const itemId = activity.name || `${activity.name}-${index}`
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
                  <ActivityCard activity={activity} onBook={handleBooking} isBooked={isBooked} isBooking={isBooking} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {toolOutput.activities.length > 9 && (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            >
              View {toolOutput.activities.length - 9} more activities
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
