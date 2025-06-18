"use client"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/shared/theme-provider"
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
} from "lucide-react"

interface AppSidebarProps {
  collapsed?: boolean
  onToggleCollapsed?: () => void
  conversations?: Array<{
    id: string
    user_id: number
    created_at: string
    last_updated: string
    messages: Array<{
      id: number
      role: string
      content: string
      timestamp: string
    }>
  }>
  currentConversationId?: string | null
  onConversationSelect?: (conversationId: string) => void
  onNewChat?: () => void
}

export function AppSidebar({
  collapsed = false,
  onToggleCollapsed,
  conversations = [],
  currentConversationId,
  onConversationSelect,
  onNewChat,
}: AppSidebarProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  // Update the sidebar items to use minimal colors
  const sidebarItems = [
    {
      icon: MessageCircle,
      label: "Chats",
      href: "/chat",
      active: pathname === "/chat",
      color: "text-blue-600 dark:text-blue-400",
      activeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    },
    {
      icon: Search,
      label: "Explore",
      href: "/chat",
      color: "text-slate-600 dark:text-slate-400",
      activeColor: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: Bookmark,
      label: "Bookings",
      href: "/bookings",
      active: pathname === "/bookings",
      color: "text-slate-600 dark:text-slate-400",
      activeColor: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: Heart,
      label: "Saved",
      href: "/chat",
      color: "text-slate-600 dark:text-slate-400",
      activeColor: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: Bell,
      label: "Updates",
      href: "/chat",
      color: "text-slate-600 dark:text-slate-400",
      activeColor: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: Lightbulb,
      label: "Inspiration",
      href: "/chat",
      color: "text-slate-600 dark:text-slate-400",
      activeColor: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
    {
      icon: Plus,
      label: "Create",
      href: "/chat",
      color: "text-slate-600 dark:text-slate-400",
      activeColor: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
    },
  ]

  return (
    // Update sidebar background
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-b border-slate-200 dark:border-slate-700`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-4`}>
          {!collapsed && (
          <div className="flex items-center space-x-2">
            {/* Update logo colors */}
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">TravelAI</span>
          </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          )}
          {!collapsed && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              // Update theme button hover
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              // Update logout button hover
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapsed}
                className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
          </div>
          )}
        </div>
        
        {collapsed && (
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapsed}
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        {!collapsed && (
        <nav className="space-y-1">
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start h-10 text-sm transition-all duration-200 ${
                item.active ? item.activeColor : `hover:bg-slate-100 dark:hover:bg-slate-700 ${item.color}`
              }`}
              onClick={() => {
                if (item.href && item.href !== pathname) {
                  router.push(item.href)
                }
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
              {item.label === "Chats" && conversations.length > 0 && (
                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                  {conversations.length}
                </span>
              )}
            </Button>
          ))}
        </nav>
        )}
        
        {collapsed && (
          <nav className="space-y-1 mt-4">
            {sidebarItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className={`w-full h-10 transition-all duration-200 ${
                  item.active ? item.activeColor : `hover:bg-slate-100 dark:hover:bg-slate-700 ${item.color}`
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
      </div>

      {/* Conversations - Only show on chat page */}
      {pathname === "/chat" && !collapsed && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Chats</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewChat}
                // Update new chat button
                className="text-blue-600 dark:text-blue-400 h-8 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
          </div>
          <div className="flex-1 px-4 pb-4 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    // Update conversation card active state
                    className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      currentConversationId === conversation.id
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => onConversationSelect?.(conversation.id)}
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1 line-clamp-2">
                      {conversation.messages.length > 0
                        ? conversation.messages[0].content.slice(0, 40) + "..."
                        : "New conversation"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(conversation.last_updated).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-slate-200 dark:border-slate-700 mt-auto`}>
        {!collapsed && (
        <div className="flex items-center space-x-3">
          {/* Update user profile avatar */}
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || "User"}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
