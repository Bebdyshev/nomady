"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { useState } from "react"
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  MapPin, 
  Bookmark,
  Share2,
  Plus,
  Grid3x3,
  List,
  Search,
  Filter,
  Palette,
  Globe2,
  Clock,
  Users
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/i18n-client"
import { Logo } from "@/components/ui/logo"

export default function FavoritesPage() {
  const router = useRouter()
  const t = useTranslations('favorites')
  const tCommon = useTranslations('common')
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCollection, setActiveCollection] = useState("all")

  const collections = [
    { id: "all", label: "All Favorites", count: 12, color: "bg-blue-500" },
    { id: "wishlist", label: t('collections.wishlist'), count: 8, color: "bg-red-500" },
    { id: "visited", label: t('collections.visited'), count: 4, color: "bg-green-500" },
    { id: "planning", label: t('collections.planning'), count: 5, color: "bg-purple-500" },
    { id: "recommendations", label: t('collections.recommendations'), count: 6, color: "bg-orange-500" },
  ]

  const stats = [
    { number: "12", label: "Saved Places", icon: Heart },
    { number: "4", label: "Collections", icon: Bookmark },
    { number: "2", label: "Shared Lists", icon: Share2 },
  ]

  const savedPlaces = [
    {
      id: 1,
      name: "Santorini, Greece",
      category: "destination",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
      rating: 4.9,
      savedDate: "2 days ago",
      collection: "wishlist",
      tags: ["beaches", "romantic", "sunset"]
    },
    {
      id: 2,
      name: "Kyoto Temple Tour",
      category: "experience",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
      rating: 4.8,
      savedDate: "1 week ago",
      collection: "planning",
      tags: ["culture", "temples", "traditional"]
    },
    {
      id: 3,
      name: "Swiss Mountain Resort",
      category: "hotel",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      rating: 4.7,
      savedDate: "3 days ago",
      collection: "wishlist",
      tags: ["mountains", "luxury", "skiing"]
    },
    {
      id: 4,
      name: "Tokyo Food Tour",
      category: "experience",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      rating: 4.9,
      savedDate: "5 days ago",
      collection: "visited",
      tags: ["food", "culture", "local"]
    },
    {
      id: 5,
      name: "Bali Beach Villa",
      category: "hotel",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
      rating: 4.6,
      savedDate: "1 day ago",
      collection: "planning",
      tags: ["beaches", "villa", "tropical"]
    },
    {
      id: 6,
      name: "Patagonia Trek",
      category: "experience",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
      rating: 4.8,
      savedDate: "4 days ago",
      collection: "wishlist",
      tags: ["adventure", "hiking", "nature"]
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "destination": return MapPin
      case "hotel": return Heart
      case "experience": return Star
      default: return Heart
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "destination": return "bg-blue-500"
      case "hotel": return "bg-green-500"
      case "experience": return "bg-purple-500"
      default: return "bg-slate-500"
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950">
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
                  <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
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
            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <stat.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </Card>
              ))}
            </motion.div>

            {/* Coming Soon Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <Card className="p-8 bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Heart className="h-8 w-8" />
                  <span className="text-2xl font-bold">{t('comingSoon')}</span>
                </div>
                <p className="text-lg mb-2">{t('underDevelopment')}</p>
                <p className="text-red-100 max-w-2xl mx-auto">{t('description')}</p>
              </Card>
            </motion.div>

            {/* Collection Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Collections</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="p-2"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {collections.map((collection, index) => (
                  <motion.button
                    key={collection.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setActiveCollection(collection.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      activeCollection === collection.id
                        ? 'bg-red-600 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${activeCollection === collection.id ? 'bg-white/30' : collection.color}`} />
                    <span className="text-sm font-medium">{collection.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {collection.count}
                    </Badge>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Saved Places Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Saved Places Preview</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search favorites..."
                      className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {savedPlaces.map((place, index) => {
                  const CategoryIcon = getCategoryIcon(place.category)
                  
                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group cursor-pointer"
                    >
                      <Card className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${
                        viewMode === "list" ? "flex" : ""
                      }`}>
                        <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 h-32" : "h-48"}`}>
                          <img 
                            src={place.image} 
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white/90 text-slate-900 border-0">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {place.rating}
                            </Badge>
                          </div>
                          <div className="absolute top-3 left-3">
                            <div className={`p-1 rounded-full ${getCategoryColor(place.category)}`}>
                              <CategoryIcon className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3">
                            <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white p-1">
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-white">{place.name}</h3>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{place.savedDate}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {place.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 text-xs">
                              {place.collection}
                            </Badge>
                            <Button size="sm" variant="ghost" className="p-1">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              {[
                {
                  icon: <Bookmark className="h-8 w-8" />,
                  title: t('features.save.title'),
                  description: t('features.save.description'),
                  color: "from-red-500 to-pink-500"
                },
                {
                  icon: <Palette className="h-8 w-8" />,
                  title: t('features.organize.title'),
                  description: t('features.organize.description'),
                  color: "from-purple-500 to-violet-500"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: t('features.share.title'),
                  description: t('features.share.description'),
                  color: "from-blue-500 to-cyan-500"
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

            {/* Empty State Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <Card className="p-12 text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-600">
                <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('empty.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{t('empty.description')}</p>
                <Button
                  onClick={() => router.push("/explore")}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('empty.action')}
                </Button>
              </Card>
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
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {t('startPlanning')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push("/bookings")}
                  className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 px-8 py-3 text-lg"
                >
                  <Globe2 className="h-5 w-5 mr-2" />
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