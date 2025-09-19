"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDeviceCapabilities } from "@/hooks/use-device-capabilities"
import { useMemoryManagement } from "@/hooks/use-memory-management"
import { usePlatform } from "@/hooks/use-platform"

export function PerformanceMonitor({ showDetails = false }) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    connectionSpeed: "unknown",
  })

  const { memoryGB, cores, hasNetworkInfo } = useDeviceCapabilities()
  const { getMemoryPressure } = useMemoryManagement()
  const { isMobile } = usePlatform()

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId

    const measurePerformance = () => {
      const currentTime = performance.now()
      frameCount++

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))

        // Get memory usage if available
        const memoryInfo = performance.memory
        const memoryUsage = memoryInfo ? Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100) : 0

        // Get connection info
        const connection = navigator.connection
        const connectionSpeed = connection?.effectiveType || "unknown"

        setMetrics({
          fps,
          memoryUsage,
          renderTime: currentTime - lastTime,
          connectionSpeed,
        })

        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    if (showDetails) {
      measurePerformance()
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [showDetails])

  if (!showDetails) return null

  const memoryPressure = getMemoryPressure()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Performance Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">FPS:</span>
            <Badge variant={metrics.fps >= 50 ? "default" : metrics.fps >= 30 ? "secondary" : "destructive"}>
              {metrics.fps}
            </Badge>
          </div>

          <div>
            <span className="text-muted-foreground">Memory:</span>
            <Badge
              variant={memoryPressure === "low" ? "default" : memoryPressure === "medium" ? "secondary" : "destructive"}
            >
              {metrics.memoryUsage}%
            </Badge>
          </div>

          <div>
            <span className="text-muted-foreground">Device RAM:</span>
            <span className="font-mono">{memoryGB || "?"}GB</span>
          </div>

          <div>
            <span className="text-muted-foreground">CPU Cores:</span>
            <span className="font-mono">{cores}</span>
          </div>

          {hasNetworkInfo && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Connection:</span>
              <Badge variant="outline">{metrics.connectionSpeed}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
