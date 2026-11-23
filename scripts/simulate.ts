// Sanity check + balance simulation: `npx tsx scripts/simulate.ts`
import { PLAYERS } from '../src/data/players';
import {
  generateOffers, Lineup, openSlotsFor, ROUNDS, scoreLineup, SLOTS, MAX_SCORE,
} from '../src/game/engine';

function play(seed: string, strategy: 'random' | 'greedy'): number {
  const lineup: Lineup = SLOTS.map(() => null);
  const seen = new Set<number>();
  for (let r = 0; r < ROUNDS; r++) {
    const offers = generateOffers(seed, r, lineup, seen);
    if (offers.length !== 3 && r < ROUNDS - 1) throw new Error(`round ${r}: ${offers.length} offers`);
    offers.forEach((o) => seen.add(o.id));
    let best = { score: -1, p: offers[0], slot: openSlotsFor(lineup, offers[0])[0] };
    for (const p of offers) {
      for (const slot of openSlotsFor(lineup, p)) {
        const next = lineup.slice();
        next[slot] = p;
        const s = strategy === 'greedy' ? scoreLineup(next).total : Math.random();
        if (s > best.score) best = { score: s, p, slot };
      }
    }
    if (best.slot === undefined) throw new Error('no slot for offer');
    lineup[best.slot] = best.p;
  }
  if (lineup.some((p) => !p)) throw new Error('lineup incomplete');
  return scoreLineup(lineup).total;
}

const pct = (a: number[], q: number) => a[Math.floor((a.length - 1) * q)];
console.log('players', PLAYERS.length, 'max', MAX_SCORE);
for (const strat of ['random', 'greedy'] as const) {
  const res: number[] = [];
  for (let i = 0; i < 2000; i++) res.push(play(`sim:${i}`, strat));
  res.sort((a, b) => a - b);
  console.log(strat, 'p10', pct(res, 0.1), 'p50', pct(res, 0.5), 'p90', pct(res, 0.9), 'max', res[res.length - 1]);
}
const a = play('same', 'greedy');
const b = play('same', 'greedy');
console.log('deterministic', a === b);
