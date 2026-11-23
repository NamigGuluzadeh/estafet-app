import { DB_PLAYERS, DbPlayer } from '../data/db';

export type StatKey = 'goals' | 'apps' | 'caps' | 'age';

export interface PlayerStats {
  /** career league goals, summed over every club */
  goals: number | null;
  /** career league appearances */
  apps: number | null;
  /** senior international appearances */
  caps: number | null;
  /** birth year (for "who is older") */
  born: number | null;
}

const sum = (values: (number | null)[]): number | null => {
  const known = values.filter((v): v is number => v !== null);
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
};

const STATS = new Map<number, PlayerStats>();
for (const p of DB_PLAYERS) {
  const apps = sum(p.career.map((s) => s.apps));
  STATS.set(p.id, {
    // goals only count when appearances are recorded too, to skip half-filled careers
    goals: apps && apps >= 50 ? sum(p.career.map((s) => s.goals)) : null,
    apps: apps && apps >= 50 ? apps : null,
    caps: p.caps && p.caps > 0 ? p.caps : null,
    born: p.born,
  });
}

export const statsOf = (p: DbPlayer): PlayerStats => STATS.get(p.id)!;

/** The number a stat question compares. For "age" a bigger number means older. */
export function statValue(p: DbPlayer, key: StatKey): number | null {
  const s = statsOf(p);
  if (key === 'age') return s.born === null ? null : -s.born;
  return s[key];
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------------- higher or lower

const DUEL_FAME = 60;
const DUEL_KEYS: StatKey[] = ['goals', 'apps', 'caps', 'age'];

export interface Duel {
  key: StatKey;
  a: DbPlayer;
  b: DbPlayer;
}

/** Two well-known players and a stat on which they clearly differ. */
export function newDuel(avoid: Set<number> = new Set()): Duel {
  for (let attempt = 0; attempt < 500; attempt++) {
    const key = pick(DUEL_KEYS);
    const pool = DB_PLAYERS.filter(
      (p) => p.fame >= DUEL_FAME && !avoid.has(p.id) && statValue(p, key) !== null,
    );
    if (pool.length < 2) continue;
    const a = pick(pool);
    const b = pick(pool);
    if (a.id === b.id) continue;
    const va = statValue(a, key)!;
    const vb = statValue(b, key)!;
    // no near-ties: at least a year apart, or 15% apart for counting stats
    const gap = key === 'age' ? Math.abs(va - vb) >= 1 : Math.abs(va - vb) >= 0.15 * Math.max(va, vb, 1);
    // goals between two goalkeepers or defenders is a dull question
    if (key === 'goals' && Math.max(va, vb) < 30) continue;
    if (gap) return { key, a, b };
  }
  throw new Error('could not build a duel');
}

// ---------------------------------------------------------------- target

export type TargetKey = 'goals' | 'apps';
export const TARGET_PICKS = 5;
const TARGET_FAME = 70;

/** Players that can be picked in a target game (they have the stat recorded). */
export function targetPool(key: TargetKey): DbPlayer[] {
  // zero counts: a goalkeeper with no goals is a legitimate way to fine-tune a total
  return DB_PLAYERS.filter((p) => statsOf(p)[key] !== null);
}

export interface Target {
  key: TargetKey;
  value: number;
}

/** A target that five well-known players can actually add up to. */
export function newTarget(): Target {
  const key: TargetKey = Math.random() < 0.6 ? 'goals' : 'apps';
  const famous = targetPool(key).filter((p) => p.fame >= TARGET_FAME);
  let total = 0;
  for (let i = 0; i < TARGET_PICKS; i++) total += statsOf(pick(famous))[key]!;
  const step = key === 'goals' ? 10 : 50;
  return { key, value: Math.max(step, Math.round(total / step) * step) };
}

/** The bot picks four well-known players at random, then the best fifth it can think of. */
export function botTargetPicks(target: Target, taken: Set<number>): DbPlayer[] {
  const famous = targetPool(target.key).filter((p) => p.fame >= 55 && !taken.has(p.id));
  const picks: DbPlayer[] = [];
  while (picks.length < TARGET_PICKS - 1) {
    const p = pick(famous);
    if (!picks.includes(p)) picks.push(p);
  }
  const have = picks.reduce((s, p) => s + statsOf(p)[target.key]!, 0);
  const candidates = Array.from({ length: 25 }, () => pick(famous)).filter((p) => !picks.includes(p));
  candidates.sort(
    (a, b) =>
      Math.abs(target.value - have - statsOf(a)[target.key]!) -
      Math.abs(target.value - have - statsOf(b)[target.key]!),
  );
  picks.push(candidates[0]);
  return picks;
}

export function total(players: DbPlayer[], key: TargetKey): number {
  return players.reduce((s, p) => s + (statsOf(p)[key] ?? 0), 0);
}
