"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Plane, Hotel, Car, Calendar } from "lucide-react"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookingCreated?: () => void
}

export function BookingDialog({ open, onOpenChange, onBookingCreated }: BookingDialogProps) {
  const [bookingType, setBookingType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const bookingTypes = [
    { value: "flight", label: "Flight", icon: Plane },
    { value: "hotel", label: "Hotel", icon: Hotel },
    { value: "car", label: "Car Rental", icon: Car },
    { value: "activity", label: "Activity", icon: Calendar },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingType) return

    setIsLoading(true)
    try {
      const { data, error } = await apiClient.createBooking(bookingType, formData)
      if (data && !error) {
        onBookingCreated?.()
        onOpenChange(false)
        setFormData({})
        setBookingType("")
      }
    } catch (error) {
      console.error("Failed to create booking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderFormFields = () => {
    switch (bookingType) {
      case "flight":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  placeholder="Departure city"
                  value={formData.from || ""}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="Destination city"
                  value={formData.to || ""}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </>
        )
      case "hotel":
        return (
          <>
            <div>
              <Label htmlFor="name">Hotel Name</Label>
              <Input
                id="name"
                placeholder="Hotel name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check_in">Check-in</Label>
                <Input
                  id="check_in"
                  type="date"
                  value={formData.check_in || ""}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="check_out">Check-out</Label>
                <Input
                  id="check_out"
                  type="date"
                  value={formData.check_out || ""}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                />
              </div>
            </div>
          </>
        )
      default:
        return (
          <>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Booking title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Booking details"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Add a new travel booking to your itinerary.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="booking-type">Booking Type</Label>
            <Select value={bookingType} onValueChange={setBookingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking type" />
              </SelectTrigger>
              <SelectContent>
                {bookingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {bookingType && renderFormFields()}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!bookingType || isLoading}>
              {isLoading ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
