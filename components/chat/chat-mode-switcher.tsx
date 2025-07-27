"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useTranslations } from "@/lib/i18n-client";

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
                onClick={() => onModeChange(mode.id)}
              >
                <mode.icon className="h-3 w-3 mr-1.5" />
                {mode.label}
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