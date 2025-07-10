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
  Map
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/i18n-client"
import { Logo } from "@/components/ui/logo"
import { apiClient } from "@/lib/api"
import { Conversation } from "@/types/chat"

export default function ExplorePage() {
  const router = useRouter()
  const t = useTranslations('explore')
  const tCommon = useTranslations('common')
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("trending")

  const categories = [
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

  const featuredDestinations = [
    {
      id: 1,
      name: "Tokyo, Japan",
      category: "cities",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      rating: 4.8,
      popularity: "trending",
      description: "Modern metropolis meets ancient traditions"
    },
    {
      id: 2,
      name: "Santorini, Greece",
      category: "beaches",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
      rating: 4.9,
      popularity: "popular",
      description: "Stunning sunsets and white-washed buildings"
    },
    {
      id: 3,
      name: "Swiss Alps",
      category: "mountains",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      rating: 4.7,
      popularity: "adventure",
      description: "Breathtaking peaks and pristine nature"
    },
    {
      id: 4,
      name: "Kyoto, Japan",
      category: "culture",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
      rating: 4.8,
      popularity: "cultural",
      description: "Historic temples and traditional gardens"
    },
    {
      id: 5,
      name: "Bali, Indonesia",
      category: "beaches",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
      rating: 4.6,
      popularity: "trending",
      description: "Tropical paradise with rich culture"
    },
    {
      id: 6,
      name: "Patagonia",
      category: "adventure",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
      rating: 4.9,
      popularity: "adventure",
      description: "Wild landscapes and extreme adventures"
    },
  ]

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg">
                    <Compass className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Logo width={32} height={32} className="rounded-lg" />
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Nomady</span>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="flex-1 overflow-y-auto">
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
                    className="pl-12 pr-12 py-4 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:border-green-500 dark:focus:border-green-400"
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

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mb-12"
            >
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <stat.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </Card>
              ))}
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
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-950/30 border border-slate-200 dark:border-slate-700'
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

            {/* Coming Soon Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <Card className="p-8 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Compass className="h-8 w-8" />
                  <span className="text-2xl font-bold">{t('comingSoon')}</span>
                </div>
                <p className="text-lg mb-2">{t('underDevelopment')}</p>
                <p className="text-green-100 max-w-2xl mx-auto">{t('description')}</p>
              </Card>
            </motion.div>

            {/* Featured Destinations Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Featured Destinations</h2>
                <p className="text-slate-600 dark:text-slate-400">Preview of what's coming</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDestinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={destination.image} 
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/90 text-slate-900 border-0">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {destination.rating}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-green-600 text-white border-0 mb-2">
                            {destination.popularity}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{destination.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{destination.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              {[
                {
                  icon: <Search className="h-8 w-8" />,
                  title: t('features.discover.title'),
                  description: t('features.discover.description'),
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Map className="h-8 w-8" />,
                  title: t('features.maps.title'),
                  description: t('features.maps.description'),
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: t('features.personalized.title'),
                  description: t('features.personalized.description'),
                  color: "from-purple-500 to-pink-500"
                }
              ].map((feature, index) => (
                <Card key={index} className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
                </Card>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/chat")}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg"
                >
                  <Compass className="h-5 w-5 mr-2" />
                  {t('startExploring')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push("/bookings")}
                  className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 px-8 py-3 text-lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {t('viewBookings')}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 