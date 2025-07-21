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
  Users,
  Menu
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "@/lib/i18n-client"
import { Logo } from "@/components/ui/logo"
import { apiClient } from "@/lib/api"
import { Conversation } from "@/types/chat"
import { useEffect } from "react"
import { MainLayout } from "@/components/shared/main-layout"

const FavoritesHeader = () => {
  const router = useRouter()
  const t = useTranslations('favorites')
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl md:border-b md:border-slate-200/50 md:dark:border-slate-700/50"
    >
      <div className="container mx-auto px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-lg">
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 hidden md:block">{t('subtitle')}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Logo width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Nomady</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default function FavoritesPage() {
  const router = useRouter()
  const t = useTranslations('favorites')
  const tCommon = useTranslations('common')
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCollection, setActiveCollection] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const collections = [
    { id: "all", label: "All Favorites", count: 12, color: "bg-blue-500" },
    { id: "wishlist", label: t('collections.wishlist'), count: 8, color: "bg-red-500" },
    { id: "visited", label: t('collections.visited'), count: 4, color: "bg-green-500" },
    { id: "planning", label: t('collections.planning'), count: 5, color: "bg-purple-500" },
    { id: "recommendations", label: t('collections.recommendations'), count: 6, color: "bg-orange-500" },
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
    <MainLayout header={<FavoritesHeader />}>
      <div className="container mx-auto px-6 py-8">

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
    </MainLayout>
  )
} 