"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import {
  Plane,
  MapPin,
  Calendar,
  Users,
  Moon,
  Sun,
  Sparkles,
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Clock,
  Shield,
  Zap,
  MessageCircle,
  TrendingUp,
} from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"
import { useTranslations } from "@/lib/i18n-client"
import { motion } from "framer-motion"
import { Globe as GlobeComponent } from "@/components/magicui/globe"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"

export default function LandingPage() {
  const [tripPrompt, setTripPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const t = useTranslations('landing')
  const tNav = useTranslations('navigation')

  // Dynamic placeholders that cycle every few seconds
  const placeholders = [
    t('hero.placeholder.text1'),
    t('hero.placeholder.text2'),
    t('hero.placeholder.text3'),
    t('hero.placeholder.text4'),
    t('hero.placeholder.text5'),
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // Typing effect for placeholder
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const currentText = placeholders[placeholderIndex]
    let timeout: NodeJS.Timeout

    if (charIndex < currentText.length) {
      timeout = setTimeout(() => setCharIndex((i) => i + 1), 80)
    } else {
      // After full text typed, wait then move to next placeholder
      timeout = setTimeout(() => {
        setCharIndex(0)
        setPlaceholderIndex((i) => (i + 1) % placeholders.length)
      }, 2000)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, placeholderIndex, placeholders])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tripPrompt.trim()) return

    setIsLoading(true)
    // Store the prompt in sessionStorage to use after login
    sessionStorage.setItem("pendingTripPrompt", tripPrompt)
    router.push("/auth")
  }

  const features = [
    {
      icon: <Plane className="h-8 w-8" />,
      title: t('features.items.flights.title'),
      description: t('features.items.flights.description'),
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('features.items.experiences.title'),
      description: t('features.items.experiences.description'),
      color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: t('features.items.itineraries.title'),
      description: t('features.items.itineraries.description'),
      color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('features.items.group.title'),
      description: t('features.items.group.description'),
      color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('features.items.coverage.title'),
      description: t('features.items.coverage.description'),
      color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('features.items.safety.title'),
      description: t('features.items.safety.description'),
      color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
  ]

  const testimonials = [
    {
      name: t('testimonials.items.sarah.name'),
      role: t('testimonials.items.sarah.role'),
      content: t('testimonials.items.sarah.content'),
      rating: 5,
      avatar: "SJ",
    },
    {
      name: t('testimonials.items.mike.name'),
      role: t('testimonials.items.mike.role'),
      content: t('testimonials.items.mike.content'),
      rating: 5,
      avatar: "MC",
    },
    {
      name: t('testimonials.items.emma.name'),
      role: t('testimonials.items.emma.role'),
      content: t('testimonials.items.emma.content'),
      rating: 5,
      avatar: "ER",
    },
  ]

  const stats = [
    { number: "50K+", label: t('stats.travelers') },
    { number: "200+", label: t('stats.countries') },
    { number: "1M+", label: t('stats.trips') },
    { number: "4.9/5", label: t('stats.rating') },
  ]

  const pricingPlans = [
    {
      name: t('pricing.plans.free.name'),
      price: t('pricing.plans.free.price'),
      period: t('pricing.plans.free.period'),
      description: t('pricing.plans.free.description'),
      features: t('pricing.plans.free.features'),
      popular: false,
      cta: t('pricing.plans.free.cta'),
    },
    {
      name: t('pricing.plans.pro.name'),
      price: t('pricing.plans.pro.price'),
      period: t('pricing.plans.pro.period'),
      description: t('pricing.plans.pro.description'),
      features: t('pricing.plans.pro.features'),
      popular: true,
      cta: t('pricing.plans.pro.cta'),
    },
    {
      name: t('pricing.plans.team.name'),
      price: t('pricing.plans.team.price'),
      period: t('pricing.plans.team.period'),
      description: t('pricing.plans.team.description'),
      features: t('pricing.plans.team.features'),
      popular: false,
      cta: t('pricing.plans.team.cta'),
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          {/* Mobile Header - Two rows layout */}
          <div className="md:hidden">
            {/* First row: Logo + Name */}
            <div className="flex items-center justify-center mb-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="flex items-center space-x-3 group"
              >
                <Logo width={40} height={40} className="rounded-xl" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                  Nomady
                </span>
              </motion.div>
            </div>
            
            {/* Second row: Action buttons */}
            <div className="flex items-center justify-center space-x-3">
              <LanguageSwitcher />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 group"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === "dark" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-slate-600" />
                    )}
                  </motion.div>
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  onClick={() => router.push("/auth")} 
                  className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden group"
                >
                  <span className="relative z-10">{tNav('getStarted')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Desktop Header - Single row layout */}
          <div className="hidden md:flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="flex items-center space-x-3 group"
            >
                <Logo width={40} height={40} className="rounded-xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Nomady
              </span>
            </motion.div>

            <nav className="flex items-center space-x-1">
              {[
                { href: "#features", label: tNav('features') },
                { href: "#how-it-works", label: tNav('howItWorks') },
                { href: "#pricing", label: tNav('pricing') },
                { href: "#testimonials", label: tNav('reviews') }
              ].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 group"
                >
                  {item.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 group"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === "dark" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-slate-600" />
                    )}
                  </motion.div>
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={() => router.push("/auth")} 
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-lg px-4 py-2 hover:scale-105"
                >
                  {tNav('signIn')}
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  onClick={() => router.push("/auth")} 
                  className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 overflow-hidden group"
                >
                  <span className="relative z-10">{tNav('getStarted')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900" />
        
        {/* Background Globe */}
        <div className="absolute bottom-[150px] left-1/2 -translate-x-1/2 w-full h-full opacity-30 dark:opacity-15 z-0">
          <GlobeComponent className="w-full h-full" />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
                className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <Logo width={16} height={16} />
                <AnimatedGradientText className="text-sm" colorFrom="#1d4ed8" colorTo="#3b82f6">
                  {t('hero.badge')}
                </AnimatedGradientText>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <motion.span 
                  className="text-slate-900 dark:text-white block"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.3 }}
                >
                  {t('hero.title.line1')}
                </motion.span>
                <motion.span 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent block"
                  initial={{ y: 50, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0.3 }}
                >
                  {t('hero.title.line2')}
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, type: "spring", bounce: 0.2 }}
              >
                {t('hero.subtitle')}
              </motion.p>
            </motion.div>

            {/* Trip Prompt Form */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1, type: "spring", bounce: 0.3 }}
              className="max-w-xl mx-auto mb-16"
            >
              <form onSubmit={handleSubmit} className="relative">
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <Input
                    type="text"
                    placeholder={placeholders[placeholderIndex].slice(0, charIndex)}
                    value={tripPrompt}
                    onChange={(e) => setTripPrompt(e.target.value)}
                    className="text-[1.2rem] py-6 px-6 pr-16 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 transition-all duration-300 focus:scale-[1.02] shadow-lg"
                    disabled={isLoading}
                  />
                  
                  <motion.div
                    className="absolute right-1 inset-y-0 flex items-center"
                    initial={false}
                    animate={{
                      opacity: tripPrompt.trim() ? 1 : 0,
                      scale: tripPrompt.trim() ? 1 : 0.8,
                      x: tripPrompt.trim() ? 0 : 10,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!tripPrompt.trim() || isLoading}
                      className="h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
              
              <motion.p 
                className="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                {t('hero.helpText')}
              </motion.p>
            </motion.div>

                          {/* Backed by nFactorial Badge */}
                          <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.8 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ duration: 0.8, delay: 1.8, type: "spring", bounce: 0.5 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-2 shadow-[inset_0_-8px_10px_#ff8f8f1f] transition-all duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#ff8f8f3f] hover:scale-110">
                  <span
                    className={cn(
                      "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ef4444]/50 via-[#dc2626]/50 to-[#ef4444]/50 bg-[length:300%_100%] p-[1px]",
                    )}
                    style={{
                      WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "destination-out",
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "subtract",
                      WebkitClipPath: "padding-box",
                    }}
                  />
                  <img src="/nfactorial-logo.png" alt="nFactorial Incubator" className="h-5 w-5 mr-2" />
                  <span className="text-slate-600 dark:text-slate-300 text-sm font-medium mr-1">{t('hero.backedBy')}</span>
                </div>
              </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                <AnimatedGradientText colorFrom="#0f172a" colorTo="#475569" className="text-4xl md:text-5xl font-bold dark:from-white dark:to-slate-300">
                  {t('features.title')}
                </AnimatedGradientText>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-lg transition-all duration-200 border-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                <AnimatedGradientText colorFrom="#3b82f6" colorTo="#1d4ed8" className="text-4xl md:text-5xl font-bold">
                  {t('howItWorks.title')}
                </AnimatedGradientText>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: t('howItWorks.steps.step1.title'),
                  description: t('howItWorks.steps.step1.description'),
                  icon: <MessageCircle className="h-8 w-8" />,
                },
                {
                  step: "2",
                  title: t('howItWorks.steps.step2.title'),
                  description: t('howItWorks.steps.step2.description'),
                  icon: <Zap className="h-8 w-8" />,
                },
                {
                  step: "3",
                  title: t('howItWorks.steps.step3.title'),
                  description: t('howItWorks.steps.step3.description'),
                  icon: <CheckCircle className="h-8 w-8" />,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="relative">
                    <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                <AnimatedGradientText colorFrom="#f59e0b" colorTo="#d97706" className="text-4xl md:text-5xl font-bold">
                  {t('testimonials.title')}
                </AnimatedGradientText>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t('testimonials.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full bg-white dark:bg-slate-800 border-0 shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                {t('pricing.title')}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t('pricing.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`p-8 h-full relative ${
                    plan.popular ? "border-2 border-blue-500 shadow-xl scale-105" : "border-0 shadow-lg"
                  } bg-white dark:bg-slate-800`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        {t('pricing.mostPopular')}
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                      <span className="text-slate-500 dark:text-slate-400">/{plan.period}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {Array.isArray(plan.features) && plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                    }`}
                    onClick={() => router.push("/auth")}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
              <p className="text-xl mb-8 opacity-90">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push("/auth")}
                  className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold"
                >
                  {t('cta.button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo width={32} height={32} className="rounded-lg" />
                <span className="text-xl font-bold text-blue-400">Nomady</span>
              </div>
              <p className="text-slate-400 mb-4">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">{/* Social media icons would go here */}</div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.features')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.pricing')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.api')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.mobileApp')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.about')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.blog')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.careers')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.contact')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.helpCenter')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.terms')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('footer.links.status')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">{t('footer.copyright')}</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">{t('footer.madeWith')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
