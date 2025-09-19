"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Timer, Dice6, Shuffle, Save } from "lucide-react"
import { CrossPlatformHeader } from "@/components/cross-platform-header"
import { PlatformGestureHandler } from "@/components/platform-gesture-handler"
import { AdaptiveLoading } from "@/components/adaptive-loading"
import { usePlatform } from "@/hooks/use-platform"
import { useDeviceCapabilities } from "@/hooks/use-device-capabilities"
import { usePerformance } from "@/hooks/use-performance"
import { useMemoryManagement } from "@/hooks/use-memory-management"
import { cn } from "@/lib/utils"
import NormalGame from "@/components/tournament-formats/normal-game"
import LeagueGame from "@/components/tournament-formats/league-game"
import KnockoutGame from "@/components/tournament-formats/knockout-game"

export default function ActiveGame({ gameData, onBack, onGameComplete }) {
  const [players, setPlayers] = useState(gameData.players)
  const [gameTime, setGameTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [matches, setMatches] = useState([])
  const [currentRound, setCurrentRound] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile } = usePlatform()
  const { triggerHapticFeedback } = useDeviceCapabilities()
  const { confettiCount, enableAnimations, autoSaveInterval } = usePerformance()
  const { addTimer } = useMemoryManagement()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return addTimer(timer)
  }, [addTimer])

  // Timer effect
  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    if (!isTimerRunning) return

    const autoSave = setInterval(() => {
      const gameState = {
        ...gameData,
        players,
        matches,
        currentRound,
        gameTime,
        lastSaved: new Date().toISOString(),
      }
      localStorage.setItem("currentGameState", JSON.stringify(gameState))
    }, autoSaveInterval)

    return addTimer(autoSave)
  }, [gameData, players, matches, currentRound, gameTime, isTimerRunning, autoSaveInterval, addTimer])

  const triggerConfetti = () => {
    if (!enableAnimations) {
      triggerHapticFeedback("success")
      return
    }

    const newConfetti = Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: ["#059669", "#10b981", "#ec4899", "#be123c"][Math.floor(Math.random() * 4)],
    }))
    setConfetti(newConfetti)
    triggerHapticFeedback("light")

    const cleanup = setTimeout(() => setConfetti([]), 3000)
    addTimer(cleanup)
  }

  const rollDice = () => {
    const result = Math.floor(Math.random() * 6) + 1
    triggerHapticFeedback("medium")
    alert(`🎲 Dice Roll: ${result}`)
  }

  const shuffleCards = () => {
    triggerHapticFeedback("light")
    alert("🃏 Cards shuffled! Ready to deal.")
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSaveGame = () => {
    triggerHapticFeedback("success")
    const finalGameData = {
      ...gameData,
      players,
      matches,
      currentRound,
      finalGameTime: gameTime,
      isCompleted: true,
    }

    // Clear auto-save state
    localStorage.removeItem("currentGameState")

    if (onGameComplete) {
      onGameComplete(finalGameData)
    }
  }

  const handleSwipeLeft = () => {
    if (isMobile && currentRound > 1) {
      setCurrentRound((prev) => prev - 1)
      triggerHapticFeedback("light")
    }
  }

  const handleSwipeRight = () => {
    if (isMobile) {
      setCurrentRound((prev) => prev + 1)
      triggerHapticFeedback("light")
    }
  }

  const headerActions = [
    {
      icon: Timer,
      label: formatTime(gameTime),
      onClick: () => {
        setIsTimerRunning(!isTimerRunning)
        triggerHapticFeedback("light")
      },
      variant: isTimerRunning ? "default" : "outline",
      showTextOnMobile: true,
      className: "font-mono",
    },
    {
      icon: Save,
      label: "Save",
      onClick: handleSaveGame,
      variant: "default",
    },
  ]

  if (isLoading) {
    return (
      <div className={cn("min-h-screen", { "pb-safe-area-inset-bottom": isMobile })}>
        <CrossPlatformHeader title="Loading Game..." onBack={onBack} canGoBack={true} />
        <div className="px-4 py-6">
          <AdaptiveLoading type="game-setup" count={1} />
        </div>
      </div>
    )
  }

  const renderTournamentFormat = () => {
    const commonProps = {
      players,
      setPlayers,
      triggerConfetti,
      gameData,
    }

    switch (gameData.type) {
      case "league":
        return (
          <LeagueGame
            {...commonProps}
            matches={matches}
            setMatches={setMatches}
            currentRound={currentRound}
            setCurrentRound={setCurrentRound}
          />
        )
      case "knockout":
        return (
          <KnockoutGame
            {...commonProps}
            matches={matches}
            setMatches={setMatches}
            currentRound={currentRound}
            setCurrentRound={setCurrentRound}
          />
        )
      default:
        return <NormalGame {...commonProps} />
    }
  }

  return (
    <PlatformGestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className={cn("min-h-screen", {
        "pb-safe-area-inset-bottom": isMobile,
      })}
    >
      {enableAnimations &&
        confetti.map((piece) => (
          <div
            key={piece.id}
            className="confetti"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}

      <CrossPlatformHeader
        title={gameData.name}
        subtitle={`${gameData.type} format`}
        onBack={onBack}
        canGoBack={true}
        actions={headerActions}
      />

      <div
        className={cn("px-4", {
          "max-w-4xl mx-auto": !isMobile,
        })}
      >
        {isMobile && gameData.type !== "normal" && (
          <div className="text-center text-sm text-muted-foreground mb-4">Swipe left/right to navigate rounds</div>
        )}

        {/* Game Tools */}
        <div
          className={cn("flex gap-2 mb-6", {
            "flex-wrap": isMobile,
          })}
        >
          <Button variant="outline" onClick={rollDice} size={isMobile ? "sm" : "default"}>
            <Dice6 className="h-4 w-4 mr-2" />
            Roll Dice
          </Button>
          <Button variant="outline" onClick={shuffleCards} size={isMobile ? "sm" : "default"}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle Cards
          </Button>
        </div>

        {renderTournamentFormat()}
      </div>
    </PlatformGestureHandler>
  )
}
