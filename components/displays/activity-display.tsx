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
  MapPin,
  Star,
  Globe,
  Loader2,
  CheckCircle2,
  Mountain,
  Camera,
  Award,
} from "lucide-react"

interface ActivityItem {
  title: string
  url: string
  rating: string
  review_count: number
  category?: string
  image?: string
  price?: string
  type: string
}

interface ActivitiesAPIResponse {
  destination?: string
  attractions_url?: string
  total_found?: number
  search_result_id?: number
  type?: string
  recommended_attractions?: {
    count: number
    items: ActivityItem[]
  }
  top_attractions?: {
    count: number
    items: ActivityItem[]
  }
  // Legacy support
  search_parameters?: {
    query?: string
    location?: string
    activity_type?: string
    date?: string
  }
  total_results?: number
  activities?: ActivityItem[]
}

interface ActivityDisplayProps {
  toolOutput: ActivitiesAPIResponse
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
}

// Get category icon
const getCategoryIcon = (category: string) => {
  if (!category) return <MapPin className="h-3 w-3" />
  const categoryLower = category.toLowerCase()
  if (categoryLower.includes("tour") || categoryLower.includes("4wd")) return <Camera className="h-3 w-3" />
  if (categoryLower.includes("lookout") || categoryLower.includes("view")) return <Mountain className="h-3 w-3" />
  if (categoryLower.includes("cultural") || categoryLower.includes("church")) return <Award className="h-3 w-3" />
  return <MapPin className="h-3 w-3" />
}

// Enhanced Activity Card Component (Restaurant-style)
const ActivityCard = ({ activity, onBook, isBooked, isBooking }: any) => {
  const t = useTranslations('chat.displays')
  
  const renderStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(numRating) ? "text-yellow-400 fill-current" : "text-white/40"}`}
          />
        ))}
        <span className="text-xs text-white font-medium ml-1">{numRating.toFixed(1)}</span>
      </div>
    )
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
    const index = (activity.title?.charCodeAt(0) || 0) % gradients.length
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
            : "border-slate-200 dark:border-slate-700 hover:border-green-300 hover:shadow-xl"
        }`}
      >
        {/* Background with gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: activity.image 
              ? `url(${activity.image})` 
              : getBackgroundGradient()
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </div>

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-between p-3">
          {/* Top section - Rating and category */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              {activity.rating && renderStars(activity.rating)}
              {activity.type === 'tour_activity' && (
                <Badge className="bg-blue-500/90 text-white border-none text-xs">
                  <Camera className="h-3 w-3 mr-1" />
                  {t('activities.tour')}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1">
              {isBooked && (
                <Badge className="bg-green-500/90 text-white border-none text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('common.booked')}
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom section - Activity info and actions */}
          <div className="space-y-2">
            {/* Activity Name and Category */}
            <div>
              <h3 className="text-white font-bold text-base line-clamp-2 leading-tight">
                {activity.title}
              </h3>
              <p className="text-white/80 text-sm">
                {activity.category}
              </p>
              {activity.review_count && (
                <p className="text-white/60 text-xs">
                  {activity.review_count} {t('common.reviews')}
                </p>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Price */}
                {activity.price && (
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-sm text-green-400">
                      {activity.price}
                    </span>
                    <span className="text-white/60 text-xs">{t('activities.perPerson')}</span>
                  </div>
                )}
                
                {/* Category icon */}
                <div className="flex items-center space-x-1">
                  {getCategoryIcon(activity.category || "")}
                  <span className="text-white/60 text-xs">{activity.type === 'tour_activity' ? t('activities.tour') : t('activities.attraction')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                {activity.url && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(activity.url, '_blank')
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
                    onBook?.(activity, "activities")
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
                    t('common.book')
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

export function ActivityDisplay({ toolOutput, bookedIds = new Set(), onBooked }: ActivityDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")
  const { toast } = useToast()
  const t = useTranslations('chat.displays')

  const handleBooking = async (activity: any, type: string) => {
    const itemId = activity.url || activity.title || `${activity.title}-${Date.now()}`
    setBookingStates((prev) => ({ ...prev, [itemId]: true }))

    try {
      // Simulate booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: t('activities.bookingSuccess'),
        description: t('activities.bookingSuccessDesc', { name: activity.title }),
      })

      onBooked?.(activity, itemId, type)
      trackBooking('activity', activity.title)
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

  // Get all activities from both recommended_attractions and top_attractions
  const getAllActivities = () => {
    const activities: ActivityItem[] = []
    
    // Add recommended attractions (tours)
    if (toolOutput.recommended_attractions?.items) {
      activities.push(...toolOutput.recommended_attractions.items)
    }
    
    // Add top attractions
    if (toolOutput.top_attractions?.items) {
      activities.push(...toolOutput.top_attractions.items)
    }
    
    // Legacy support
    if (toolOutput.activities) {
      activities.push(...toolOutput.activities)
    }
    
    return activities
  }

  // Sort activities
  const allActivities = getAllActivities()
  const sortedActivities = [...allActivities].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0)
        const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0)
        return ratingB - ratingA
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // Get location for header
  const getLocationDisplay = () => {
    if (toolOutput.destination) {
      return toolOutput.destination
    }
    if (toolOutput.search_parameters?.location) {
      return toolOutput.search_parameters.location
    }
    return t('restaurants.yourSearch')
  }

  // Always display all activities (multiple booking allowed)
  const displayActivities = sortedActivities

  const totalResults = toolOutput.total_found || toolOutput.total_results || displayActivities.length

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
                {t('activities.activitiesIn', { location: getLocationDisplay() })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('activities.activitiesFound', { count: totalResults.toLocaleString() })}
              </p>
            </div>
          </div>

          {/* Sort Options - Simplified */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('common.sort')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800"
            >
              <option value="rating">{t('common.rating')}</option>
              <option value="name">{t('common.name')}</option>
            </select>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <AnimatePresence>
            {displayActivities.slice(0, 12).map((activity: ActivityItem, index: number) => {
              const itemId = activity.url || activity.title || `${activity.title}-${index}`
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
                  <ActivityCard
                    activity={activity}
                    onBook={handleBooking}
                    isBooked={isBooked}
                    isBooking={isBooking}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {allActivities.length > 12 && (
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            >
              {t('common.viewMore', { count: allActivities.length - 12, type: 'activities' })}
            </Button>
          </div>
        )}

        {/* External link if available */}
        {toolOutput.attractions_url && (
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => window.open(toolOutput.attractions_url, '_blank')}
              className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Globe className="h-4 w-4 mr-2" />
              {t('activities.viewAllTripadvisor')}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
