"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, RotateCcw } from "lucide-react"
import confetti from "canvas-confetti"

export default function Scoreboard({ players, setPlayers, onBack, mode = "normal", modeSettings = {}, gameName = "Game" }) {
  const [sortedPlayers, setSortedPlayers] = useState([])
  const [isPortrait, setIsPortrait] = useState(false)
  const [movementById, setMovementById] = useState({}) // { [id]: 'up' | 'down' | 'none' }
  const prevIndexRef = useRef(new Map())
  const [timeLeft, setTimeLeft] = useState(() => {
    if (mode === "timed") {
      const mins = Number(modeSettings.totalMinutes || 5)
      return Math.max(1, mins) * 60
    }
    return null
  })
  const [winnerId, setWinnerId] = useState(null)
  const [hasSavedEnd, setHasSavedEnd] = useState(false)

  useEffect(() => {
    // Sort players by score (highest first)
    const sorted = [...players].sort((a, b) => b.score - a.score)

    // Detect rank movement
    const newMovement = {}
    sorted.forEach((p, index) => {
      const prevIndex = prevIndexRef.current.get(p.id)
      if (prevIndex === undefined) {
        newMovement[p.id] = "none"
      } else if (index < prevIndex) {
        newMovement[p.id] = "up"
      } else if (index > prevIndex) {
        newMovement[p.id] = "down"
      } else {
        newMovement[p.id] = "none"
      }
    })

    setSortedPlayers(sorted)
    setMovementById(newMovement)

    // Update previous indices for next diff
    const nextMap = new Map()
    sorted.forEach((p, index) => nextMap.set(p.id, index))
    prevIndexRef.current = nextMap

    // Clear highlight after a short delay
    const clearTimer = setTimeout(() => {
      setMovementById((curr) => {
        const cleared = { ...curr }
        Object.keys(cleared).forEach((k) => (cleared[k] = "none"))
        return cleared
      })
    }, 800)
    return () => clearTimeout(clearTimer)
  }, [players])

  // Timed mode countdown
  useEffect(() => {
    if (mode !== "timed") return
    if (timeLeft === null) return
    if (timeLeft <= 0) return
    const tick = setInterval(() => setTimeLeft((s) => (s && s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(tick)
  }, [mode, timeLeft])

  // Target score detection
  useEffect(() => {
    if (mode !== "target-score") return
    const target = Number(modeSettings.target || 10)
    const winner = players.find((p) => (p.score || 0) >= target)
    if (winner) setWinnerId(winner.id)
  }, [players, mode, modeSettings])

  // For normal/timed/target, when finished (timer 0 or winner), call optional onComplete via onBack? We'll emit a custom event.
  useEffect(() => {
    if (hasSavedEnd) return
    const endByTimer = mode === "timed" && timeLeft === 0
    const endByTarget = mode === "target-score" && !!winnerId
    if (!endByTimer && !endByTarget) return

    try {
      const finalData = {
        name: gameName || "Game",
        type: mode === "timed" ? "timed" : mode === "target-score" ? "target-score" : "normal",
        players,
        finalGameTime: mode === "timed" ? (modeSettings.totalMinutes || 5) * 60 : undefined,
      }
      const event = new CustomEvent("scoreboard-finished", { detail: finalData })
      window.dispatchEvent(event)
      setHasSavedEnd(true)
    } catch {}
  }, [mode, timeLeft, winnerId, players, modeSettings, hasSavedEnd])

  // Orientation detection for responsive layouts
  useEffect(() => {
    const checkOrientation = () => setIsPortrait(window.innerHeight >= window.innerWidth)
    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)
    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  const updateScore = (playerId, change) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === playerId) {
          const newScore = Math.max(0, player.score + change)

          // Trigger confetti at 10 points
          if (newScore === 10 && player.score < 10) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: [player.color],
            })
          }

          return { ...player, score: newScore }
        }
        return player
      }),
    )
  }

  const resetScores = () => {
    setPlayers((prevPlayers) => prevPlayers.map((player) => ({ ...player, score: 0 })))
  }

  const getRankIcon = (index) => {
    if (index === 0) return "🥇"
    if (index === 1) return "🥈"
    if (index === 2) return "🥉"
    return `#${index + 1}`
  }

  // Two-player full-screen split layout
  if (players.length === 2) {
    const [leftPlayer, rightPlayer] = players

    return (
      <div className="h-screen w-screen relative">
        {/* Global Controls */}
        <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <Button variant="outline" onClick={resetScores}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Timed mode overlay */}
        {mode === "timed" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-black/40 text-white font-mono">
            {timeLeft !== null ? `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}` : "--:--"}
          </div>
        )}

        <div className={`flex h-full ${isPortrait ? "flex-col" : "flex-row"}`}>
          {/* Left Player */}
          <div
            className="flex-1 flex flex-col items-center justify-center text-white relative"
            style={{ backgroundColor: leftPlayer.color || "#60a5fa" }}
          >
            {/* Name + Score occupy 40% of card */}
            <div className="flex flex-col items-center justify-center" style={{ height: "40%" }}>
              <div
                className="mb-2 font-extrabold tracking-wide drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-100 to-white"
                style={{
                  fontSize: `clamp(20px, ${isPortrait ? "6vh" : "6vw"}, 64px)`,
                  lineHeight: 1,
                }}
              >
                {leftPlayer.name}
              </div>
              <div
                className="font-extrabold select-none leading-none"
                style={{
                  fontSize: `clamp(48px, ${isPortrait ? "18vh" : "18vw"}, 220px)`,
                }}
              >
                {leftPlayer.score}
              </div>
            </div>

            <div className="absolute bottom-10 flex gap-4">
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => updateScore(leftPlayer.id, -1)}
              >
                -1
              </Button>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateScore(leftPlayer.id, 1)}
              >
                +1
              </Button>
            </div>
          </div>

          {/* Right Player */}
          <div
            className="flex-1 flex flex-col items-center justify-center text-white relative"
            style={{ backgroundColor: rightPlayer.color || "#ef4444" }}
          >
            <div className="flex flex-col items-center justify-center" style={{ height: "40%" }}>
              <div
                className="mb-2 font-extrabold tracking-wide drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-100 to-white"
                style={{
                  fontSize: `clamp(20px, ${isPortrait ? "6vh" : "6vw"}, 64px)`,
                  lineHeight: 1,
                }}
              >
                {rightPlayer.name}
              </div>
              <div
                className="font-extrabold select-none leading-none"
                style={{
                  fontSize: `clamp(48px, ${isPortrait ? "18vh" : "18vw"}, 220px)`,
                }}
              >
                {rightPlayer.score}
              </div>
            </div>

            <div className="absolute bottom-10 flex gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateScore(rightPlayer.id, 1)}
              >
                +1
              </Button>
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => updateScore(rightPlayer.id, -1)}
              >
                -1
              </Button>
            </div>
          </div>
        </div>

        {/* Target victory overlay */}
        {mode === "target-score" && winnerId && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-6 text-center max-w-sm">
              <div className="text-2xl font-bold mb-2">Victory!</div>
              <div className="text-lg mb-4">{players.find((p) => p.id === winnerId)?.name} reached the target</div>
              <Button onClick={() => setWinnerId(null)}>Close</Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Scoreboard</h1>
          </div>
          <Button variant="outline" onClick={resetScores}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Fluid two-row layout for any player count (>=3): top floor(N/2), bottom remainder) */}
        <div className="flex flex-col gap-4" style={{ height: `calc(100vh - 88px)` }}>
          {(() => {
            const topCount = Math.floor(sortedPlayers.length / 2)
            const topPlayers = sortedPlayers.slice(0, topCount)
            const bottomPlayers = sortedPlayers.slice(topCount)

            const renderPlayerCard = (player) => {
              const movement = movementById[player.id] || "none"
              const glowColor = movement === "up" ? "rgba(5,150,105,0.6)" : movement === "down" ? "rgba(239,68,68,0.6)" : "transparent"
              const translateY = movement === "up" ? "-6px" : movement === "down" ? "6px" : "0px"

              return (
                <Card key={player.id} className="h-full overflow-hidden">
                  <CardContent className="p-0 h-full">
                    <div
                      className="relative flex h-full items-center justify-center text-white transition-transform"
                      style={{
                        backgroundColor: player.color || "#1f2937",
                        boxShadow: glowColor !== "transparent" ? `0 0 0 4px ${glowColor}, 0 0 24px ${glowColor}` : undefined,
                        transform: `translateY(${translateY})`,
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                        borderRadius: 8,
                      }}
                    >
                    <div className="flex flex-col items-center justify-center" style={{ height: "40%" }}>
                      <div
                        className="mb-2 font-extrabold tracking-wide drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-100 to-white"
                        style={{
                          fontSize: `clamp(16px, ${isPortrait ? "5vh" : "3vw"}, 40px)`,
                          lineHeight: 1,
                        }}
                      >
                        {player.name}
                      </div>
                      <div
                        className="font-extrabold select-none leading-none"
                        style={{
                          fontSize: `clamp(36px, ${isPortrait ? "14vh" : "9vw"}, 160px)`,
                        }}
                      >
                        {player.score}
                      </div>
                    </div>

                    <div className="absolute bottom-4 flex gap-3">
                      <Button
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => updateScore(player.id, -1)}
                      >
                        -1
                      </Button>
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateScore(player.id, 1)}
                      >
                        +1
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            return (
              <>
                <div
                  className="grid gap-4"
                  style={{
                    flex: 1,
                    gridTemplateColumns: `repeat(${Math.max(1, topPlayers.length)}, minmax(0, 1fr))`,
                  }}
                >
                  {topPlayers.map(renderPlayerCard)}
                </div>

                <div
                  className="grid gap-4"
                  style={{
                    flex: 1,
                    gridTemplateColumns: `repeat(${Math.max(1, bottomPlayers.length)}, minmax(0, 1fr))`,
                  }}
                >
                  {bottomPlayers.map(renderPlayerCard)}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
