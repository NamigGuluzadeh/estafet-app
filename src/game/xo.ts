import { CLUB_PLAYERS, DB_CLUBS, DB_PLAYERS, DbPlayer } from '../data/db';
import { Pos } from '../data/players';

export type Cat =
  | { kind: 'club'; id: number } // index into DB_CLUBS
  | { kind: 'nat'; id: string }
  | { kind: 'pos'; id: Pos };

export interface Board {
  rows: Cat[]; // 3 clubs
  cols: Cat[]; // 3 nations, sometimes one position
}

export type Owner = 0 | 1 | null;

/** A player counts for a club if they ever played for it. */
export function matches(p: DbPlayer, c: Cat): boolean {
  if (c.kind === 'club') return p.clubs.has(c.id);
  if (c.kind === 'nat') return p.nat === c.id;
  return p.pos === c.id;
}

export function cellCats(board: Board, cell: number): [Cat, Cat] {
  return [board.rows[Math.floor(cell / 3)], board.cols[cell % 3]];
}

export function answersFor(board: Board, cell: number, used: Set<number>): DbPlayer[] {
  const [r, c] = cellCats(board, cell);
  const pool = r.kind === 'club' ? CLUB_PLAYERS.get(r.id) ?? [] : DB_PLAYERS;
  return pool.filter((p) => !used.has(p.id) && matches(p, c));
}

function sample<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// Boards are built from well-known clubs and nations only, and every cell must have
// at least one answer a football fan can be expected to know.
const WELL_KNOWN = 45; // fame threshold for "a fan would know this player"
// A small database (the placeholder used before the Wikidata import) gets looser limits.
const SMALL_DB = DB_PLAYERS.length < 1000;
const MIN_CLUB_PLAYERS = SMALL_DB ? 5 : 150;
const MIN_NATION_PLAYERS = SMALL_DB ? 5 : 80;
// every cell needs this many well-known answers
const MIN_KNOWN_ANSWERS = SMALL_DB ? 1 : 2;

const BIG_CLUBS = [...CLUB_PLAYERS.entries()]
  .filter(([club, players]) => DB_CLUBS[club].league !== null && players.length >= MIN_CLUB_PLAYERS)
  .map(([club]) => club);

const natCount = new Map<string, number>();
DB_PLAYERS.forEach((p) => natCount.set(p.nat, (natCount.get(p.nat) ?? 0) + 1));
// GBR is left out: it only marks British players whose home nation is unknown.
const BIG_NATIONS = [...natCount.entries()]
  .filter(([code, n]) => n >= MIN_NATION_PLAYERS && code !== 'GBR')
  .map(([code]) => code);

const hasKnownAnswer = (club: number, c: Cat) =>
  (CLUB_PLAYERS.get(club) ?? []).filter((p) => p.fame >= WELL_KNOWN && matches(p, c)).length >=
  MIN_KNOWN_ANSWERS;

/** A random board on which every one of the nine cells has a well-known answer. */
export function newBoard(): Board {
  const positions: Pos[] = ['GK', 'DEF', 'MID', 'FWD'];
  for (let attempt = 0; attempt < 500; attempt++) {
    const cols: Cat[] = sample(BIG_NATIONS, 3).map((id) => ({ kind: 'nat', id }));
    if (Math.random() < 0.25) {
      cols[Math.floor(Math.random() * 3)] = { kind: 'pos', id: sample(positions, 1)[0] };
    }
    const fits = BIG_CLUBS.filter((club) => cols.every((c) => hasKnownAnswer(club, c)));
    if (fits.length < 3) continue;
    return { rows: sample(fits, 3).map((id) => ({ kind: 'club', id })), cols };
  }
  throw new Error('player database too small to build a board');
}

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function lineWinner(owners: Owner[]): Owner {
  for (const [a, b, c] of LINES) {
    if (owners[a] !== null && owners[a] === owners[b] && owners[a] === owners[c]) return owners[a];
  }
  return null;
}

export type Outcome = { done: false } | { done: true; winner: Owner };

/** Three in a row wins; when no cell can be claimed any more, most cells wins. */
export function outcome(board: Board, owners: Owner[], used: Set<number>): Outcome {
  const w = lineWinner(owners);
  if (w !== null) return { done: true, winner: w };
  const playable = owners.some((o, i) => o === null && answersFor(board, i, used).length > 0);
  if (playable) return { done: false };
  const a = owners.filter((o) => o === 0).length;
  const b = owners.filter((o) => o === 1).length;
  return { done: true, winner: a === b ? null : a > b ? 0 : 1 };
}

const BOT_ACCURACY = 0.7;

/** Bot plays as owner 1. Returns the cell it goes for and the player it names (null = it misses). */
export function botMove(
  board: Board,
  owners: Owner[],
  used: Set<number>,
): { cell: number; player: DbPlayer | null } | null {
  const open = owners
    .map((o, i) => (o === null && answersFor(board, i, used).length > 0 ? i : -1))
    .filter((i) => i >= 0);
  if (open.length === 0) return null;

  const completes = (who: Owner) =>
    open.find((cell) => {
      const next = owners.slice();
      next[cell] = who;
      return lineWinner(next) === who;
    });

  const cell =
    completes(1) ?? completes(0) ?? (open.includes(4) ? 4 : open[Math.floor(Math.random() * open.length)]);
  // The bot names one of the best-known answers, like a person would.
  const options = answersFor(board, cell, used).slice(0, 6);
  const player =
    Math.random() < BOT_ACCURACY ? options[Math.floor(Math.random() * options.length)] : null;
  return { cell, player };
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ø/g, 'o')
    .replace(/ł/g, 'l')
    .replace(/đ/g, 'd')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]/g, '');
}
