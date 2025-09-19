"use client"

import { useEffect, useRef } from "react"
import { usePlatform } from "@/hooks/use-platform"

export function PlatformGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  className,
}) {
  const { isMobile, isTablet } = usePlatform()
  const elementRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const touchEndRef = useRef({ x: 0, y: 0, time: 0 })

  useEffect(() => {
    if (!isMobile && !isTablet) return

    const element = elementRef.current
    if (!element) return

    let initialDistance = 0
    let currentScale = 1

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Handle pinch gesture start
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      }
    }

    const handleTouchMove = (e) => {
      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch && initialDistance > 0) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

        const scale = currentDistance / initialDistance
        if (Math.abs(scale - currentScale) > 0.1) {
          currentScale = scale
          onPinch(scale)
        }
      }
    }

    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 0) return

      const touch = e.changedTouches[0]
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      const deltaX = touchEndRef.current.x - touchStartRef.current.x
      const deltaY = touchEndRef.current.y - touchStartRef.current.y
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time

      // Only process swipes that are fast enough and long enough
      if (deltaTime > 500 || (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50)) {
        return
      }

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }

      // Reset pinch state
      initialDistance = 0
      currentScale = 1
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: true })
    element.addEventListener("touchmove", handleTouchMove, { passive: true })
    element.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, isTablet, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
