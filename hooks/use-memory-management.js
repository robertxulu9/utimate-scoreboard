"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDeviceCapabilities } from "./use-device-capabilities"

export function useMemoryManagement() {
  const { memoryGB, cores } = useDeviceCapabilities()
  const observersRef = useRef(new Set())
  const timersRef = useRef(new Set())

  const addObserver = useCallback((observer) => {
    observersRef.current.add(observer)
    return () => {
      observer.disconnect?.()
      observersRef.current.delete(observer)
    }
  }, [])

  const addTimer = useCallback((timerId) => {
    timersRef.current.add(timerId)
    return () => {
      clearTimeout(timerId)
      clearInterval(timerId)
      timersRef.current.delete(timerId)
    }
  }, [])

  const getMemoryPressure = useCallback(() => {
    if (memoryGB <= 2) return "high"
    if (memoryGB <= 4) return "medium"
    return "low"
  }, [memoryGB])

  const performGarbageCollection = useCallback(() => {
    // Force garbage collection if available (Chrome DevTools)
    if (window.gc && typeof window.gc === "function") {
      window.gc()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all observers
      observersRef.current.forEach((observer) => {
        observer.disconnect?.()
      })
      observersRef.current.clear()

      // Clean up all timers
      timersRef.current.forEach((timerId) => {
        clearTimeout(timerId)
        clearInterval(timerId)
      })
      timersRef.current.clear()
    }
  }, [])

  return {
    addObserver,
    addTimer,
    getMemoryPressure,
    performGarbageCollection,
    isLowMemoryDevice: memoryGB > 0 && memoryGB <= 2,
    cores,
  }
}
