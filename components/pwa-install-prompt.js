"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"
import { usePWA } from "@/hooks/use-pwa"
import { usePlatform } from "@/hooks/use-platform"
import { cn } from "@/lib/utils"

export function PWAInstallPrompt() {
  const [isDismissed, setIsDismissed] = useState(false)
  const { isInstallable, isInstalled, installApp } = usePWA()
  const { isMobile, isTablet } = usePlatform()

  if (!isInstallable || isInstalled || isDismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsDismissed(true)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  return (
    <Card
      className={cn("border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5", {
        "mx-4 mb-4": isMobile,
        "mb-6": !isMobile,
      })}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isMobile ? <Smartphone className="h-6 w-6 text-primary" /> : <Monitor className="h-6 w-6 text-primary" />}
            <div>
              <CardTitle className="text-lg">Install Ultimate Leaderboard</CardTitle>
              <CardDescription>
                {isMobile
                  ? "Add to your home screen for quick access and offline play"
                  : "Install as a desktop app for the best experience"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Add to Home Screen" : "Install App"}
          </Button>
          <Button variant="outline" onClick={handleDismiss} className="flex-1 sm:flex-none bg-transparent">
            Maybe Later
          </Button>
        </div>

        {isMobile && (
          <div className="mt-3 text-xs text-muted-foreground">
            Works offline • No app store required • Takes up minimal space
          </div>
        )}
      </CardContent>
    </Card>
  )
}
