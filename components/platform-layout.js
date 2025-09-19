"use client"

import { usePlatform } from "../hooks/use-platform"
import { useMemoryManagement } from "../hooks/use-memory-management"
import { cn } from "../lib/utils"

export function PlatformLayout({ children, className }) {
  const { isMobile, isTablet, isDesktop, isStandalone, orientation } = usePlatform()
  const { isLowMemoryDevice } = useMemoryManagement()

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-emerald-50 to-pink-50",
        // Platform-specific layouts
        {
          // Mobile layout - full screen with safe areas
          "pb-safe-area-inset-bottom pt-safe-area-inset-top": isMobile,
          // Standalone app layout (PWA)
          "pt-0": isStandalone && isMobile,
          // Desktop layout - centered with max width
          "container mx-auto px-4": isDesktop,
          // Tablet layout - responsive padding
          "px-6": isTablet,
          // Orientation-specific adjustments
          "px-2": isMobile && orientation === "landscape",
          "bg-background": isLowMemoryDevice,
        },
        className,
      )}
      style={{
        paddingTop: isMobile ? "var(--safe-area-inset-top, 0)" : undefined,
        paddingBottom: isMobile ? "var(--safe-area-inset-bottom, 0)" : undefined,
        paddingLeft: isMobile ? "var(--safe-area-inset-left, 0)" : undefined,
        paddingRight: isMobile ? "var(--safe-area-inset-right, 0)" : undefined,
        minHeight: isMobile ? "calc(var(--vh, 1vh) * 100)" : "100vh",
      }}
    >
      <div
        className={cn("w-full", {
          // Mobile: full width with minimal padding
          "px-2": isMobile,
          // Tablet: moderate padding
          "px-4 max-w-4xl mx-auto": isTablet,
          // Desktop: centered with max width
          "max-w-6xl mx-auto": isDesktop,
        })}
      >
        {children}
      </div>
    </div>
  )
}
