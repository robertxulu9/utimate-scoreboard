"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Clock, Users, Search, Filter, Calendar } from "lucide-react"

export default function GameHistory({ gameHistory, onBack }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getWinner = (game) => {
    if (!game.players || game.players.length === 0) return null

    if (game.type === "knockout") {
      // For knockout, find the player who won the final
      const finalMatch = game.matches?.find((m) => m.round === Math.max(...(game.matches?.map((m) => m.round) || [1])))
      if (finalMatch?.winner) {
        return game.players.find((p) => p.id === finalMatch.winner)
      }
    }

    // For normal and league games, highest score wins
    return [...game.players].sort((a, b) => {
      if (game.type === "league") {
        // Sort by wins first, then by score
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.score - a.score
      }
      return b.score - a.score
    })[0]
  }

  // Filter and sort games
  const filteredGames = gameHistory
    .filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.players.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === "all" || game.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.endTime) - new Date(a.endTime)
        case "oldest":
          return new Date(a.endTime) - new Date(b.endTime)
        case "duration":
          return b.duration - a.duration
        case "players":
          return b.players.length - a.players.length
        default:
          return 0
      }
    })

  // Calculate statistics
  const totalGames = gameHistory.length
  const totalPlayTime = gameHistory.reduce((acc, game) => acc + game.duration, 0)
  const averageGameTime = totalGames > 0 ? totalPlayTime / totalGames : 0
  const gameTypeStats = {
    normal: gameHistory.filter((g) => g.type === "normal").length,
    league: gameHistory.filter((g) => g.type === "league").length,
    knockout: gameHistory.filter((g) => g.type === "knockout").length,
  }

  // Player statistics
  const playerStats = {}
  gameHistory.forEach((game) => {
    game.players.forEach((player) => {
      if (!playerStats[player.name]) {
        playerStats[player.name] = {
          name: player.name,
          avatar: player.avatar,
          gamesPlayed: 0,
          wins: 0,
          totalScore: 0,
        }
      }
      playerStats[player.name].gamesPlayed++
      playerStats[player.name].totalScore += player.score || 0

      const winner = getWinner(game)
      if (winner && winner.name === player.name) {
        playerStats[player.name].wins++
      }
    })
  })

  const topPlayers = Object.values(playerStats)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Game History</h1>
        </div>

        {/* Statistics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalGames}</div>
              <div className="text-sm text-muted-foreground">Total Games</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{formatDuration(totalPlayTime)}</div>
              <div className="text-sm text-muted-foreground">Total Play Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{formatDuration(averageGameTime)}</div>
              <div className="text-sm text-muted-foreground">Average Game</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-chart-4">{Object.keys(playerStats).length}</div>
              <div className="text-sm text-muted-foreground">Unique Players</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game History List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search games or players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="knockout">Knockout</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="duration">Longest Games</SelectItem>
                      <SelectItem value="players">Most Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Games List */}
            <div className="space-y-4">
              {filteredGames.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No games found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredGames.map((game) => {
                  const winner = getWinner(game)
                  return (
                    <Card key={game.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{game.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{game.type}</Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {game.players.length} players
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatDuration(game.duration)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{formatDate(game.endTime)}</p>
                          </div>
                          {winner && (
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <Trophy className="h-4 w-4 text-primary" />
                                <span className="font-semibold">Winner</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{winner.avatar}</span>
                                <span className="font-semibold">{winner.name}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Player scores */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {game.players.slice(0, 8).map((player) => (
                            <div key={player.id} className="flex items-center gap-2 text-sm">
                              <span>{player.avatar}</span>
                              <span className="truncate">{player.name}</span>
                              <span className="font-semibold ml-auto">{player.score}</span>
                            </div>
                          ))}
                          {game.players.length > 8 && (
                            <div className="text-sm text-muted-foreground">+{game.players.length - 8} more</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            {/* Game Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Normal Games</span>
                  <Badge variant="outline">{gameTypeStats.normal}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>League Games</span>
                  <Badge variant="outline">{gameTypeStats.league}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tournaments</span>
                  <Badge variant="outline">{gameTypeStats.knockout}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top Players */}
            {topPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Players</CardTitle>
                  <CardDescription>Most wins across all games</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPlayers.map((player, index) => (
                    <div key={player.name} className="flex items-center gap-3">
                      <span className="font-bold text-sm w-6">#{index + 1}</span>
                      <span className="text-xl">{player.avatar}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{player.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.wins} wins • {player.gamesPlayed} games
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
