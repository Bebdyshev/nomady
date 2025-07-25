"use client"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations, useI18n } from "@/lib/i18n-client"
import { type Locale } from "@/i18n"
import {
  MessageCircle,
  Search,
  Heart,
  Bell,
  Lightbulb,
  Plus,
  User,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  MapPin,
  CheckCircle2,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { useConversations } from "@/contexts/conversations-context"
import { Skeleton } from "@/components/ui/skeleton"

interface AppSidebarProps {
  collapsed?: boolean
  onToggleCollapsed?: () => void
  // Chat-specific props (optional)
  currentConversationId?: string | null
  onConversationSelect?: (conversationId: string) => void
  onNewChat?: () => void
  // Mobile sidebar control (for chat page)
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
}

export function AppSidebar({
  collapsed = false,
  onToggleCollapsed,
  currentConversationId,
  onConversationSelect,
  onNewChat,
  sidebarOpen = true,
  setSidebarOpen,
}: AppSidebarProps) {
  const { user, logout } = useAuth()
  const { conversations, loading } = useConversations()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('chat.sidebar')
  const tCommon = useTranslations('common')
  const { locale, setLocale } = useI18n()

  const languages = [
    { code: 'en' as Locale, name: 'EN' },
    { code: 'ru' as Locale, name: 'RU' }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale)
  const otherLanguage = languages.find(lang => lang.code !== locale)

  const handleLanguageChange = () => {
    if (otherLanguage) {
      setLocale(otherLanguage.code)
    }
  }

  const isOnChatPage = pathname === "/chat"

  // Sidebar items with proper navigation
  const sidebarItems = [
    {
      icon: MessageCircle,
      label: t('chats'),
      href: "/chat",
      active: pathname === "/chat",
      color: "text-blue-600",
      activeColor: "bg-blue-100 text-blue-700",
    },
    {
      icon: Search,
      label: t('explore'),
      href: "/explore",
      active: pathname === "/explore",
      color: "text-slate-600",
      activeColor: "bg-slate-100 text-slate-700",
    },
    {
      icon: Bookmark,
      label: t('bookings'),
      href: "/bookings",
      active: pathname === "/bookings",
      color: "text-slate-600",
      activeColor: "bg-slate-100 text-slate-700",
    },
    {
      icon: Heart,
      label: t('saved'),
      href: "/favorites",
      active: pathname === "/favorites",
      color: "text-slate-600",
      activeColor: "bg-slate-100 text-slate-700",
    },
  ]

  // For chat page, use mobile behavior, for others use standard sidebar
  const sidebarClasses = cn(
    "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300",
    "fixed md:relative inset-y-0 left-0 z-50 md:z-0 transform ease-in-out",
    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
    collapsed ? "w-16" : "w-64 md:w-[20%]"
  )

  return (
    <div className={sidebarClasses}>
      {/* Sidebar Header */}
      <div className={`${collapsed ? 'p-2' : 'p-3 md:p-4'} border-b border-slate-200`}>
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-w-0 flex items-center space-x-2">
              <Logo width={32} height={32} className="rounded-lg" />
              <span className="hidden sm:inline text-lg font-bold text-blue-600 truncate">Nomady</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLanguageChange}
                className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                title={t('switchLanguage')}
              >
                <span className="text-lg select-none">
                  {locale === 'en' ? '🇺🇸' : '🇷🇺'}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
                className="h-8 w-8 hover:bg-slate-100 text-slate-600"
              >
                <span className="text-lg select-none">
                  {locale === 'en' ? '🇷🇺' : '🇺🇸'}
                </span>
              </Button>
              <button
                onClick={() => setSidebarOpen?.(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className={`hidden md:block ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-4`}>
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <Logo width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold text-blue-600">Nomady</span>
              </div>
            )}
            {collapsed && (
              <Logo width={32} height={32} className="rounded-lg" />
            )}
            {!collapsed && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLanguageChange}
                  className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                  title={t('switchLanguage')}
                >
                  <span className="text-lg select-none">
                    {locale === 'en' ? '🇺🇸' : '🇷🇺'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
                  className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                >
                  <span className="text-lg select-none">
                    {locale === 'en' ? '🇷🇺' : '🇺🇸'}
                  </span>
                </Button>
                {onToggleCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapsed}
                    className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {collapsed && !isOnChatPage && (
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLanguageChange}
              className="h-8 w-8 hover:bg-slate-100 text-slate-600"
              title={t('switchLanguage')}
            >
              <span className="text-lg select-none">
                {locale === 'en' ? '🇺🇸' : '🇷🇺'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
              className="h-8 w-8 hover:bg-slate-100 text-slate-600"
            >
              <span className="text-lg select-none">
                {locale === 'en' ? '🇷🇺' : '🇺🇸'}
              </span>
            </Button>
            {onToggleCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapsed}
                className="h-8 w-8 hover:bg-slate-100 text-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Navigation */}
        {!collapsed && (
          <nav className="space-y-1 mb-4">
            {sidebarItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start h-10 text-sm transition-all duration-200 ${
                  item.active ? item.activeColor : `hover:bg-slate-100 ${item.color}`
                }`}
                onClick={() => {
                  if (item.href && item.href !== pathname) {
                    router.push(item.href)
                  }
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
                {item.label === t('chats') && conversations.length > 0 && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {conversations.length}
                  </span>
                )}
              </Button>
            ))}
          </nav>
        )}
        
        {collapsed && !isOnChatPage && (
          <nav className="space-y-1 mt-4">
            {sidebarItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className={`w-full h-10 transition-all duration-200 ${
                  item.active ? item.activeColor : `hover:bg-slate-100 ${item.color}`
                }`}
                onClick={() => {
                  if (item.href && item.href !== pathname) {
                    router.push(item.href)
                  }
                }}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </Button>
            ))}
          </nav>
        )}

        {/* Chat-specific header for conversations */}
        {conversations.length > 0 && !collapsed && (
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">{t('recentChats')}</h3>
            <Button
              onClick={() => {
                // Navigate to chat page if not already there, then start new chat
                if (pathname !== "/chat") {
                  router.push("/chat")
                } else {
                  onNewChat?.()
                }
              }}
              variant="ghost"
              size="sm"
              className="text-blue-600 h-8 text-xs hover:bg-blue-100"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('new')}
            </Button>
          </div>
        )}
      </div>

      {/* Conversations - Show when conversations exist */}
      {!collapsed && loading && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            <div className="space-y-2">
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} className="h-14 rounded-lg w-full" />
              ))}
            </div>
          </div>
        </div>
      )}
      {conversations.length > 0 && !collapsed && !loading && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentConversationId === conversation.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    // Navigate to chat page if not already there
                    if (pathname !== "/chat") {
                      router.push(`/chat?conversation=${conversation.id}`)
                    } else {
                      onConversationSelect?.(conversation.id)
                    }
                    if (window.innerWidth < 768) setSidebarOpen?.(false)
                  }}
                >
                  <div className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">
                    {conversation.title || 
                     (conversation.messages.length > 0
                       ? conversation.messages[0].content.slice(0, 40) + "..."
                       : t('newConversation'))}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state for no conversations - only show on chat page */}
      {isOnChatPage && conversations.length === 0 && !collapsed && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            <div className="space-y-2">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{t('noConversations')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('startChat')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* For non-chat pages without conversations, add spacer */}
      {(!isOnChatPage && conversations.length === 0) && !collapsed && <div className="flex-1" />}

      {/* User Profile */}
      <div className={`${collapsed ? 'p-2' : 'p-3 md:p-4'} border-t border-slate-200 mt-auto`}>
        {!collapsed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                {user?.picture ? (
                  <AvatarImage src={user.picture} alt={user.name || "User"} />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{user?.name || "Traveler"}</div>
                <div className="text-xs text-slate-500 max-w-[140px] truncate">{user?.email}</div>
              </div>
            </div>
            {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 flex-shrink-0 hover:bg-slate-100 text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => router.push('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              {user?.picture ? (
                <AvatarImage src={user.picture} alt={user.name || "User"} />
              ) : (
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        )}
      </div>
    </div>
  )
}
