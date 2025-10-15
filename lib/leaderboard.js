import { db } from './db';

export async function saveGameResult({ name, mode, players, scores }) {
	return db.gameResults.add({
		timestamp: Date.now(),
		name,
		mode,
		players,
		scores
	});
}

export async function getHistory(limit = 100) {
	return db.gameResults.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getLeaderboard(topN = 10) {
	const all = await db.gameResults.toArray();
	const totals = new Map(); // playerId -> { name, score }

	for (const g of all) {
		for (const p of g.players || []) {
			const s = (g.scores && g.scores[p.id]) || 0;
			const prev = totals.get(p.id) || { name: p.name, score: 0 };
			prev.score += s;
			totals.set(p.id, prev);
		}
	}

	return Array.from(totals.entries())
		.map(([playerId, v]) => ({ playerId, ...v }))
		.sort((a, b) => b.score - a.score)
		.slice(0, topN);
}


