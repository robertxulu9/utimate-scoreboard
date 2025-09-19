"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Gamepad2, Spade, Trophy, Monitor } from "lucide-react"

export default function CategorySelection({ onSelect, onBack }) {
  const categories = [
    {
      id: "board-games",
      name: "Board Games",
      description: "Classic board games like Monopoly, Scrabble, Chess",
      icon: Trophy,
      color: "emerald",
    },
    {
      id: "card-games",
      name: "Card Games",
      description: "Poker, Blackjack, UNO, and other card games",
      icon: Spade,
      color: "red",
    },
    {
      id: "sports",
      name: "Sports",
      description: "Basketball, Soccer, Tennis, and physical activities",
      icon: Gamepad2,
      color: "blue",
    },
    {
      id: "video-games",
      name: "Video Games",
      description: "Console, PC, and mobile gaming competitions",
      icon: Monitor,
      color: "purple",
    },
  ]

  const getColorClasses = (color) => {
    const colorMap = {
      emerald: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
      red: "text-red-600 bg-red-50 hover:bg-red-100",
      blue: "text-blue-600 bg-blue-50 hover:bg-blue-100",
      purple: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    }
    return colorMap[color] || colorMap.emerald
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Select Category</h1>
            <p className="text-gray-600">Choose the type of game you want to play</p>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${getColorClasses(category.color)}`}
                onClick={() => onSelect(category.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8" />
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-transparent" variant="outline">
                    Select {category.name}
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
