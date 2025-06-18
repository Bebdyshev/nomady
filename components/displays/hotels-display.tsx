import type React from "react"
import { TicketDisplay } from "@/components/displays/ticket-display"

interface HotelsAPIProperty {
  name: string
  type: string
  hotel_class: string | null
  link: string
  overall_rating: number | null
  rate_per_night: number | null
  total_rate: number | null
  currency: string
  coordinates?: { latitude: number; longitude: number }
  check_in?: string | null
  check_out?: string | null
  amenities?: string[]
  images?: string[]
}

interface HotelsAPIResponse {
  search_parameters: Record<string, any>
  total_results: number
  properties: HotelsAPIProperty[]
}

interface HotelsDisplayProps {
  toolOutput: HotelsAPIResponse
  bookedIds: Set<string>
  onBooked: (item: any, id: string, type: string) => void
}

export function HotelsDisplay({ toolOutput, bookedIds, onBooked }: HotelsDisplayProps) {
  // Transform the incoming API shape into TicketDisplay-compatible shape
  const searchResultId = (toolOutput as any).search_result_id
  const hotels = toolOutput.properties.map((prop, idx) => ({
    id: prop.link || `${prop.name}-${idx}`,
    search_result_id: searchResultId,
    name: prop.name,
    description: prop.hotel_class || undefined,
    price: prop.rate_per_night ?? undefined,
    rating: prop.overall_rating ?? undefined,
    location: undefined, // coordinate based location could be reverse-geocoded on backend if needed
    image_url: prop.images && prop.images.length > 0 ? prop.images[0] : undefined,
    images: prop.images,
    amenities: prop.amenities,
    check_in: prop.check_in ?? undefined,
    check_out: prop.check_out ?? undefined,
  }))

  const mapped = { type: "hotels", hotels }

  return (
    <TicketDisplay
      toolOutput={mapped as any}
      bookedIds={bookedIds}
      onBooked={onBooked}
    />
  )
} 