"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Users, Upload } from "lucide-react"
import { CrossPlatformHeader } from "@/components/cross-platform-header"
import { AdaptiveLoading } from "@/components/adaptive-loading"
import { usePlatform } from "@/hooks/use-platform"
import { useDeviceCapabilities } from "@/hooks/use-device-capabilities"
import { useMemoryManagement } from "@/hooks/use-memory-management"
import { cn } from "@/lib/utils"
import CategorySelection from "@/components/category-selection"
import GameSelection from "@/components/game-selection"

export default function GameSetup({ onStartGame, onBack }) {
  const [gameName, setGameName] = useState("")
  const [gameType, setGameType] = useState("normal")
  const [category, setCategory] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [scoringInfo, setScoringInfo] = useState("")
  const [players, setPlayers] = useState([{ id: 1, name: "", avatar: "🎮" }])
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile, isTablet } = usePlatform()
  const { triggerHapticFeedback } = useDeviceCapabilities()
  const { addTimer, isLowMemoryDevice } = useMemoryManagement()

  const avatarOptions = ["🎮", "🎯", "🎲", "🃏", "⚽", "🏀", "🎾", "🏆", "👑", "⭐", "🔥", "💎"]

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check for saved game state
      const savedState = localStorage.getItem("currentGameState")
      if (savedState) {
        const shouldRestore = confirm("Found a saved game in progress. Would you like to continue?")
        if (shouldRestore) {
          try {
            const gameState = JSON.parse(savedState)
            onStartGame(gameState)
            return
          } catch (error) {
            console.error("Failed to restore game state:", error)
            localStorage.removeItem("currentGameState")
          }
        }
      }
      setIsLoading(false)
    }, 300)

    return addTimer(timer)
  }, [onStartGame, addTimer])

  const addPlayer = () => {
    triggerHapticFeedback("light")
    const newPlayer = {
      id: Date.now(),
      name: "",
      avatar: avatarOptions[Math.floor(Math.random() * avatarOptions.length)],
    }
    setPlayers([...players, newPlayer])
  }

  const removePlayer = (id) => {
    if (players.length > 1) {
      triggerHapticFeedback("light")
      setPlayers(players.filter((p) => p.id !== id))
    }
  }

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleImportPlayers = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".txt,.csv"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const text = e.target.result
            const names = text
              .split(/[\n,]/)
              .map((name) => name.trim())
              .filter((name) => name)

            if (names.length > 0) {
              const importedPlayers = names.map((name, index) => ({
                id: Date.now() + index,
                name,
                avatar: avatarOptions[index % avatarOptions.length],
              }))

              setPlayers(importedPlayers)
              triggerHapticFeedback("success")
            }
          } catch (error) {
            triggerHapticFeedback("error")
            alert("Failed to import players. Please check the file format.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleStartGame = () => {
    const validPlayers = players.filter((p) => p.name.trim())
    if (validPlayers.length < 2) {
      triggerHapticFeedback("error")
      alert("Please add at least 2 players with names")
      return
    }

    triggerHapticFeedback("success")
    const gameData = {
      name: gameName || (selectedTemplate && selectedTemplate.key !== 'custom' ? selectedTemplate.name : "Untitled Game"),
      category,
      template: selectedTemplate?.key || null,
      type: gameType,
      scoringInfo,
      players: validPlayers.map((p) => ({
        ...p,
        score: 0,
        wins: 0,
        losses: 0,
      })),
      startTime: new Date(),
      history: [],
    }

    onStartGame(gameData)
  }

  if (isLoading) {
    return (
      <div className={cn("min-h-screen", { "pb-safe-area-inset-bottom": isMobile })}>
        <CrossPlatformHeader title="Setting Up..." onBack={onBack} canGoBack={true} />
        <div className="px-4 py-6">
          <AdaptiveLoading type="game-setup" count={2} />
        </div>
      </div>
    )
  }

  if (!category) {
    return <CategorySelection onSelect={setCategory} onBack={onBack} />
  }

  return (
    <div
      className={cn("min-h-screen", {
        "pb-safe-area-inset-bottom": isMobile,
      })}
    >
      <CrossPlatformHeader title="Game Setup" onBack={onBack} canGoBack={true} />

      <div
        className={cn("px-4", {
          "max-w-2xl mx-auto": !isMobile,
          "pb-6": isMobile,
        })}
      >
        <div className="space-y-6">
          {/* Category & Game Template */}
          <Card>
            <CardHeader>
              <CardTitle>Game Category</CardTitle>
              <CardDescription>Selected: {category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Choose a game</Label>
                <GameSelection
                  category={category}
                  onSelect={(g) => {
                    setSelectedTemplate(g)
                    if (g.key !== 'custom') setGameName(g.name)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Details */}
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
              <CardDescription>Configure your game settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gameName">Game Name</Label>
                <Input
                  id="gameName"
                  placeholder="Enter game name (e.g., Monopoly Night)"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                />
              </div>

              {selectedTemplate?.key === 'custom' && (
                <div>
                  <Label htmlFor="scoring">Scoring System</Label>
                  <Input
                    id="scoring"
                    placeholder="Describe how points are awarded"
                    value={scoringInfo}
                    onChange={(e) => setScoringInfo(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="gameType">Tournament Format</Label>
                <Select value={gameType} onValueChange={setGameType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Game</SelectItem>
                    <SelectItem value="league">League Format</SelectItem>
                    <SelectItem value="knockout">Knockout Tournament</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({players.length})
              </CardTitle>
              <CardDescription>Add players to your game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isMobile && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addPlayer} className="flex-1 bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                  <Button variant="outline" onClick={handleImportPlayers}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import List
                  </Button>
                </div>
              )}

              {isLowMemoryDevice && players.length > 10 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">{players.length} players added</p>
                  <Button variant="outline" onClick={() => setPlayers(players.slice(0, 10))}>
                    Show First 10 Players
                  </Button>
                </div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className={cn("flex items-center gap-3 p-3 border rounded-lg", {
                      "flex-col space-y-3": isMobile && players.length > 3,
                      "flex-row": !isMobile || players.length <= 3,
                    })}
                  >
                    <div className="text-2xl">{player.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <Input
                        placeholder={`Player ${index + 1} name`}
                        value={player.name}
                        onChange={(e) => updatePlayer(player.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={player.avatar} onValueChange={(value) => updatePlayer(player.id, "avatar", value)}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {avatarOptions.map((avatar) => (
                            <SelectItem key={avatar} value={avatar}>
                              {avatar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {players.length > 1 && (
                        <Button variant="outline" size="icon" onClick={() => removePlayer(player.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isMobile && (
                <Button variant="outline" onClick={addPlayer} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tournament Format Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                Format:{" "}
                {gameType === "normal"
                  ? "Normal Game"
                  : gameType === "league"
                    ? "League Format"
                    : "Knockout Tournament"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gameType === "normal" && (
                <p className="text-muted-foreground">
                  Simple scoreboard tracking. Perfect for most board games and casual play.
                </p>
              )}
              {gameType === "league" && (
                <p className="text-muted-foreground">
                  Round robin format with points, wins, and losses. Great for tournaments with multiple rounds.
                </p>
              )}
              {gameType === "knockout" && (
                <p className="text-muted-foreground">
                  Elimination bracket style. Players advance by winning matches until one champion remains.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Start Game */}
          <div
            className={cn({
              "sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 -mx-4": isMobile,
              "": !isMobile,
            })}
          >
            <Button onClick={handleStartGame} size="lg" className="w-full text-lg font-semibold">
              Start Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
