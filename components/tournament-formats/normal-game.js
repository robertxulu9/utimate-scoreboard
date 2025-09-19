"use client"

import { Button } from "@/components/ui/button"
import { OptimizedPlayerList } from "@/components/optimized-player-list"
import { usePerformance } from "@/hooks/use-performance"
import { usePlatform } from "@/hooks/use-platform"
import { cn } from "@/lib/utils"
import { useCallback } from "react"

export default function NormalGame({ players, setPlayers, triggerConfetti }) {
  const { isMobile } = usePlatform()
  const { scoreUpdateDelay, confettiCount } = usePerformance()

  const updateScore = useCallback(
    (playerId, change) => {
      const updateFn = () => {
        setPlayers((prev) =>
          prev.map((player) => {
            if (player.id === playerId) {
              const newScore = Math.max(0, player.score + change)
              // Trigger confetti for significant score increases
              if (change > 0 && newScore > player.score) {
                triggerConfetti()
              }
              return { ...player, score: newScore }
            }
            return player
          }),
        )
      }

      if (scoreUpdateDelay > 0) {
        setTimeout(updateFn, scoreUpdateDelay)
      } else {
        updateFn()
      }
    },
    [setPlayers, triggerConfetti, scoreUpdateDelay],
  )

  const setScore = useCallback(
    (playerId, newScore) => {
      const score = Number.parseInt(newScore) || 0
      setPlayers((prev) => prev.map((player) => (player.id === playerId ? { ...player, score } : player)))
    },
    [setPlayers],
  )

  const resetScores = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })))
  }, [setPlayers])

  const celebrateOptimized = useCallback(() => {
    // Use optimized confetti count based on device performance
    for (let i = 0; i < Math.ceil(confettiCount / 10); i++) {
      setTimeout(() => triggerConfetti(), i * 100)
    }
  }, [triggerConfetti, confettiCount])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className={cn("font-bold", {
            "text-xl": isMobile,
            "text-2xl": !isMobile,
          })}
        >
          Live Scoreboard
        </h2>
        <div className="text-sm text-muted-foreground">{players.length} players</div>
      </div>

      <OptimizedPlayerList
        players={players}
        onScoreUpdate={updateScore}
        onScoreSet={setScore}
        showRanking={true}
        enableScoreInput={true}
      />

      <div
        className={cn("flex gap-4 pt-4 border-t", {
          "flex-col": isMobile,
          "flex-row justify-center": !isMobile,
        })}
      >
        <Button
          onClick={celebrateOptimized}
          variant="outline"
          className={cn("bg-transparent", {
            "w-full": isMobile,
          })}
        >
          🎉 Celebrate!
        </Button>
        <Button
          onClick={resetScores}
          variant="destructive"
          className={cn({
            "w-full": isMobile,
          })}
        >
          Reset Scores
        </Button>
      </div>
    </div>
  )
}
