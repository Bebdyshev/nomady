"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MainLayoutProps {
  children: React.ReactNode
  header: React.ReactNode
}

export function MainLayout({ children, header }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between h-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1 mx-4">
                {header}
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden md:block sticky top-0 z-30">
          {header}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 