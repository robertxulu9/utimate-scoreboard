"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target } from "lucide-react"

export default function LeagueGame({
  players,
  setPlayers,
  triggerConfetti,
  matches,
  setMatches,
  currentRound,
  setCurrentRound,
}) {
  const [selectedMatch, setSelectedMatch] = useState(null)

  // Generate round-robin matches if not already generated
  const generateMatches = () => {
    if (matches.length > 0) return matches

    const newMatches = []
    const playerList = [...players]

    // Round-robin algorithm
    for (let round = 0; round < playerList.length - 1; round++) {
      const roundMatches = []
      for (let i = 0; i < playerList.length / 2; i++) {
        const player1 = playerList[i]
        const player2 = playerList[playerList.length - 1 - i]
        if (player1 && player2) {
          roundMatches.push({
            id: `${round}-${i}`,
            round: round + 1,
            player1: player1.id,
            player2: player2.id,
            player1Score: 0,
            player2Score: 0,
            completed: false,
          })
        }
      }
      newMatches.push(...roundMatches)

      // Rotate players (except first one)
      const temp = playerList[1]
      for (let i = 1; i < playerList.length - 1; i++) {
        playerList[i] = playerList[i + 1]
      }
      playerList[playerList.length - 1] = temp
    }

    setMatches(newMatches)
    return newMatches
  }

  const allMatches = generateMatches()
  const currentRoundMatches = allMatches.filter((match) => match.round === currentRound)

  const completeMatch = (matchId, player1Score, player2Score) => {
    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return {
          ...match,
          player1Score: Number.parseInt(player1Score) || 0,
          player2Score: Number.parseInt(player2Score) || 0,
          completed: true,
        }
      }
      return match
    })

    setMatches(updatedMatches)

    // Update player stats
    const match = matches.find((m) => m.id === matchId)
    const p1Score = Number.parseInt(player1Score) || 0
    const p2Score = Number.parseInt(player2Score) || 0

    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === match.player1) {
          return {
            ...player,
            score: player.score + p1Score,
            wins: player.wins + (p1Score > p2Score ? 1 : 0),
            losses: player.losses + (p1Score < p2Score ? 1 : 0),
          }
        }
        if (player.id === match.player2) {
          return {
            ...player,
            score: player.score + p2Score,
            wins: player.wins + (p2Score > p1Score ? 1 : 0),
            losses: player.losses + (p2Score < p1Score ? 1 : 0),
          }
        }
        return player
      }),
    )

    triggerConfetti()
    setSelectedMatch(null)
  }

  const getPlayerName = (playerId) => {
    return players.find((p) => p.id === playerId)?.name || "Unknown"
  }

  const getPlayerAvatar = (playerId) => {
    return players.find((p) => p.id === playerId)?.avatar || "🎮"
  }

  // Calculate league table
  const leagueTable = [...players].sort((a, b) => {
    // Sort by wins first, then by total score
    if (b.wins !== a.wins) return b.wins - a.wins
    return b.score - a.score
  })

  const totalRounds = players.length - 1
  const completedMatches = matches.filter((m) => m.completed).length
  const totalMatches = matches.length

  return (
    <div className="space-y-6">
      {/* League Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            League Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Round {currentRound} of {totalRounds}
              </p>
              <p className="text-sm text-muted-foreground">
                Matches completed: {completedMatches}/{totalMatches}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentRound <= 1}
                onClick={() => setCurrentRound((prev) => Math.max(1, prev - 1))}
              >
                Previous Round
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentRound >= totalRounds}
                onClick={() => setCurrentRound((prev) => Math.min(totalRounds, prev + 1))}
              >
                Next Round
              </Button>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Round Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Round {currentRound} Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentRoundMatches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getPlayerAvatar(match.player1)}</span>
                  <span className="font-semibold">{getPlayerName(match.player1)}</span>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getPlayerAvatar(match.player2)}</span>
                  <span className="font-semibold">{getPlayerName(match.player2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {match.completed ? (
                  <Badge variant="secondary">
                    {match.player1Score} - {match.player2Score}
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => setSelectedMatch(match)}>
                    Enter Score
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* League Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leagueTable.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg w-8">#{index + 1}</span>
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="font-semibold">{player.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold">{player.wins}</div>
                    <div className="text-muted-foreground">W</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{player.losses}</div>
                    <div className="text-muted-foreground">L</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{player.score}</div>
                    <div className="text-muted-foreground">Pts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score Entry Modal */}
      {selectedMatch && (
        <Card className="fixed inset-4 z-50 max-w-md mx-auto my-auto bg-background border-2">
          <CardHeader>
            <CardTitle>Enter Match Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl mb-2">{getPlayerAvatar(selectedMatch.player1)}</div>
                <div className="font-semibold">{getPlayerName(selectedMatch.player1)}</div>
                <Input type="number" placeholder="Score" className="w-20 mt-2 text-center" id="player1Score" />
              </div>
              <div className="text-muted-foreground font-bold">VS</div>
              <div className="text-center">
                <div className="text-2xl mb-2">{getPlayerAvatar(selectedMatch.player2)}</div>
                <div className="font-semibold">{getPlayerName(selectedMatch.player2)}</div>
                <Input type="number" placeholder="Score" className="w-20 mt-2 text-center" id="player2Score" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const p1Score = document.getElementById("player1Score").value
                  const p2Score = document.getElementById("player2Score").value
                  completeMatch(selectedMatch.id, p1Score, p2Score)
                }}
                className="flex-1"
              >
                Complete Match
              </Button>
              <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
