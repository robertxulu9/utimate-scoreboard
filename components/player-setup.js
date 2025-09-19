"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Minus, Play } from "lucide-react"

export default function PlayerSetup({ onSetup, onBack }) {
  const [playerCount, setPlayerCount] = useState(2)
  const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2"])

  const playerColors = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1", // indigo
  ]

  const updatePlayerCount = (newCount) => {
    const count = Math.max(2, Math.min(10, newCount))
    setPlayerCount(count)

    const newNames = [...playerNames]
    if (count > playerNames.length) {
      // Add new players
      for (let i = playerNames.length; i < count; i++) {
        newNames.push(`Player ${i + 1}`)
      }
    } else {
      // Remove excess players
      newNames.splice(count)
    }
    setPlayerNames(newNames)
  }

  const updatePlayerName = (index, name) => {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  const handleStartGame = () => {
    const players = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name: name.trim() || `Player ${index + 1}`,
      score: 0,
      color: playerColors[index % playerColors.length],
    }))
    onSetup(players)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Setup Players</h1>
            <p className="text-gray-600">Add players and customize their names</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Player Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player Count */}
            <div>
              <Label className="text-base font-medium">Number of Players</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updatePlayerCount(playerCount - 1)}
                  disabled={playerCount <= 2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{playerCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updatePlayerCount(playerCount + 1)}
                  disabled={playerCount >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Player Names */}
            <div>
              <Label className="text-base font-medium">Player Names</Label>
              <div className="space-y-3 mt-2">
                {playerNames.map((name, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: playerColors[index % playerColors.length] }}
                    />
                    <Input
                      value={name}
                      onChange={(e) => updatePlayerName(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Start Game Button */}
            <Button onClick={handleStartGame} className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
