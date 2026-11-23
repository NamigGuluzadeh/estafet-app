// Typed access to db.json, the player database imported from Wikidata (CC0)
// by scripts/import-wikidata.mjs. Re-run that script to refresh the data.
import { Pos } from './players';

interface RawDb {
  source: string;
  generated: string;
  nations: Record<string, [string, string]>;
  clubs: [string, string | null][];
  players: {
    n: string;
    nat: string;
    pos: Pos | null;
    b: number | null;
    f: number;
    caps: number | null;
    c: [number, number | null, number | null, number | null, number | null][];
  }[];
}

// require() keeps TypeScript from inferring a type for a multi-megabyte literal.
const raw = require('./db.json') as RawDb;

export interface Stint {
  club: number;
  start: number | null;
  end: number | null;
  apps: number | null;
  goals: number | null;
}

export interface DbPlayer {
  id: number;
  name: string;
  /** name, with birth year added when two players share a name */
  label: string;
  nat: string;
  pos: Pos | null;
  born: number | null;
  /** number of Wikipedia language editions: a rough measure of how well known */
  fame: number;
  caps: number | null;
  career: Stint[];
  clubs: Set<number>;
}

export const DB_INFO = { source: raw.source, generated: raw.generated };

export const DB_CLUBS = raw.clubs.map(([name, league]) => ({ name, league }));

export const NATIONS: Record<string, { name: string; flag: string }> = Object.fromEntries(
  Object.entries(raw.nations).map(([code, [name, flag]]) => [code, { name, flag }]),
);

const nameCount = new Map<string, number>();
raw.players.forEach((p) => nameCount.set(p.n, (nameCount.get(p.n) ?? 0) + 1));

export const DB_PLAYERS: DbPlayer[] = raw.players.map((p, id) => {
  const career = p.c.map(([club, start, end, apps, goals]) => ({ club, start, end, apps, goals }));
  return {
    id,
    name: p.n,
    label: (nameCount.get(p.n) ?? 0) > 1 && p.b ? `${p.n} (${p.b})` : p.n,
    nat: p.nat,
    pos: p.pos,
    born: p.b,
    fame: p.f,
    caps: p.caps,
    career,
    clubs: new Set(career.map((s) => s.club)),
  };
});

/** club index -> players who ever played there, most famous first */
export const CLUB_PLAYERS = new Map<number, DbPlayer[]>();
for (const p of DB_PLAYERS) {
  for (const club of p.clubs) {
    if (!CLUB_PLAYERS.has(club)) CLUB_PLAYERS.set(club, []);
    CLUB_PLAYERS.get(club)!.push(p);
  }
}
