"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Plane, Hotel, Car, Calendar, MapPin, Clock, DollarSign, Plus, ArrowLeft, Sparkles, Menu } from "lucide-react"
import { motion } from "framer-motion"

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
        return <Plane className="h-5 w-5" />
      case "hotel":
        return <Hotel className="h-5 w-5" />
      case "car":
        return <Car className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
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
          title: `${data.from || "Unknown"} → ${data.to || "Unknown"}`,
          subtitle: `${data.airline || "Airline"} • ${data.flight_number || "Flight"}`,
          details: [
            { icon: Calendar, text: data.date || "Date TBD" },
            { icon: Clock, text: data.time || "Time TBD" },
            { icon: DollarSign, text: data.price ? `$${data.price}` : "Price TBD" },
          ],
        }
      case "hotel":
        return {
          title: data.name || "Hotel Booking",
          subtitle: data.location || "Location TBD",
          details: [
            { icon: Calendar, text: `${data.check_in || "Check-in"} - ${data.check_out || "Check-out"}` },
            { icon: MapPin, text: data.address || "Address TBD" },
            { icon: DollarSign, text: data.price ? `$${data.price}/night` : "Price TBD" },
          ],
        }
      case "car":
        return {
          title: data.model || "Car Rental",
          subtitle: data.company || "Rental Company",
          details: [
            { icon: Calendar, text: `${data.pickup_date || "Pickup"} - ${data.return_date || "Return"}` },
            { icon: MapPin, text: data.pickup_location || "Pickup Location" },
            { icon: DollarSign, text: data.price ? `$${data.price}/day` : "Price TBD" },
          ],
        }
      default:
        return {
          title: data.title || "Booking",
          subtitle: data.description || "Travel booking",
          details: [
            { icon: Calendar, text: data.date || "Date TBD" },
            { icon: MapPin, text: data.location || "Location TBD" },
          ],
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-8 w-8"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
                <p className="text-slate-600 dark:text-slate-300">Manage your travel reservations</p>
              </div>
            </div>
            <Button onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No bookings yet</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
              Start planning your next adventure! Chat with our AI to find and book flights, hotels, and activities.
            </p>
            <Button onClick={() => router.push("/chat")} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-5 w-5 mr-2" />
              Start Planning
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => {
              const bookingInfo = formatBookingData(booking)
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getBookingColor(booking.booking_type)}`}>
                            {getBookingIcon(booking.booking_type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{bookingInfo.title}</CardTitle>
                            <CardDescription>{bookingInfo.subtitle}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {booking.booking_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bookingInfo.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-sm">
                            <detail.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300">{detail.text}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Booked on {new Date(booking.created_at).toLocaleDateString()}
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
