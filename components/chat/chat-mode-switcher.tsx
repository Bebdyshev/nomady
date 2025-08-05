"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, Sparkles, Lock, Crown } from "lucide-react";
import { useTranslations } from "@/lib/i18n-client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface ChatModeSwitcherProps {
  currentMode: "search" | "generate";
  onModeChange: (mode: "search" | "generate") => void;
  className?: string;
}

export function ChatModeSwitcher({
  currentMode,
  onModeChange,
  className,
}: ChatModeSwitcherProps) {
  const t = useTranslations('chat');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data, error } = await apiClient.getMe();
        if (data && !error) {
          const userData = data as any; // Type assertion for user data
          console.log('🔍 Subscription status loaded:', userData.subscription_status);
          setSubscriptionStatus(userData.subscription_status);
        } else {
          console.error('❌ Failed to get user info:', error);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  const handleModeChange = (mode: "search" | "generate") => {
    console.log('🔄 Mode change attempt:', mode, 'Subscription status:', subscriptionStatus);
    
    // If subscription status is still loading, prevent mode change
    if (isLoading) {
      console.log('⏳ Subscription status still loading, preventing mode change');
      return;
    }
    
    // Allow mode change - the upgrade dialog will be shown in Chat Page if needed
    console.log('✅ Mode change allowed:', mode);
    onModeChange(mode);
  };

  const modes = [
    {
      id: "search" as const,
      label: t('mode.search'),
      icon: Search,
    },
    {
      id: "generate" as const,
      label: t('mode.generate'),
      icon: Sparkles,
      isPremium: true,
    },
  ];

  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative">
        <div className="inline-flex overflow-hidden rounded-full px-1 border border-border text-xs bg-background">
          {modes.map((mode, index) => (
            <div key={mode.id} className="flex items-center">
              {index > 0 && (
                <div className="h-4 w-px bg-border" aria-hidden="true" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className={`relative rounded-none bg-background px-3 py-1.5 hover:bg-background ${
                  currentMode === mode.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => handleModeChange(mode.id)}
                disabled={isLoading}
              >
                {mode.isPremium && (subscriptionStatus === "inactive" || subscriptionStatus === null || subscriptionStatus === undefined) ? (
                  <Lock className="h-3 w-3 mr-1.5" />
                ) : (
                  <mode.icon className="h-3 w-3 mr-1.5" />
                )}
                {mode.label}
                {mode.isPremium && (subscriptionStatus === "inactive" || subscriptionStatus === null || subscriptionStatus === undefined) && (
                  <Crown className="h-3 w-3 ml-1.5 text-yellow-500" />
                )}
                {currentMode === mode.id && (
                  <motion.div
                    className="absolute inset-x-0 bottom-[1px] mx-auto h-0.5 w-[80%] bg-primary"
                    layoutId="activeMode"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 