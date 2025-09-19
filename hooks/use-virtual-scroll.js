"use client"

import { useState, useMemo } from "react"

export function useVirtualScroll(items, itemHeight = 80, containerHeight = 400) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)

  const visibleItems = useMemo(() => {
    if (!items.length) return { startIndex: 0, endIndex: 0, items: [] }

    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, items.length)

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        virtualIndex: startIndex + index,
      })),
    }
  }, [items, scrollTop, itemHeight, containerHeight])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleItems.startIndex * itemHeight

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }

  return {
    containerRef: setContainerRef,
    visibleItems: visibleItems.items,
    totalHeight,
    offsetY,
    handleScroll,
    isVirtualized: items.length > 20,
  }
}
