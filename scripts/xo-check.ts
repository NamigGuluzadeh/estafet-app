// Board variety check: `npx tsx scripts/xo-check.ts`
import { DB_CLUBS, DB_PLAYERS, NATIONS } from '../src/data/db';
import { answersFor, newBoard } from '../src/game/xo';
const seen = new Set<string>(); let min = 99;
const show = (c: any) => (c.kind === 'club' ? DB_CLUBS[c.id].name : c.kind === 'nat' ? NATIONS[c.id].name : c.id);
for (let i = 0; i < 300; i++) {
  const b = newBoard(); seen.add(JSON.stringify(b));
  for (let c = 0; c < 9; c++) min = Math.min(min, answersFor(b, c, new Set()).length);
  if (i < 5) console.log(b.rows.map(show).join(', '), ' x ', b.cols.map(show).join(', '),
    ' e.g.', answersFor(b, 0, new Set()).slice(0, 3).map((p) => p.name).join(' / '));
}
console.log('players', DB_PLAYERS.length, 'distinct boards', seen.size, '/300, min answers per cell', min);
