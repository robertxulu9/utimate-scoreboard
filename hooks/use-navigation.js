"use client"

import { useState, useCallback } from "react"
import { usePlatform } from "./use-platform"

export function useNavigation() {
  const [navigationStack, setNavigationStack] = useState([])
  const { isMobile } = usePlatform()

  const navigate = useCallback((route, data = null) => {
    setNavigationStack((prev) => [...prev, { route, data, timestamp: Date.now() }])
  }, [])

  const goBack = useCallback(() => {
    setNavigationStack((prev) => prev.slice(0, -1))
  }, [])

  const resetNavigation = useCallback(() => {
    setNavigationStack([])
  }, [])

  const canGoBack = navigationStack.length > 0

  // Get current route info
  const currentRoute = navigationStack[navigationStack.length - 1]

  // Platform-specific navigation behavior
  const getNavigationStyle = useCallback(() => {
    if (isMobile) {
      return {
        transition: "transform 0.3s ease-in-out",
        backButtonStyle: "fixed top-4 left-4 z-50",
        headerStyle: "sticky top-0 bg-background/95 backdrop-blur-sm border-b",
      }
    }
    return {
      transition: "opacity 0.2s ease-in-out",
      backButtonStyle: "relative",
      headerStyle: "relative",
    }
  }, [isMobile])

  return {
    navigate,
    goBack,
    resetNavigation,
    canGoBack,
    currentRoute,
    navigationStack,
    getNavigationStyle,
  }
}
