"use client"

import { useState, useEffect } from "react"

export function usePlatform() {
  const [platform, setPlatform] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    isStandalone: false,
    orientation: "portrait",
  })

  useEffect(() => {
    const checkPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
      const isDesktop = !isMobile && !isTablet
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true

      const orientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape"

      setPlatform({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isStandalone,
        orientation,
      })
    }

    checkPlatform()

    const handleResize = () => checkPlatform()
    const handleOrientationChange = () => setTimeout(checkPlatform, 100)

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  return platform
}
