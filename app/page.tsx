"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Hotel,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n-client"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { useI18n } from "@/lib/i18n-client"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { InteractiveMap } from "@/components/interactive-map"
import { MobileMapOverlay, ChatHeader, MessagesList, ChatInput } from "@/components/chat"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { Message, Conversation, IpGeolocation } from "@/types/chat"
import { HeroHeader } from '@/components/landing/hero-header'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { TextEffect } from "@/components/motion-primitives/text-effect"
import { AnimatedGroup } from "@/components/motion-primitives/animated-group"

// Lazy-load heavy client-only components to cut initial JS
const GlobeComponent = dynamic(() => import("@/components/magicui/globe").then(m => m.Globe), { ssr: false })
const DemoChat = dynamic(() => import("@/components/landing/demo-chat").then(m => m.DemoChat), { ssr: false })

export default function LandingPage() {
  const [tripPrompt, setTripPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const t = useTranslations('landing')
  const tNav = useTranslations('navigation')
  const { locale, setLocale } = useI18n()
  const languages = [
    { code: 'en', flag: '🇷🇺' },
    { code: 'ru', flag: '🇺🇸' }
  ]
  const currentLang = languages.find(l => l.code === locale) || languages[0]
  const otherLang = languages.find(l => l.code !== locale) || languages[1]

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
  // Delay heavy globe initialization until browser is idle to improve first-load performance
  const [showGlobe, setShowGlobe] = useState(false)

  // --- chat state ---
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isChatStreaming, setIsChatStreaming] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [bookedItems, setBookedItems] = useState<Record<string, any>>({})
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapWidth, setMapWidth] = useState(35)
  const resizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(35)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [ipGeolocation, setIpGeolocation] = useState<IpGeolocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pendingStreamingUpdate, setPendingStreamingUpdate] = useState<string>("")
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [activeSearches, setActiveSearches] = useState<Set<string>>(new Set())
  const [currentlyStreamingMessageId, setCurrentlyStreamingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  // 1. sessionId для анонимного пользователя
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) return;
    let sid = localStorage.getItem('anon_chat_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('anon_chat_session_id', sid);
    }
    setSessionId(sid);
  }, [isAuthenticated]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  // 2. При загрузке страницы — если есть sessionId, подгрузить историю
  useEffect(() => {
    if (isAuthenticated || !sessionId) return;
    fetch(`${API_BASE_URL}/chat/demo/history?session_id=${sessionId}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Failed to fetch chat history:', res.status, text);
          return { messages: [] };
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages.map((m: any) => ({
            id: m.id?.toString() || crypto.randomUUID(),
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            tool_output: m.tool_output ?? null,
            tool_type: m.tool_type ?? null,
          })));
        }
      });
  }, [sessionId, isAuthenticated]);

  // 3. При отправке сообщений через demo endpoint — всегда передавать sessionId
  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isChatLoading || isChatStreaming) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsChatLoading(true);
    setIsChatStreaming(true);
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "", timestamp: new Date() }]);
    try {
      let response;
      if (isAuthenticated) {
        response = await apiClient.sendMessage([{ role: "user", content: inputText }]);
      } else {
        const res = await fetch(`${API_BASE_URL}/chat/demo?session_id=${sessionId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: "user", content: inputText }] })
          }
        );
        if (!res.ok) {
          const text = await res.text();
          console.error('Failed to send demo message:', res.status, text);
          response = { response: "Sorry, error. Please try again." };
        } else {
          response = await res.json();
        }
      }
      setMessages((prev) => prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: response.data?.response || response.response || "",
              tool_output: response.data?.tool_output || response.tool_output || null,
              tool_type: response.data?.tool_type || response.tool_type || null,
            }
          : msg
      ));
    } catch (error) {
      setMessages((prev) => prev.map((msg) => msg.id === assistantMessageId ? { ...msg, content: "Sorry, error. Please try again." } : msg));
    } finally {
      setIsChatLoading(false);
      setIsChatStreaming(false);
    }
  };

  // handleRemoveItem, handleClearAll, loadConversation, startNewConversation, handleBooked — скопировать из chat/page.tsx или реализовать-заглушки
  const handleRemoveItem = (id: string) => {
    setBookedItems((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setBookedIds((prev) => {
      const updated = new Set(prev)
      updated.delete(id)
      return updated
    })
  }
  const handleClearAll = () => {
    setBookedItems({})
    setBookedIds(new Set())
  }
  const loadConversation = async (conversationId: string) => {/* заглушка или логика */}
  const startNewConversation = () => {/* заглушка или логика */}
  const handleBooked = (bookedItem: any, id: string, type: string) => {/* заглушка или логика */}

  const features = [
    {
      icon: <Plane className="h-8 w-8" />,
      title: t('features.items.flights.title'),
      description: t('features.items.flights.description'),
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('features.items.experiences.title'),
      description: t('features.items.experiences.description'),
      color: "bg-slate-100 text-slate-700",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: t('features.items.itineraries.title'),
      description: t('features.items.itineraries.description'),
      color: "bg-slate-100 text-slate-700",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('features.items.group.title'),
      description: t('features.items.group.description'),
      color: "bg-slate-100 text-slate-700",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('features.items.coverage.title'),
      description: t('features.items.coverage.description'),
      color: "bg-slate-100 text-slate-700",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('features.items.safety.title'),
      description: t('features.items.safety.description'),
      color: "bg-slate-100 text-slate-700",
    },
  ]

  const testimonials = [
    {
      name: t('testimonials.items.nurzhan.name'),
      role: t('testimonials.items.nurzhan.role'),
      content: t('testimonials.items.nurzhan.content'),
      rating: 5,
      avatar: "/images/nurzhan.jpg",
    },
    {
      name: t('testimonials.items.madiaubakirov.name'),
      role: t('testimonials.items.madiaubakirov.role'),
      content: t('testimonials.items.madiaubakirov.content'),
      rating: 5,
      avatar: "/images/madiaubakirov.jpg",
    },
    {
      name: t('testimonials.items.zhuldyz_rakhmet.name'),
      role: t('testimonials.items.zhuldyz_rakhmet.role'),
      content: t('testimonials.items.zhuldyz_rakhmet.content'),
      rating: 5,
      avatar: "/images/zhuldyz_rakhmet.jpg",
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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = mapWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const deltaPx = startXRef.current - ev.clientX;
      const deltaPercent = (deltaPx / window.innerWidth) * 100;
      const newWidth = Math.max(30, Math.min(50, startWidthRef.current + deltaPercent));
      setMapWidth(newWidth);
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripPrompt.trim()) return;
    setInput(tripPrompt);
    setTripPrompt("");
    await handleSendMessage(tripPrompt);
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      localStorage.removeItem('anon_chat_session_id');
      router.replace('/chat');
    }
  }, [isAuthenticated, router]);

  // Переместить определения состояния и функций выше, до рендера
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const handleContinueAsGuest = () => {
    setShowLoginPopup(false);
    sessionStorage.setItem('hideLoginPopup', '1');
  };
  const handleSignIn = () => {
    setShowLoginPopup(false);
    router.push('/auth');
  };
  useEffect(() => {
    if (
      !isAuthenticated &&
      messages.some(m => m.role === 'user') &&
      !sessionStorage.getItem('hideLoginPopup') &&
      !showLoginPopup
    ) {
      setShowLoginPopup(true);
    }
  }, [messages, isAuthenticated, showLoginPopup]);

  if (isAuthenticated === true) return null;

  // В рендере:
  // Если showChat === true или есть сообщения — показываем чат, иначе лендинг
  if (messages.length > 0) {
    return (
      <>
        <Dialog
          open={showLoginPopup}
          onOpenChange={(open) => {
            setShowLoginPopup(open);
            if (!open) sessionStorage.setItem('hideLoginPopup', '1');
          }}
        >
          <DialogContent className="max-w-xs w-[90vw] sm:max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle>{t('loginPopup.title')}</DialogTitle>
              <DialogDescription>
                {t('loginPopup.description')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2">
              <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{t('loginPopup.signIn')}</Button>
              <Button variant="outline" onClick={handleContinueAsGuest} className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{t('loginPopup.continueAsGuest')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex h-screen bg-slate-50">
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          <MobileMapOverlay
            showMobileMap={showMobileMap}
            setShowMobileMap={setShowMobileMap}
            bookedItems={bookedItems}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
          />
          <AppSidebar
            currentConversationId={currentConversationId}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onConversationSelect={loadConversation}
            onNewChat={startNewConversation}
          />
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 flex min-w-0 min-h-0">
              <div className="flex flex-col min-w-0 w-full flex-1 min-h-0">
                <div className="md:hidden sticky top-0 z-30">
                  <ChatHeader
                    setSidebarOpen={setSidebarOpen}
                    setShowMobileMap={setShowMobileMap}
                    bookedItemsCount={Object.keys(bookedItems).length}
                  />
            </div>
                <div className="flex-1 overflow-y-auto min-h-0 h-full" style={{ paddingBottom: isMobile ? 112 : 0 }}>
                  <MessagesList
                    ref={messagesEndRef}
                    messages={messages}
                    isStreaming={isChatStreaming}
                    streamingMessage={streamingMessage}
                    activeSearches={activeSearches}
                    currentlyStreamingMessageId={currentlyStreamingMessageId}
                    showTypingIndicator={showTypingIndicator}
                    bookedIds={bookedIds}
                    onBooked={handleBooked}
                    onSuggestionClick={setInput}
                  />
          </div>
                <div className="md:static md:mt-0 sticky bottom-0 z-30">
                  <ChatInput
                    ref={null}
                    input={input}
                    setInput={setInput}
                    onSendMessage={(e) => {
                      e.preventDefault();
                      handleSendMessage(input);
                    }}
                    isLoading={isChatLoading}
                    isStreaming={isChatStreaming}
                  />
        </div>
              </div>
              {/* Resize handle и карта только на md+ */}
              <div className="hidden md:block w-1 bg-slate-200 hover:bg-blue-500 cursor-col-resize transition-colors relative group" onMouseDown={handleMouseDown}>
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
              </div>
              <div className="hidden md:block bg-slate-50 border-l border-slate-200" style={{ width: `${mapWidth}%` }}>
                <InteractiveMap
                  selectedItems={Object.values(bookedItems)}
                  onRemoveItem={handleRemoveItem}
                  onClearAll={handleClearAll}
                  userLocation={ipGeolocation && typeof (ipGeolocation as any).lat === 'number' && typeof (ipGeolocation as any).lng === 'number' ? { lat: Number((ipGeolocation as any).lat), lng: Number((ipGeolocation as any).lng) } : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroHeader />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <Image
          src="/landing/sky.png"
          alt="Sky background"
          fill
          className="object-cover z-0 opacity-90"
          priority
          placeholder="blur"
          blurDataURL="/landing/sky-blur.png" // маленькая версия (например, 20x12px, сильно сжатая)
        />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-white/80 to-transparent" />
        <div className="container mx-auto px-6 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* SVG Launch Logo */}
            <div className="flex justify-center mb-8">
              <a href="https://peerlist.io/bebdyshev/project/nomadylive" target="_blank" rel="noopener noreferrer" className="cursor-pointer transition-opacity hover:opacity-80">
                <Image src="/Launch_SVG_Light.svg" alt="Launch" width={221} height={60} priority />
              </a>
            </div>
            <AnimatedGroup preset="blur-slide" className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Logo width={16} height={16} />
                <TextEffect className="text-sm" preset="fade-in-blur" delay={0.1} speedSegment={0.8} as="span">
                  {t('hero.badge')}
                </TextEffect>
              </div>
              <TextEffect
                as="h1"
                className="text-5xl md:text-7xl font-bold mb-6 text-center"
                preset="fade-in-blur"
                delay={0.2}
                speedSegment={0.7}
              >
                {`${t('hero.title.line1')}
${t('hero.title.line2')}`}
              </TextEffect>
              <TextEffect
                as="p"
                className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto"
                preset="fade-in-blur"
                delay={0.3}
                speedSegment={0.8}
              >
                {t('hero.subtitle')}
              </TextEffect>
              <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto mb-16">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={placeholders[placeholderIndex].slice(0, charIndex)}
                    value={tripPrompt}
                    onChange={(e) => setTripPrompt(e.target.value)}
                    className="text-[1.2rem] py-6 px-6 pr-16 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:scale-[1.02] shadow-lg"
                    disabled={isLoading}
                  />
                  <div className="absolute right-1 inset-y-0 flex items-center">
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
                  </div>
                </div>
              </form>
          
              <div className="flex items-center justify-center mb-6">
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
                  <Image src="/nfactorial-logo.png" alt="nFactorial Incubator" width={20} height={20} className="h-5 w-5 mr-2" />
                  <span className="text-slate-600 text-sm font-medium mr-1">{t('hero.backedBy')}</span>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <AnimatedGroup preset="fade" className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </AnimatedGroup>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <TextEffect
              as="h2"
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              preset="fade-in-blur"
              delay={0.1}
              speedSegment={0.8}
            >
              {t('howItWorks.title')}
            </TextEffect>
            <TextEffect
              as="p"
              className="text-xl text-slate-600 max-w-2xl mx-auto"
              preset="fade-in-blur"
              delay={0.2}
              speedSegment={0.8}
            >
              {t('howItWorks.subtitle')}
            </TextEffect>
          </div>
          <AnimatedGroup preset="fade" className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
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
              <div key={index} className="text-center relative">
                <div className="relative">
                  <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{step.step}</span>
                  </div>
                </div>
                <div className="text-xl font-semibold mb-3 text-slate-900">{step.title}</div>
                <div className="text-slate-600">{step.description}</div>
              </div>
            ))}
          </AnimatedGroup>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <TextEffect
              as="h2"
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              preset="fade-in-blur"
              delay={0.1}
              speedSegment={0.8}
            >
              {t('testimonials.title')}
            </TextEffect>
            <TextEffect
              as="p"
              className="text-xl text-slate-600 max-w-2xl mx-auto"
              preset="fade-in-blur"
              delay={0.2}
              speedSegment={0.8}
            >
              {t('testimonials.subtitle')}
            </TextEffect>
          </div>
          <AnimatedGroup preset="fade" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 h-full bg-white border-0 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-slate-600 mb-6 leading-relaxed">"{testimonial.content}"</div>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover mr-3 border border-slate-200" />
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </AnimatedGroup>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <TextEffect
              as="h2"
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              preset="fade-in-blur"
              delay={0.1}
              speedSegment={0.8}
            >
              {t('pricing.title')}
            </TextEffect>
            <TextEffect
              as="p"
              className="text-xl text-slate-600 max-w-2xl mx-auto"
              preset="fade-in-blur"
              delay={0.2}
              speedSegment={0.8}
            >
              {t('pricing.subtitle')}
            </TextEffect>
          </div>
          <AnimatedGroup preset="fade" className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 h-full relative ${
                  plan.popular ? "border-2 border-blue-500 shadow-xl scale-105" : "border-0 shadow-lg"
                } bg-white`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {t('pricing.mostPopular')}
                    </div>
                  </div>
                )}
                <div className="text-center mb-8">
                  <div className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</div>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">/{plan.period}</span>
                  </div>
                  <div className="text-slate-600">{plan.description}</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {Array.isArray(plan.features) && plan.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
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
            ))}
          </AnimatedGroup>
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
