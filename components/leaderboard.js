"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeaderboard } from '@/lib/leaderboard'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Leaderboard({ topN = 10, title = 'Leaderboard' }) {
	const [data, setData] = useState([])

	useEffect(() => {
		let mounted = true
		;(async () => {
			try {
				const lb = await getLeaderboard(topN)
				if (!mounted) return
				setData(lb.map(x => ({ name: x.name, score: x.score })))
			} catch (e) {
				// console.error('Failed to load leaderboard', e)
			}
		)()
		return () => { mounted = false }
	}, [topN])

	return (
		<Card className="bg-white/90">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div style={{ width: '100%', height: 320 }}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data}>
							<XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} height={50} />
							<YAxis />
							<Tooltip />
							<Bar dataKey="score" fill="#3b82f6" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}


