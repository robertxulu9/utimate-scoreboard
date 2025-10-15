"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const GAMES_BY_CATEGORY = {
	"board-games": [
		{ key: "monopoly", name: "Monopoly" },
		{ key: "scrabble", name: "Scrabble" },
		{ key: "chess", name: "Chess" },
		{ key: "ludo", name: "Ludo" },
		{ key: "custom", name: "Custom game" },
	],
	"card-games": [
		{ key: "poker", name: "Poker" },
		{ key: "blackjack", name: "Blackjack" },
		{ key: "uno", name: "UNO" },
		{ key: "hearts", name: "Hearts" },
		{ key: "custom", name: "Custom game" },
	],
	sports: [
		{ key: "football", name: "Football" },
		{ key: "table-tennis", name: "Table Tennis" },
		{ key: "tennis", name: "Tennis" },
		{ key: "basketball", name: "Basketball" },
		{ key: "custom", name: "Custom game" },
	],
	"video-games": [
		{ key: "fifa", name: "Football" },
		{ key: "tennis-game", name: "Tennis" },
		{ key: "cod", name: "Call of Duty" },
		{ key: "mk", name: "Mortal Kombat" },
		{ key: "custom", name: "Custom game" },
	],
}

export default function GameSelection({ category, onSelect }) {
	const items = GAMES_BY_CATEGORY[category] || []
	if (!category) return null

	return (
		<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
			{items.map((g) => (
				<Card key={g.key} className="hover:shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">{g.name}</CardTitle>
					</CardHeader>
					<CardContent>
						<Button className="w-full" variant="outline" onClick={() => onSelect(g)}>
							Select {g.name}
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	)
}






