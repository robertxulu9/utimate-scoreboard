"use client"

import { useEffect } from "react"
import { usePlatform } from "@/hooks/use-platform"

export function KeyboardShortcuts({ onNewGame, onResetScores, onToggleFullscreen, onExportData, onImportData }) {
  const { isDesktop } = usePlatform()

  useEffect(() => {
    if (!isDesktop) return

    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault()
            onNewGame?.()
            break
          case "r":
            e.preventDefault()
            onResetScores?.()
            break
          case "f":
            e.preventDefault()
            onToggleFullscreen?.()
            break
          case "e":
            e.preventDefault()
            onExportData?.()
            break
          case "i":
            e.preventDefault()
            onImportData?.()
            break
        }
      }

      // Function keys
      switch (e.key) {
        case "F11":
          e.preventDefault()
          onToggleFullscreen?.()
          break
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen()
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isDesktop, onNewGame, onResetScores, onToggleFullscreen, onExportData, onImportData])

  return null
}
