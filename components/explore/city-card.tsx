"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Star, MapPin, Wifi, Shield, DollarSign } from "lucide-react"

interface City {
  name: string
  slug: string
  country: string
  image?: string
  overall_score: number
  cost_for_nomad_in_usd?: number
  internet_speed?: number
  safety_level?: number
}

interface CityCardProps {
  city: City
  index: number
}

export const CityCard = ({ city, index }: CityCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={city.image || 'https://images.unsplash.com/photo-1512850183-6d7990f42385?w=400&h=300&fit=crop'}
            alt={`Image of ${city.name}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-slate-900 border-0 flex items-center">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {city.overall_score.toFixed(1)}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3">
            <h3 className="font-bold text-white text-xl">{city.name}</h3>
            <p className="text-sm text-slate-200">{city.country}</p>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-600">
                <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                <span>Nomad Cost</span>
              </div>
              <span className="font-semibold text-slate-900">
                ${city.cost_for_nomad_in_usd?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-600">
                <Wifi className="h-4 w-4 mr-2 text-blue-500" />
                <span>Internet Speed</span>
              </div>
              <span className="font-semibold text-slate-900">
                {city.internet_speed || 'N/A'} Mbps
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-600">
                <Shield className="h-4 w-4 mr-2 text-red-500" />
                <span>Safety Level</span>
              </div>
              <span className="font-semibold text-slate-900">
                {city.safety_level?.toFixed(1) || 'N/A'} / 5.0
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 