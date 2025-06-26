"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, MapPin, CheckCircle2, Heart, Sun, Moon, LogOut, X, Plus, User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
import { useTheme } from "@/components/shared/theme-provider"
import { useRouter } from "next/navigation"
import { Conversation } from "@/types/chat"

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  user: any
  logout: () => void
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  sidebarOpen,
  setSidebarOpen,
  onConversationSelect,
  onNewConversation,
  user,
  logout
}: ChatSidebarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  return (
    <div
      className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0
        w-64 md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Logo width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Nomady</span>
            </div>
            <div className="flex items-center space-x-1">
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
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-4">
            {[
              {
                icon: MessageCircle,
                label: "Chats",
                active: true,
                color: "text-blue-600 dark:text-blue-400",
                activeColor: "bg-blue-100 dark:bg-blue-900/30",
              },
              { icon: MapPin, label: "Explore", color: "text-slate-600 dark:text-slate-400" },
              { icon: CheckCircle2, label: "Bookings", color: "text-slate-600 dark:text-slate-400" },
              { icon: Heart, label: "Saved", color: "text-slate-600 dark:text-slate-400" },
            ].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start h-9 text-sm transition-all duration-200 ${
                  item.active 
                    ? `${item.activeColor} text-blue-700 dark:text-blue-300` 
                    : `hover:bg-slate-100 dark:hover:bg-slate-700 ${item.color}`
                }`}
                onClick={() => {
                  if (item.label === "Bookings") {
                    router.push("/bookings")
                  } else if (!item.active) {
                    // Handle other navigation
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

          {/* New Chat Button */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Chats</h3>
            <Button
              onClick={onNewConversation}
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400 h-8 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 md:p-3">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  currentConversationId === conversation.id
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                onClick={() => {
                  onConversationSelect(conversation.id)
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {conversation.title || 
                   (conversation.messages.length > 0
                     ? conversation.messages[0].content.slice(0, 40) + "..."
                     : "New conversation")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(conversation.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
          <div className="flex items-center space-x-3">
            <Avatar>
              {user?.picture ? (
                <AvatarImage src={user.picture || "/placeholder.svg"} alt={user?.name || "User"} />
              ) : (
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 