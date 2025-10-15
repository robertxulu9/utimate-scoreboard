"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { saveGameResult } from "@/lib/leaderboard"

export default function GameSummary({ game, onDone, onViewHistory }) {
  if (!game) return null

  const sorted = [...(game.players || [])].sort((a, b) => b.score - a.score)
  const winner = sorted[0]

  // Persist result once when summary is shown
  const savedRef = useRef(false)
  useEffect(() => {
    if (savedRef.current) return
    if (!game || !Array.isArray(game.players)) return

    const players = game.players.map(p => ({ id: String(p.id), name: p.name }))
    const scores = Object.fromEntries(
      game.players.map(p => [String(p.id), Number(p.score) || 0])
    )

    ;(async () => {
      try {
        await saveGameResult({
          name: game.name || 'Untitled Game',
          mode: game.mode || game.type || 'normal',
          players,
          scores
        })
        savedRef.current = true
      } catch (e) {
        // swallow to avoid blocking UI
        // console.error('Failed to save game result', e)
      }
    })()
  }, [game])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              {game.name || "Game Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {winner && (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Winner</div>
                <div className="text-3xl font-bold flex items-center justify-center gap-3">
                  <span>{winner.avatar}</span>
                  <span>{winner.name}</span>
                  <span className="text-gray-500 text-xl">{winner.score}</span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {sorted.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <span className="font-bold">{p.score}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={onViewHistory}>View History</Button>
              <Button onClick={onDone}>Done</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




