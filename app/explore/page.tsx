"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { useState, useEffect } from "react"
import { 
  Search, 
  ArrowLeft, 
  Compass, 
  MapPin, 
  Star, 
  TrendingUp,
  Globe2,
  Mountain,
  Waves,
  Building2,
  Palette,
  Zap,
  Users,
  Heart,
  Filter,
  Map,
  Loader2,
  Menu
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/i18n-client"
import { Logo } from "@/components/ui/logo"
import { apiClient } from "@/lib/api"
import { Conversation } from "@/types/chat"
import { CityCard } from "@/components/explore/city-card"
import { MainLayout } from "@/components/shared/main-layout"

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

const ExploreHeader = () => {
  const router = useRouter()
  const t = useTranslations('explore')
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-xl md:border-b md:border-slate-200/50"
    >
      <div className="container mx-auto px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
              <Compass className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold text-slate-900">{t('title')}</h1>
              <p className="text-xs md:text-sm text-slate-500 hidden md:block">{t('subtitle')}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default function ExplorePage() {
  const router = useRouter()
  const t = useTranslations('explore')
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true)
      const { data, error } = await apiClient.exploreCities(200) // Fetch more cities for better filtering
      if (data && !error) {
        setCities(data.cities)
        setFilteredCities(data.cities)
      } else {
        console.error("Failed to fetch cities:", error)
      }
      setIsLoading(false)
    }
    fetchCities()
  }, [])

  useEffect(() => {
    let result = cities

    // Filter by search query
    if (searchQuery) {
      result = result.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // TODO: Implement category filtering when API provides category data.
    // The current categories are placeholders.
    if (activeCategory !== 'all') {
      // Placeholder: No filtering is applied for categories yet.
      // You could add logic here if you map categories to regions, for example.
    }

    setFilteredCities(result)
  }, [searchQuery, activeCategory, cities])

  const categories = [
    { id: "all", label: "All", icon: Globe2, color: "bg-gray-500" },
    { id: "trending", label: t('categories.trending'), icon: TrendingUp, color: "bg-orange-500" },
    { id: "beaches", label: t('categories.beaches'), icon: Waves, color: "bg-blue-500" },
    { id: "mountains", label: t('categories.mountains'), icon: Mountain, color: "bg-green-500" },
    { id: "cities", label: t('categories.cities'), icon: Building2, color: "bg-purple-500" },
    { id: "culture", label: t('categories.culture'), icon: Palette, color: "bg-pink-500" },
    { id: "adventure", label: t('categories.adventure'), icon: Zap, color: "bg-red-500" },
  ]

  const stats = [
    { number: "500+", label: t('stats.destinations'), icon: MapPin },
    { number: "50+", label: t('stats.countries'), icon: Globe2 },
    { number: "1000+", label: t('stats.experiences'), icon: Star },
  ]

  return (
    <MainLayout header={<ExploreHeader />}>
      <div className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search destinations, activities, or experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-4 text-lg border-2 border-slate-200 rounded-xl bg-white focus:border-green-500"
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
                }`}
              >
                <div className={`p-1 rounded-full ${activeCategory === category.id ? 'bg-white/20' : category.color}`}>
                  <category.icon className={`h-4 w-4 ${activeCategory === category.id ? 'text-white' : 'text-white'}`} />
                </div>
                <span className="text-sm font-medium">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading cities...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCities.map((city, index) => (
              <CityCard key={city.slug} city={city} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
} 