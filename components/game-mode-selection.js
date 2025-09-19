"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Trophy, Target, Clock } from "lucide-react"

export default function GameModeSelection({ category, onSelect, onBack }) {
  const getGameModes = (category) => {
    const baseModes = [
      {
        id: "normal",
        name: "Normal Game",
        description: "Standard scoring with no time limit",
        icon: Users,
        color: "emerald",
      },
      {
        id: "tournament",
        name: "Tournament",
        description: "Elimination-style competition",
        icon: Trophy,
        color: "gold",
      },
      {
        id: "timed",
        name: "Timed Game",
        description: "Race against the clock",
        icon: Clock,
        color: "blue",
      },
      {
        id: "target-score",
        name: "Target Score",
        description: "First to reach the target wins",
        icon: Target,
        color: "red",
      },
    ]

    // Category-specific modes
    if (category === "sports") {
      return [
        ...baseModes,
        {
          id: "league",
          name: "League Play",
          description: "Round-robin tournament format",
          icon: Trophy,
          color: "purple",
        },
      ]
    }

    if (category === "card-games") {
      return [
        ...baseModes,
        {
          id: "rounds",
          name: "Best of Rounds",
          description: "Multiple rounds with cumulative scoring",
          icon: Users,
          color: "orange",
        },
      ]
    }

    return baseModes
  }

  const getColorClasses = (color) => {
    const colorMap = {
      emerald: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
      gold: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100",
      blue: "text-blue-600 bg-blue-50 hover:bg-blue-100",
      red: "text-red-600 bg-red-50 hover:bg-red-100",
      purple: "text-purple-600 bg-purple-50 hover:bg-purple-100",
      orange: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    }
    return colorMap[color] || colorMap.emerald
  }

  const getCategoryName = (category) => {
    const categoryMap = {
      "board-games": "Board Games",
      "card-games": "Card Games",
      sports: "Sports",
      "video-games": "Video Games",
    }
    return categoryMap[category] || category
  }

  const gameModes = getGameModes(category)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Select Game Mode</h1>
            <p className="text-gray-600">Choose how you want to play {getCategoryName(category)}</p>
          </div>
        </div>

        {/* Game Mode Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameModes.map((mode) => {
            const IconComponent = mode.icon
            return (
              <Card
                key={mode.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${getColorClasses(mode.color)}`}
                onClick={() => onSelect(mode.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6" />
                    {mode.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">{mode.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-transparent" variant="outline">
                    Select {mode.name}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
