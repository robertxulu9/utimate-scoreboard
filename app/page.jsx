"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Play, Settings } from "lucide-react"
import CategorySelection from "@/components/category-selection"
import GameModeSelection from "@/components/game-mode-selection"
import PlayerSetup from "@/components/player-setup"
import ActiveGame from "@/components/active-game"
import GameHistory from "@/components/game-history"
import GameSummary from "@/components/game-summary"
import Scoreboard from "@/components/scoreboard"

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState("home")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedGameMode, setSelectedGameMode] = useState("")
  const [players, setPlayers] = useState([])
  const [modeSettings, setModeSettings] = useState({})
  const [gameHistory, setGameHistory] = useState([])
  const [activeGameData, setActiveGameData] = useState(null)

  const handleStartNewGame = () => {
    setCurrentScreen("category")
  }

  // Persist history
  useEffect(() => {
    const raw = localStorage.getItem("gameHistory")
    if (raw) {
      try {
        setGameHistory(JSON.parse(raw))
      } catch {}
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("gameHistory", JSON.stringify(gameHistory))
    } catch {}
  }, [gameHistory])

  // Listen for scoreboard-finished events to save Normal/Timed/Target games
  useEffect(() => {
    const handler = (e) => {
      const finalData = e.detail
      setGameHistory((h) => [
        ...h,
        {
          id: Date.now(),
          ...finalData,
          endTime: new Date().toISOString(),
          duration: finalData.finalGameTime ? finalData.finalGameTime * 1000 : 0,
        },
      ])
      setActiveGameData(finalData)
      setCurrentScreen("summary")
    }
    window.addEventListener("scoreboard-finished", handler)
    return () => window.removeEventListener("scoreboard-finished", handler)
  }, [])

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setCurrentScreen("gameMode")
  }

  const handleGameModeSelect = (gameMode) => {
    setSelectedGameMode(gameMode)
    setCurrentScreen("playerSetup")
  }

  const handlePlayersSetup = (playerList) => {
    setPlayers(playerList)
    // If the mode requires settings, show a quick settings step
    if (selectedGameMode === "timed" || selectedGameMode === "target-score") {
      setCurrentScreen("modeSettings")
    } else {
      setCurrentScreen("scoreboard")
    }
  }

  const handleBackToHome = () => {
    setCurrentScreen("home")
    setSelectedCategory("")
    setSelectedGameMode("")
    setPlayers([])
    setModeSettings({})
    setActiveGameData(null)
  }

  const handleBack = () => {
    switch (currentScreen) {
      case "category":
        setCurrentScreen("home")
        break
      case "gameMode":
        setCurrentScreen("category")
        break
      case "playerSetup":
        setCurrentScreen("gameMode")
        break
      case "modeSettings":
        setCurrentScreen("playerSetup")
        break
      case "scoreboard":
        setCurrentScreen("playerSetup")
        break
    }
  }

  if (currentScreen === "category") {
    return <CategorySelection onSelect={handleCategorySelect} onBack={handleBack} />
  }

  if (currentScreen === "gameMode") {
    return <GameModeSelection category={selectedCategory} onSelect={handleGameModeSelect} onBack={handleBack} />
  }

  if (currentScreen === "playerSetup") {
    return <PlayerSetup onSetup={handlePlayersSetup} onBack={handleBack} />
  }

  if (currentScreen === "modeSettings") {
    // shadcn-based settings
    const isTimed = selectedGameMode === "timed"
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600" onClick={handleBack}>&larr; Back</button>
            <h2 className="text-2xl font-bold">{isTimed ? "Timed Settings" : "Target Settings"}</h2>
          </div>
          <div className="bg-white rounded-lg p-6 shadow border space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isTimed ? "Total Time (minutes)" : "Target Score"}
              </label>
              <input
                type="number"
                min="1"
                defaultValue={isTimed ? modeSettings.totalMinutes || 5 : modeSettings.target || 10}
                onChange={(e) =>
                  setModeSettings((s) =>
                    isTimed
                      ? { ...s, totalMinutes: Math.max(1, Number(e.target.value || 5)) }
                      : { ...s, target: Math.max(1, Number(e.target.value || 10)) },
                  )
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 border rounded" onClick={handleBack}>Back</button>
              <button
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => setCurrentScreen("scoreboard")}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "scoreboard") {
    // League and Tournament should use ActiveGame container
    if (selectedGameMode === "league" || selectedGameMode === "tournament") {
      const gameData = activeGameData || {
        name: "Tournament",
        type: selectedGameMode === "league" ? "league" : "knockout",
        players,
        startTime: new Date().toISOString(),
      }
      return (
        <ActiveGame
          gameData={gameData}
          onBack={handleBack}
          onGameComplete={(finalData) => {
            setGameHistory((h) => [
              ...h,
              {
                id: Date.now(),
                ...finalData,
                endTime: new Date().toISOString(),
                duration: finalData.finalGameTime ? finalData.finalGameTime * 1000 : 0,
              },
            ])
            setCurrentScreen("summary")
            setActiveGameData(finalData)
          }}
        />
      )
    }

    return (
      <Scoreboard
        players={players}
        setPlayers={setPlayers}
        onBack={handleBackToHome}
        mode={selectedGameMode}
        modeSettings={modeSettings}
      />
    )
  }

  if (currentScreen === "summary") {
    return (
      <GameSummary
        game={activeGameData}
        onDone={handleBackToHome}
        onViewHistory={() => setCurrentScreen("history")}
      />
    )
  }

  if (currentScreen === "history") {
    return <GameHistory gameHistory={gameHistory} onBack={() => setCurrentScreen("home")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">Ultimate Leaderboard</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create and manage competitive leaderboards for any game or activity. Track scores, celebrate winners, and
            keep the competition alive!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-emerald-600" />
                Quick Start
              </CardTitle>
              <CardDescription>Set up a new game in seconds with our intuitive interface</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStartNewGame} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Start New Game
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-500" />
                Multiplayer Ready
              </CardTitle>
              <CardDescription>Support for unlimited players with real-time score updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-500">∞</div>
              <p className="text-sm text-gray-600">Players supported</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Customizable
              </CardTitle>
              <CardDescription>Multiple game formats and scoring systems to fit your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Normal</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Tournament</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Custom</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Games */}
        {gameHistory && gameHistory.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Recent Games</h2>
              <button
                className="text-sm text-emerald-700 hover:underline"
                onClick={() => setCurrentScreen("history")}
              >
                View all
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {gameHistory
                .slice(-3)
                .reverse()
                .map((game) => {
                  const playersSorted = [...(game.players || [])].sort((a, b) => {
                    if (game.type === "league") {
                      if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0)
                      return (b.score || 0) - (a.score || 0)
                    }
                    return (b.score || 0) - (a.score || 0)
                  })
                  const winner = playersSorted[0]
                  const dateStr = game.endTime ? new Date(game.endTime).toLocaleString() : "";
                  return (
                    <div key={game.id} className="rounded-lg border bg-white p-4 flex items-center justify-between hover:shadow-md transition">
                      <div>
                        <div className="font-semibold text-gray-900">{game.name || "Untitled Game"}</div>
                        <div className="text-xs text-gray-500">{game.type} • {dateStr}</div>
                        {winner && (
                          <div className="mt-1 text-sm text-gray-800 flex items-center gap-2">
                            <span className="text-lg">{winner.avatar}</span>
                            <span className="font-medium">{winner.name}</span>
                            <span className="text-gray-500">{winner.score}</span>
                          </div>
                        )}
                      </div>
                      <button
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        onClick={() => {
                          setActiveGameData(game)
                          setCurrentScreen("summary")
                        }}
                      >
                        View
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="mb-6 opacity-90">Create your first leaderboard and start tracking scores today!</p>
              <Button
                onClick={handleStartNewGame}
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold"
              >
                Create Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
