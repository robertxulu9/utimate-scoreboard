"use client"

import { useState, useEffect, useCallback } from "react"
import { usePlatform } from "./use-platform"

export function usePerformance() {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [connectionType, setConnectionType] = useState("unknown")
  const { isMobile } = usePlatform()

  useEffect(() => {
    // Detect low power mode and connection type
    const detectPerformanceConstraints = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      // Check connection type if available
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || "unknown")

        // Enable low power mode for slow connections or mobile
        const isSlowConnection = ["slow-2g", "2g", "3g"].includes(connection.effectiveType)
        setIsLowPowerMode(prefersReducedMotion || isSlowConnection || (isMobile && connection.saveData))
      } else {
        setIsLowPowerMode(prefersReducedMotion || isMobile)
      }
    }

    detectPerformanceConstraints()

    // Listen for connection changes
    const connection = navigator.connection
    if (connection) {
      connection.addEventListener("change", detectPerformanceConstraints)
      return () => connection.removeEventListener("change", detectPerformanceConstraints)
    }
  }, [isMobile])

  const getOptimizedSettings = useCallback(() => {
    return {
      // Reduce animations for low power mode
      enableAnimations: !isLowPowerMode,
      // Reduce confetti particles on mobile/low power
      confettiCount: isLowPowerMode ? 20 : isMobile ? 30 : 50,
      // Debounce score updates on slow connections
      scoreUpdateDelay: connectionType === "slow-2g" || connectionType === "2g" ? 300 : 0,
      // Reduce auto-save frequency on mobile
      autoSaveInterval: isMobile ? 10000 : 5000,
      // Enable virtual scrolling for large player lists
      enableVirtualScrolling: isMobile,
      virtualScrollThreshold: 20,
    }
  }, [isLowPowerMode, connectionType, isMobile])

  return {
    isLowPowerMode,
    connectionType,
    ...getOptimizedSettings(),
  }
}
