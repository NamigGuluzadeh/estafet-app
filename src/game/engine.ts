import { CLUBS, PLAYERS, Player, Pos } from '../data/players';

export const ROUNDS = 11;
export const OFFERS_PER_ROUND = 3;
export const DAILY_DRAFTS = 3;
export const TALENT_PER_TIER = 4; // tier 5 card = 20 talent
export const CHEM_PER_POINT = 5; // perfect link (3) = 15 chemistry

export interface Slot {
  id: string;
  pos: Pos;
  x: number; // 0..1 from left
  y: number; // 0..1 from top (attack at the top)
}

// 4-3-3
export const SLOTS: Slot[] = [
  { id: 'LW', pos: 'FWD', x: 0.17, y: 0.13 },
  { id: 'ST', pos: 'FWD', x: 0.5, y: 0.09 },
  { id: 'RW', pos: 'FWD', x: 0.83, y: 0.13 },
  { id: 'LM', pos: 'MID', x: 0.22, y: 0.4 },
  { id: 'CM', pos: 'MID', x: 0.5, y: 0.37 },
  { id: 'RM', pos: 'MID', x: 0.78, y: 0.4 },
  { id: 'LB', pos: 'DEF', x: 0.12, y: 0.66 },
  { id: 'LCB', pos: 'DEF', x: 0.37, y: 0.69 },
  { id: 'RCB', pos: 'DEF', x: 0.63, y: 0.69 },
  { id: 'RB', pos: 'DEF', x: 0.88, y: 0.66 },
  { id: 'GK', pos: 'GK', x: 0.5, y: 0.91 },
];

const idx = (id: string) => SLOTS.findIndex((s) => s.id === id);
const L = (a: string, b: string): [number, number] => [idx(a), idx(b)];

export const LINKS: [number, number][] = [
  L('LW', 'ST'), L('ST', 'RW'),
  L('LW', 'LM'), L('ST', 'CM'), L('RW', 'RM'),
  L('LM', 'CM'), L('CM', 'RM'),
  L('LM', 'LB'), L('CM', 'LCB'), L('CM', 'RCB'), L('RM', 'RB'),
  L('LB', 'LCB'), L('LCB', 'RCB'), L('RCB', 'RB'),
  L('LCB', 'GK'), L('RCB', 'GK'),
];

export type Lineup = (Player | null)[];

/** 0..3: same club 3, same nation + league 3, same nation 2, same league 1. */
export function linkScore(a: Player, b: Player): number {
  if (a.club === b.club) return 3;
  const la = CLUBS[a.club].league;
  const sameLeague = la !== null && la === CLUBS[b.club].league;
  const sameNat = a.nat === b.nat;
  if (sameNat && sameLeague) return 3;
  if (sameNat) return 2;
  if (sameLeague) return 1;
  return 0;
}

export interface Score {
  talent: number;
  chem: number;
  total: number;
  /** per LINKS entry; -1 while either end is empty */
  links: number[];
}

export function scoreLineup(lineup: Lineup): Score {
  const talent = lineup.reduce((s, p) => s + (p ? p.tier * TALENT_PER_TIER : 0), 0);
  const links = LINKS.map(([a, b]) => {
    const pa = lineup[a];
    const pb = lineup[b];
    return pa && pb ? linkScore(pa, pb) : -1;
  });
  const chem = links.reduce((s, v) => s + (v > 0 ? v * CHEM_PER_POINT : 0), 0);
  return { talent, chem, total: talent + chem, links };
}

export const MAX_SCORE = ROUNDS * 5 * TALENT_PER_TIER + LINKS.length * 3 * CHEM_PER_POINT;

/** Rank index 0..5 for a final score. Names live in i18n. */
export const RANK_THRESHOLDS = [0, 190, 225, 255, 285, 320];
export function rankFor(total: number): number {
  let r = 0;
  RANK_THRESHOLDS.forEach((t, i) => {
    if (total >= t) r = i;
  });
  return r;
}

// ---------- seeded randomness ----------

function hash(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weighted<T>(rng: () => number, items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, it) => s + weight(it), 0);
  let r = rng() * total;
  for (const it of items) {
    r -= weight(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

const TIER_WEIGHT: Record<number, number> = { 1: 14, 2: 30, 3: 30, 4: 18, 5: 8 };
const SYNERGY_CHANCE = 0.4;

/**
 * The three cards offered in a round. Deterministic for a given seed, round and
 * draft state, so everyone playing the same daily draft sees the same first round
 * and the same follow-ups for the same choices.
 */
export function generateOffers(
  seed: string,
  round: number,
  lineup: Lineup,
  seen: Set<number>,
): Player[] {
  const rng = mulberry32(hash(`${seed}#${round}`));
  const open: Record<Pos, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  SLOTS.forEach((s, i) => {
    if (!lineup[i]) open[s.pos]++;
  });
  const placed = lineup.filter((p): p is Player => !!p);
  const offers: Player[] = [];

  for (let n = 0; n < OFFERS_PER_ROUND; n++) {
    let pool = PLAYERS.filter(
      (p) => open[p.pos] > 0 && !seen.has(p.id) && !offers.includes(p),
    );
    if (pool.length === 0) break;

    if (placed.length > 0 && rng() < SYNERGY_CHANCE) {
      const syn = pool.filter((p) => placed.some((q) => q.club === p.club || q.nat === p.nat));
      if (syn.length > 0) pool = syn;
    }

    const positions = (Object.keys(open) as Pos[]).filter((pos) => pool.some((p) => p.pos === pos));
    const pos = weighted(rng, positions, (k) => open[k]);
    pool = pool.filter((p) => p.pos === pos);

    const tiers = [...new Set(pool.map((p) => p.tier))];
    const tier = weighted(rng, tiers, (t) => TIER_WEIGHT[t]);
    pool = pool.filter((p) => p.tier === tier);

    offers.push(pool[Math.floor(rng() * pool.length)]);
  }
  return offers;
}

export function openSlotsFor(lineup: Lineup, p: Player): number[] {
  return SLOTS.map((s, i) => (s.pos === p.pos && !lineup[i] ? i : -1)).filter((i) => i >= 0);
}

export function todayKey(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dailySeed(day: string, draftNo: number): string {
  return `estafet:${day}:${draftNo}`;
}
