"use client"

import { useState, useEffect } from "react"
import { usePlatform } from "./use-platform"

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasVibration: false,
    hasDeviceMemory: false,
    hasNetworkInfo: false,
    hasBattery: false,
    memoryGB: 0,
    cores: 0,
    maxTouchPoints: 0,
  })

  const { isMobile } = usePlatform()

  useEffect(() => {
    const detectCapabilities = async () => {
      const newCapabilities = {
        // Vibration API support
        hasVibration: "vibrate" in navigator,

        // Device memory (Chrome only)
        hasDeviceMemory: "deviceMemory" in navigator,
        memoryGB: navigator.deviceMemory || 0,

        // Network Information API
        hasNetworkInfo: "connection" in navigator,

        // Battery API (deprecated but still useful)
        hasBattery: "getBattery" in navigator,

        // Hardware concurrency
        cores: navigator.hardwareConcurrency || 1,

        // Touch capabilities
        maxTouchPoints: navigator.maxTouchPoints || 0,
      }

      setCapabilities(newCapabilities)
    }

    detectCapabilities()
  }, [])

  const triggerHapticFeedback = (type = "light") => {
    if (!capabilities.hasVibration || !isMobile) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
      success: [10, 50, 10],
      error: [100, 50, 100],
    }

    navigator.vibrate(patterns[type] || patterns.light)
  }

  return {
    ...capabilities,
    triggerHapticFeedback,
  }
}
