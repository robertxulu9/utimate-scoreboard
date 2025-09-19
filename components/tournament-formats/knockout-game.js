"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Zap } from "lucide-react"

export default function KnockoutGame({
  players,
  setPlayers,
  triggerConfetti,
  matches,
  setMatches,
  currentRound,
  setCurrentRound,
}) {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [bracket, setBracket] = useState([])

  // Generate knockout bracket
  useEffect(() => {
    if (bracket.length === 0) {
      generateBracket()
    }
  }, [players])

  const generateBracket = () => {
    const playerList = [...players]

    // Pad to next power of 2 if needed
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(playerList.length)))
    while (playerList.length < nextPowerOf2) {
      playerList.push({ id: `bye-${playerList.length}`, name: "BYE", avatar: "⏭️", isBye: true })
    }

    const rounds = []
    let currentPlayers = [...playerList]
    let roundNum = 1

    while (currentPlayers.length > 1) {
      const roundMatches = []
      for (let i = 0; i < currentPlayers.length; i += 2) {
        const player1 = currentPlayers[i]
        const player2 = currentPlayers[i + 1]

        roundMatches.push({
          id: `knockout-${roundNum}-${i / 2}`,
          round: roundNum,
          player1: player1?.id || null,
          player2: player2?.id || null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          completed: false,
        })
      }

      rounds.push({
        round: roundNum,
        matches: roundMatches,
        name: getRoundName(roundNum, rounds.length + 1),
      })

      // Prepare next round (winners advance)
      currentPlayers = new Array(Math.floor(currentPlayers.length / 2))
      roundNum++
    }

    setBracket(rounds)
    setMatches(rounds.flatMap((r) => r.matches))
  }

  const getRoundName = (roundNum, totalRounds) => {
    const remaining = totalRounds - roundNum + 1
    if (remaining === 1) return "Final"
    if (remaining === 2) return "Semi-Final"
    if (remaining === 3) return "Quarter-Final"
    return `Round ${roundNum}`
  }

  const completeMatch = (matchId, player1Score, player2Score) => {
    const p1Score = Number.parseInt(player1Score) || 0
    const p2Score = Number.parseInt(player2Score) || 0

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        const winner = p1Score > p2Score ? match.player1 : match.player2
        return {
          ...match,
          player1Score: p1Score,
          player2Score: p2Score,
          winner,
          completed: true,
        }
      }
      return match
    })

    setMatches(updatedMatches)

    // Update bracket with winners
    const updatedBracket = bracket.map((round) => ({
      ...round,
      matches: round.matches.map((match) => {
        const updatedMatch = updatedMatches.find((m) => m.id === match.id)
        return updatedMatch || match
      }),
    }))

    setBracket(updatedBracket)
    triggerConfetti()
    setSelectedMatch(null)

    // Advance winner to next round
    advanceWinner(
      matchId,
      p1Score > p2Score
        ? matches.find((m) => m.id === matchId)?.player1
        : matches.find((m) => m.id === matchId)?.player2,
    )
  }

  const advanceWinner = (completedMatchId, winnerId) => {
    const completedMatch = matches.find((m) => m.id === completedMatchId)
    if (!completedMatch) return

    const nextRound = completedMatch.round + 1
    const nextRoundMatches = matches.filter((m) => m.round === nextRound)

    if (nextRoundMatches.length > 0) {
      const matchIndex = Math.floor(
        matches.filter((m) => m.round === completedMatch.round && m.id <= completedMatchId).length - 1,
      )
      const nextMatchIndex = Math.floor(matchIndex / 2)
      const nextMatch = nextRoundMatches[nextMatchIndex]

      if (nextMatch) {
        const updatedMatches = matches.map((match) => {
          if (match.id === nextMatch.id) {
            return {
              ...match,
              [matchIndex % 2 === 0 ? "player1" : "player2"]: winnerId,
            }
          }
          return match
        })
        setMatches(updatedMatches)
      }
    }
  }

  const getPlayerName = (playerId) => {
    if (!playerId) return "TBD"
    const player = players.find((p) => p.id === playerId)
    return player?.name || "BYE"
  }

  const getPlayerAvatar = (playerId) => {
    if (!playerId) return "❓"
    const player = players.find((p) => p.id === playerId)
    return player?.avatar || "⏭️"
  }

  const currentRoundBracket = bracket.find((r) => r.round === currentRound)
  const champion =
    bracket.length > 0 && bracket[bracket.length - 1].matches[0]?.winner
      ? players.find((p) => p.id === bracket[bracket.length - 1].matches[0].winner)
      : null

  return (
    <div className="space-y-6">
      {/* Tournament Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Knockout Tournament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold">{currentRoundBracket?.name || `Round ${currentRound}`}</p>
              <p className="text-sm text-muted-foreground">{bracket.length} rounds total</p>
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
                disabled={currentRound >= bracket.length}
                onClick={() => setCurrentRound((prev) => Math.min(bracket.length, prev + 1))}
              >
                Next Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Champion Display */}
      {champion && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Tournament Champion!</h2>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{champion.avatar}</span>
              <span className="text-2xl font-bold">{champion.name}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Round Matches */}
      {currentRoundBracket && (
        <Card>
          <CardHeader>
            <CardTitle>{currentRoundBracket.name} Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentRoundBracket.matches.map((match) => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {match.player1Score} - {match.player2Score}
                      </Badge>
                      {match.winner && <Badge variant="default">Winner: {getPlayerName(match.winner)}</Badge>}
                    </div>
                  ) : match.player1 &&
                    match.player2 &&
                    !getPlayerName(match.player1).includes("BYE") &&
                    !getPlayerName(match.player2).includes("BYE") ? (
                    <Button size="sm" onClick={() => setSelectedMatch(match)}>
                      Enter Score
                    </Button>
                  ) : (
                    <Badge variant="outline">Waiting</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tournament Bracket Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Bracket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bracket.map((round) => (
              <div key={round.round} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{round.name}</h3>
                <div className="grid gap-2">
                  {round.matches.map((match) => (
                    <div key={match.id} className="text-sm flex items-center justify-between bg-muted/50 p-2 rounded">
                      <span>
                        {getPlayerName(match.player1)} vs {getPlayerName(match.player2)}
                      </span>
                      {match.completed && (
                        <Badge variant="outline" className="text-xs">
                          {getPlayerName(match.winner)} wins
                        </Badge>
                      )}
                    </div>
                  ))}
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
