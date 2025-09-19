"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"
import { usePWA } from "@/hooks/use-pwa"
import { usePlatform } from "@/hooks/use-platform"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const { isOnline } = usePWA()
  const { isMobile } = usePlatform()

  if (isOnline) return null

  return (
    <Alert
      className={cn("border-orange-200 bg-orange-50 text-orange-800", {
        "mx-4 mb-4": isMobile,
        "mb-6": !isMobile,
      })}
    >
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You're offline. Your game data is saved locally and will sync when you reconnect.
      </AlertDescription>
    </Alert>
  )
}
