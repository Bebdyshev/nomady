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
  activities: ActivityItem[]
  destination?: string
  attractions_url?: string
  total_found?: number
  search_result_id?: number
  type?: string
  ai_recommended_indexes?: number[]
  recommendation_reasoning?: string
  confidence_score?: number
  criteria?: {
    activity_type?: string
    duration?: string
    price_range?: string
  }
  // Legacy support
  search_parameters?: {
    query?: string
    location?: string
    activity_type?: string
    date?: string
  }
  total_results?: number
  mode?: string
}

interface ActivityDisplayProps {
  toolOutput: ActivitiesAPIResponse
  bookedIds?: Set<string>
  onBooked?: (item: any, id: string, type: string) => void
  hideHeaders?: boolean
  isRoadmap?: boolean
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
const ActivityCard = ({ activity, onBook, isBooked, isBooking, isAIRecommended }: any) => {
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
        className={`relative overflow-hidden cursor-pointer border-2 border-yellow-400 shadow-yellow-200/40 transition-all duration-300 aspect-[4/3] w-full max-w-[260px] min-w-[200px] h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px] p-0`}
      >
        {/* Always show badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-yellow-400 text-yellow-900 border-none text-[10px] px-2 py-0.5 shadow-md">
            {t('activities.recommendedForYou')}
          </Badge>
        </div>
        {/* Top overlay: badge and rating, spaced apart */}
        <div className="absolute top-0 left-0 w-full flex flex-col gap-1 px-2 pt-2 z-10 pointer-events-none">
          <div className="flex items-start justify-between w-full">
            {activity.rating && (
              <div className="flex items-center bg-black/60 rounded-full px-2 py-0.5 ml-auto pointer-events-auto">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-xs text-white font-medium">{parseFloat(activity.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
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
        {/* Bottom overlay: title and key info, with spacing */}
        <div className="absolute bottom-0 left-0 w-full bg-black/70 backdrop-blur-sm px-2 py-2 flex flex-col gap-1 z-10" style={{minHeight:'64px'}}>
          <h3 className="text-white font-bold text-sm leading-tight mb-0.5 line-clamp-2 max-h-[2.6em] overflow-hidden">
            {activity.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-white/80 mt-0.5">
            <div className="flex items-center gap-1">
              {getCategoryIcon(activity.category || "")}
              <span>{activity.type === 'tour_activity' ? t('activities.tour') : t('activities.attraction')}</span>
            </div>
            {activity.price && (
              <span className="font-bold text-green-400 ml-2">{activity.price}</span>
            )}
          </div>
          {activity.review_count && (
            <div className="text-[10px] text-white/60 mt-0.5">{activity.review_count} {t('common.reviews')}</div>
          )}
        </div>
        {/* Book button: bottom right, floating */}
        <div className="absolute bottom-2 right-2 z-20">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onBook?.(activity, "activities")
            }}
            disabled={isBooking || isBooked}
            size="sm"
            className={`transition-all duration-200 text-[10px] px-2 py-1 shadow-lg ${
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
      </Card>
    </motion.div>
  )
}

export function ActivityDisplay({ toolOutput, bookedIds = new Set(), onBooked, hideHeaders = false, isRoadmap }: ActivityDisplayProps) {
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")
  const { toast } = useToast()
  const t = useTranslations('chat.displays')

  // Log header visibility logic
  if (isRoadmap) {
    console.log('🎯 ActivityDisplay: Header hidden due to isRoadmap (roadmap or fallback)')
  }
  console.log('🎯 ActivityDisplay debug:', {
    isRoadmap,
    hideHeaders,
    shouldHideHeaders: hideHeaders || isRoadmap,
    totalActivities: toolOutput.activities?.length || 0
  })

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
    return Array.isArray(toolOutput.activities) ? toolOutput.activities : []
  }

  // Helper to get sorted activities with AI-recommended at the top
  const getSortedActivities = () => {
    const aiIndexes = Array.isArray(toolOutput.ai_recommended_indexes) ? toolOutput.ai_recommended_indexes : []
    const all = getAllActivities()
    // Separate recommended and others, preserving order
    const recommended = aiIndexes.map(idx => all[idx]).filter(Boolean)
    const others = all.filter((_, idx) => !aiIndexes.includes(idx))
    return [...recommended, ...others]
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
  const displayActivities = getSortedActivities()

  const totalResults = toolOutput.total_found || toolOutput.total_results || displayActivities.length

  return (
    <div className={`${hideHeaders || isRoadmap ? '' : 'mt-6'} space-y-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header */}
        {!(hideHeaders || isRoadmap) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
              <Mountain className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {t('activities.activitiesIn', { location: getLocationDisplay() })}
              </h3>
              <p className="text-sm text-slate-500">
                {t('activities.activitiesFound', { count: totalResults.toLocaleString() })}
              </p>
            </div>
          </div>

          {/* Sort Options - Simplified */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">{t('common.sort')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
            >
              <option value="rating">{t('common.rating')}</option>
              <option value="name">{t('common.name')}</option>
            </select>
          </div>
        </div>
        )}

        {/* Activities Grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <AnimatePresence>
            {displayActivities.slice(0, 12).map((activity: ActivityItem, index: number) => {
              const itemId = activity.url || activity.title || `${activity.title}-${index}`
              const isBooked = bookedIds.has(itemId.toString())
              const isBooking = bookingStates[itemId] || false
              // Determine if this activity is AI-recommended
              const aiIndexes = Array.isArray(toolOutput.ai_recommended_indexes) ? toolOutput.ai_recommended_indexes : []
              const isAIRecommended = aiIndexes.includes(getAllActivities().indexOf(activity))
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
                    isAIRecommended={isAIRecommended}
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
              className="text-green-600 hover:bg-green-50"
            >
              {t('common.viewMore', { count: allActivities.length - 12, type: 'activities' })}
            </Button>
          </div>
        )}

        {/* External link if available */}
        {toolOutput.attractions_url && (
          <div className="text-center pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => window.open(toolOutput.attractions_url, '_blank')}
              className="text-green-600 border-green-200 hover:bg-green-50"
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
