"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/lib/i18n-client"
import { apiClient } from "@/lib/api"
import { Plane, Hotel, Car, Calendar, MapPin, Clock, DollarSign, Plus, ArrowLeft, Sparkles, Menu } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/ui/logo"

// Disable static generation for this page
export const dynamic = 'force-dynamic'

interface Booking {
  id: number
  user_id: number
  booking_type: string
  data: Record<string, any>
  created_at: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useTranslations('bookings')
  const tCommon = useTranslations('common')

  // Add useEffect for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    loadBookings()
  }, [isAuthenticated, router])

  const loadBookings = async () => {
    try {
      const { data, error } = await apiClient.getBookings()
      if (data && !error) {
        setBookings(data)
      }
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getBookingIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "flight":
        return <Plane className="h-4 w-4 sm:h-5 sm:w-5" />
      case "hotel":
        return <Hotel className="h-4 w-4 sm:h-5 sm:w-5" />
      case "car":
        return <Car className="h-4 w-4 sm:h-5 sm:w-5" />
      default:
        return <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
    }
  }

  const getBookingColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "flight":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
      case "hotel":
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
      case "car":
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
    }
  }

  const formatBookingData = (booking: Booking) => {
    const { data } = booking
    switch (booking.booking_type.toLowerCase()) {
      case "flight":
        return {
          title: `${data.from || t('placeholders.unknown')} → ${data.to || t('placeholders.unknown')}`,
          subtitle: `${data.airline || t('placeholders.airline')} • ${data.flight_number || t('placeholders.flight')}`,
          details: [
            { icon: Calendar, text: data.date || t('placeholders.dateTbd') },
            { icon: Clock, text: data.time || t('placeholders.timeTbd') },
            { icon: DollarSign, text: data.price ? `$${data.price}` : t('placeholders.priceTbd') },
          ],
        }
      case "hotel":
        return {
          title: data.name || t('bookingTypes.hotelBooking'),
          subtitle: data.location || t('placeholders.locationTbd'),
          details: [
            { icon: Calendar, text: `${data.check_in || t('placeholders.checkIn')} - ${data.check_out || t('placeholders.checkOut')}` },
            { icon: MapPin, text: data.address || t('placeholders.addressTbd') },
            { icon: DollarSign, text: data.price ? `$${data.price}/night` : t('placeholders.priceTbd') },
          ],
        }
      case "car":
        return {
          title: data.model || t('bookingTypes.carRental'),
          subtitle: data.company || t('bookingTypes.rentalCompany'),
          details: [
            { icon: Calendar, text: `${data.pickup_date || t('placeholders.pickup')} - ${data.return_date || t('placeholders.return')}` },
            { icon: MapPin, text: data.pickup_location || t('placeholders.pickupLocation') },
            { icon: DollarSign, text: data.price ? `$${data.price}/day` : t('placeholders.priceTbd') },
          ],
        }
      default:
        return {
          title: data.title || t('bookingTypes.booking'),
          subtitle: data.description || t('bookingTypes.travelBooking'),
          details: [
            { icon: Calendar, text: data.date || t('placeholders.dateTbd') },
            { icon: MapPin, text: data.location || t('placeholders.locationTbd') },
          ],
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/chat")}
                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {t('title')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push("/chat")} 
              className="bg-blue-600 hover:bg-blue-700 text-white ml-2 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('newBooking')}</span>
              <span className="sm:hidden">{t('new')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center py-12 sm:py-16 px-4"
          >
            <div className="flex justify-center mx-auto mb-4 sm:mb-6">
              <Logo width={64} height={64} className="rounded-full sm:w-24 sm:h-24" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              {t('noBookingsYet')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto leading-relaxed">
              {t('startPlanningDescription')}
            </p>
            <Button 
              onClick={() => router.push("/chat")} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t('startPlanning')}
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookings.map((booking, index) => {
              const bookingInfo = formatBookingData(booking)
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800 h-full">
                    <CardHeader className="pb-3 p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getBookingColor(booking.booking_type)}`}>
                            {getBookingIcon(booking.booking_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm sm:text-lg font-semibold line-clamp-2 leading-tight">
                              {bookingInfo.title}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-1">
                              {bookingInfo.subtitle}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize text-xs flex-shrink-0">
                          {t(`types.${booking.booking_type.toLowerCase()}` as any) || booking.booking_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="space-y-2 sm:space-y-3">
                        {bookingInfo.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                            <detail.icon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {detail.text}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('bookedOn')} {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
