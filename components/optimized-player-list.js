"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Trophy } from "lucide-react"
import { usePlatform } from "@/hooks/use-platform"
import { usePerformance } from "@/hooks/use-performance"
import { useVirtualScroll } from "@/hooks/use-virtual-scroll"
import { cn } from "@/lib/utils"

export function OptimizedPlayerList({
  players,
  onScoreUpdate,
  onScoreSet,
  showRanking = true,
  enableScoreInput = true,
}) {
  const { isMobile, isTablet } = usePlatform()
  const { enableAnimations, enableVirtualScrolling, virtualScrollThreshold } = usePerformance()

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const shouldVirtualize = enableVirtualScrolling && sortedPlayers.length > virtualScrollThreshold

  const { visibleItems, totalHeight, offsetY, handleScroll, isVirtualized } = useVirtualScroll(
    sortedPlayers,
    isMobile ? 100 : 120,
    400,
  )

  const renderPlayer = (player, index, virtualIndex = null) => {
    const actualIndex = virtualIndex !== null ? virtualIndex : index
    const isLeader = showRanking && actualIndex === 0

    return (
      <Card
        key={player.id}
        className={cn("transition-all duration-300", {
          "ring-2 ring-primary": isLeader && enableAnimations,
          "ring-1 ring-primary/50": isLeader && !enableAnimations,
        })}
        style={
          virtualIndex !== null
            ? {
                position: "absolute",
                top: virtualIndex * (isMobile ? 100 : 120),
                left: 0,
                right: 0,
              }
            : undefined
        }
      >
        <CardContent
          className={cn("p-4", {
            "p-6": !isMobile,
          })}
        >
          <div
            className={cn("flex items-center justify-between", {
              "flex-col space-y-4": isMobile && sortedPlayers.length > 6,
              "flex-row": !isMobile || sortedPlayers.length <= 6,
            })}
          >
            {/* Player Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {showRanking && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isLeader && <Trophy className="h-4 w-4 text-primary" />}
                  <span
                    className={cn("font-bold text-muted-foreground", {
                      "text-lg": isMobile,
                      "text-2xl": !isMobile,
                    })}
                  >
                    #{actualIndex + 1}
                  </span>
                </div>
              )}
              <div
                className={cn("text-2xl flex-shrink-0", {
                  "text-xl": isMobile,
                })}
              >
                {player.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className={cn("font-semibold truncate", {
                    "text-lg": isMobile,
                    "text-xl": !isMobile,
                  })}
                >
                  {player.name}
                </h3>
              </div>
            </div>

            {/* Score Controls */}
            <div
              className={cn("flex items-center gap-3", {
                "w-full justify-between": isMobile && sortedPlayers.length > 6,
                "": !isMobile || sortedPlayers.length <= 6,
              })}
            >
              {/* Score Display */}
              <div className="text-right flex-shrink-0">
                <div
                  className={cn("font-bold score-update", {
                    "text-2xl": isMobile,
                    "text-3xl": !isMobile,
                  })}
                >
                  {player.score}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>

              {/* Score Buttons */}
              <div
                className={cn("flex gap-2", {
                  "flex-col": isMobile && !isTablet,
                  "flex-row": !isMobile || isTablet,
                })}
              >
                <Button
                  size={isMobile ? "sm" : "default"}
                  onClick={() => onScoreUpdate(player.id, 1)}
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size={isMobile ? "sm" : "default"}
                  variant="outline"
                  onClick={() => onScoreUpdate(player.id, -1)}
                  className="flex-shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              {/* Score Input */}
              {enableScoreInput && (
                <Input
                  type="number"
                  value={player.score}
                  onChange={(e) => onScoreSet(player.id, e.target.value)}
                  className={cn("text-center flex-shrink-0", {
                    "w-16 text-sm": isMobile,
                    "w-20": !isMobile,
                  })}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (shouldVirtualize && isVirtualized) {
    return (
      <div className="relative overflow-auto" style={{ height: 400 }} onScroll={handleScroll}>
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((player, index) => renderPlayer(player, index, player.virtualIndex))}
          </div>
        </div>
      </div>
    )
  }

  return <div className="space-y-4">{sortedPlayers.map((player, index) => renderPlayer(player, index))}</div>
}
