import Dexie from 'dexie';

export const db = new Dexie('ultimate-scoreboard');
db.version(1).stores({
	gameResults: '++id,timestamp,mode'
});

// Schema notes:
// gameResults row shape:
// {
//   id?: number,                // autoincrement
//   timestamp: number,          // Date.now()
//   mode: 'normal'|'league'|'knockout',
//   players: Array<{ id: string, name: string }>,
//   scores: Record<string, number>  // playerId -> score
// }


