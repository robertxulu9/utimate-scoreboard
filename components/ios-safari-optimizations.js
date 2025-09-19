"use client"

import { useEffect } from "react"
import { usePlatform } from "@/hooks/use-platform"

export function IOSSafariOptimizations({ children }) {
  const { isMobile, isStandalone } = usePlatform()

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS && isMobile) {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
      }

      // Handle safe area insets for notched devices
      document.documentElement.style.setProperty("--safe-area-inset-top", "env(safe-area-inset-top)")
      document.documentElement.style.setProperty("--safe-area-inset-bottom", "env(safe-area-inset-bottom)")
      document.documentElement.style.setProperty("--safe-area-inset-left", "env(safe-area-inset-left)")
      document.documentElement.style.setProperty("--safe-area-inset-right", "env(safe-area-inset-right)")

      // Prevent elastic scrolling
      document.body.style.overscrollBehavior = "none"

      // Fix 100vh issue on iOS Safari
      const setVH = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty("--vh", `${vh}px`)
      }

      setVH()
      window.addEventListener("resize", setVH)
      window.addEventListener("orientationchange", () => setTimeout(setVH, 100))

      return () => {
        window.removeEventListener("resize", setVH)
        window.removeEventListener("orientationchange", setVH)
      }
    }
  }, [isMobile, isStandalone])

  return children
}
