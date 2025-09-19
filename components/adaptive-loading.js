"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { usePlatform } from "@/hooks/use-platform"
import { usePerformance } from "@/hooks/use-performance"
import { cn } from "@/lib/utils"

export function AdaptiveLoading({ type = "players", count = 3 }) {
  const { isMobile } = usePlatform()
  const { isLowPowerMode } = usePerformance()

  if (type === "players") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={index}
            className={cn({
              "animate-pulse": !isLowPowerMode,
            })}
          >
            <CardContent
              className={cn("p-4", {
                "p-6": !isMobile,
              })}
            >
              <div
                className={cn("flex items-center justify-between", {
                  "flex-col space-y-4": isMobile,
                  "flex-row": !isMobile,
                })}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton
                    className={cn("h-6", {
                      "w-24": isMobile,
                      "w-32": !isMobile,
                    })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (type === "game-setup") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  )
}
