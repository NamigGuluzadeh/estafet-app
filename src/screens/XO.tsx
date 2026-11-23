import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Crest, Flag } from '../components/Badges';
import { Option, SearchPicker } from '../components/SearchPicker';
import { Btn, Confetti, ModeHeader, PopIn, Stamp, TopBar } from '../components/ui';
import { DB_CLUBS, DB_PLAYERS, DbPlayer, NATIONS } from '../data/db';
import { Board, Cat, LINES, Owner, botMove, cellCats, matches, newBoard, outcome } from '../game/xo';
import { Strings, fill } from '../i18n';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  vsBot: boolean;
  onQuit: () => void;
}

/** Player 1 / you are red, player 2 / bot is ink. */
const P_COLOR = [C.accent, C.text];
const PLAYER_OPTIONS: Option[] = DB_PLAYERS.map((p) => ({ key: String(p.id), label: p.label }));

interface Game {
  board: Board;
  owners: Owner[];
  names: (DbPlayer | null)[];
  used: Set<number>;
  turn: 0 | 1;
  note: string;
}

const fresh = (): Game => ({
  board: newBoard(),
  owners: Array(9).fill(null),
  names: Array(9).fill(null),
  used: new Set(),
  turn: 0,
  note: '',
});

function winLine(owners: Owner[]): number[] {
  return LINES.find(([a, b, c]) => owners[a] !== null && owners[a] === owners[b] && owners[a] === owners[c]) ?? [];
}

export function XO({ t, vsBot, onQuit }: Props) {
  const [g, setG] = useState<Game>(fresh);
  const [picking, setPicking] = useState<number | null>(null);

  const labels = vsBot ? [t.you, t.bot] : [t.p1, t.p2];
  const result = useMemo(() => outcome(g.board, g.owners, g.used), [g]);
  const botTurn = vsBot && g.turn === 1 && !result.done;
  const line = result.done ? winLine(g.owners) : [];

  function claim(game: Game, cell: number, player: DbPlayer): Game {
    const owners = game.owners.slice();
    const names = game.names.slice();
    owners[cell] = game.turn;
    names[cell] = player;
    const used = new Set(game.used);
    used.add(player.id);
    return { ...game, owners, names, used, turn: game.turn === 0 ? 1 : 0, note: '' };
  }

  function answer(cell: number, playerId: number) {
    const player = DB_PLAYERS[playerId];
    const [r, c] = cellCats(g.board, cell);
    setPicking(null);
    if (!g.used.has(player.id) && matches(player, r) && matches(player, c)) {
      setG(claim(g, cell, player));
    } else {
      setG({ ...g, turn: g.turn === 0 ? 1 : 0, note: fill(t.wrong, { name: player.name }) });
    }
  }

  useEffect(() => {
    if (!botTurn) return;
    const timer = setTimeout(() => {
      setG((cur) => {
        const move = botMove(cur.board, cur.owners, cur.used);
        if (!move || !move.player) return { ...cur, turn: 0, note: t.botMiss };
        return claim(cur, move.cell, move.player);
      });
    }, 1100);
    return () => clearTimeout(timer);
  }, [botTurn, g.owners]);

  const counts = [0, 1].map((o) => g.owners.filter((x) => x === o).length);
  let status: string;
  if (result.done) status = result.winner === null ? t.draw : fill(t.winsMsg, { name: labels[result.winner] });
  else if (botTurn) status = t.botThinking;
  else status = fill(t.turnOf, { name: labels[g.turn] });
  const celebrate = result.done && result.winner !== null && (!vsBot || result.winner === 0);

  const pickTitle = picking === null ? '' : cellCats(g.board, picking).map((c) => catText(c, t)).join(' × ');

  return (
    <View style={{ flex: 1 }}>
      <TopBar backLabel={t.quit} onBack={onQuit} right={<Text style={styles.modeLabel}>{vsBot ? t.vsBot : t.twoPlayers}</Text>} />
      <ModeHeader icon="grid" title={t.xoTitle} n="01" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.scores}>
          {[0, 1].map((o) => (
            <View
              key={o}
              style={[
                styles.score,
                { borderTopColor: !result.done && g.turn === o ? P_COLOR[o] : 'transparent' },
                o === 1 && { borderLeftWidth: 2, borderLeftColor: C.divider },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: P_COLOR[o] }]} />
              <Text style={styles.scoreName}>{labels[o]}</Text>
              <Text style={styles.scoreCount}>{counts[o]}</Text>
            </View>
          ))}
        </View>

        <View style={{ minHeight: 46 }}>
          {result.done ? (
            <Stamp text={status} />
          ) : (
            <>
              <Text style={styles.status}>{status}</Text>
              <Text style={styles.note}>{g.note || t.tapCell}</Text>
            </>
          )}
        </View>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={[styles.rowHead, { backgroundColor: C.bg, minHeight: 80 }]} />
            {g.board.cols.map((c, i) => (
              <ColHead key={i} cat={c} t={t} />
            ))}
          </View>
          {g.board.rows.map((r, row) => (
            <View key={row} style={styles.gridRow}>
              <View style={styles.rowHead}>
                {r.kind === 'club' && <Crest name={DB_CLUBS[r.id].name} />}
                <Text style={styles.rowName} numberOfLines={3}>
                  {catText(r, t)}
                </Text>
              </View>
              {[0, 1, 2].map((col) => {
                const cell = row * 3 + col;
                const owner = g.owners[cell];
                const player = g.names[cell];
                const canTap = owner === null && !result.done && !botTurn;
                const win = line.includes(cell);
                return (
                  <Pressable
                    key={col}
                    disabled={!canTap}
                    onPress={() => setPicking(cell)}
                    accessibilityRole="button"
                    accessibilityLabel={player ? player.name : `${catText(r, t)} × ${catText(g.board.cols[col], t)}`}
                    style={({ pressed }) => [styles.cellWrap, pressed && { borderWidth: 2, borderColor: C.accent }]}
                  >
                    {owner === null ? (
                      <View style={[styles.cell, { backgroundColor: C.bg }]}>
                        <Text style={[styles.cellText, { color: C.n500 }]}>+</Text>
                      </View>
                    ) : (
                      <PopIn
                        trigger={player?.id}
                        style={[styles.cell, { backgroundColor: P_COLOR[owner] }, win && { borderWidth: 4, borderColor: owner === 0 ? C.text : C.accent }]}
                      >
                        <Text style={[styles.cellText, { color: C.bg }]} numberOfLines={3}>
                          {player?.name}
                        </Text>
                      </PopIn>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />
        {result.done ? (
          <Btn label={t.newGame} onPress={() => setG(fresh())} minHeight={52} fontSize={15} />
        ) : (
          <Btn
            label={t.pass}
            variant="secondary"
            disabled={botTurn}
            onPress={() => setG({ ...g, turn: g.turn === 0 ? 1 : 0, note: '' })}
            minHeight={52}
            fontSize={15}
          />
        )}
      </ScrollView>

      {picking !== null && (
        <SearchPicker
          title={pickTitle}
          placeholder={t.searchPlayer}
          closeLabel={t.close}
          emptyLabel={t.noMatch}
          options={PLAYER_OPTIONS}
          onPick={(key) => answer(picking, Number(key))}
          onClose={() => setPicking(null)}
        />
      )}
      <Confetti active={celebrate} />
    </View>
  );
}

function catText(c: Cat, t: Strings): string {
  if (c.kind === 'club') return DB_CLUBS[c.id].name;
  if (c.kind === 'nat') return NATIONS[c.id]?.name ?? c.id;
  return t.posFull[c.id];
}

function ColHead({ cat, t }: { cat: Cat; t: Strings }) {
  return (
    <View style={styles.colHead}>
      {cat.kind === 'nat' && <Flag code={cat.id} />}
      <Text style={styles.colCode}>{cat.kind === 'pos' ? t.pos[cat.id] : cat.kind === 'nat' ? cat.id : ''}</Text>
      <Text style={styles.colName} numberOfLines={2}>
        {catText(cat, t)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modeLabel: { fontFamily: F.body, fontSize: 12, color: C.n700 },
  body: { flexGrow: 1, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 16, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  scores: { flexDirection: 'row', borderWidth: 2, borderColor: C.divider },
  score: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 4 },
  swatch: { width: 12, height: 12 },
  scoreName: { flex: 1, fontFamily: F.heavy, fontSize: 15, color: C.text },
  scoreCount: { fontFamily: F.heavy, fontSize: 24, color: C.text },
  status: { fontFamily: F.heavy, fontSize: 20, color: C.text },
  note: { fontFamily: F.body, fontSize: 13, minHeight: 20, color: C.n700 },
  grid: { backgroundColor: C.text, borderWidth: 2, borderColor: C.text, gap: 2 },
  gridRow: { flexDirection: 'row', gap: 2 },
  rowHead: { width: 86, backgroundColor: C.surface, padding: 8, justifyContent: 'space-between', gap: 6 },
  rowName: { fontFamily: F.heavy, fontSize: 13, lineHeight: 15, color: C.text },
  colHead: { flex: 1, minWidth: 0, backgroundColor: C.surface, padding: 8, minHeight: 80, justifyContent: 'flex-end', gap: 2 },
  colCode: { fontFamily: F.heavy, fontSize: 20, lineHeight: 22, color: C.text },
  colName: { fontFamily: F.body, fontSize: 11, color: C.n700 },
  cellWrap: { flex: 1, minWidth: 0, height: 92, backgroundColor: C.bg },
  cell: { flex: 1, padding: 8, justifyContent: 'flex-end' },
  cellText: { fontFamily: F.heavy, fontSize: 13, lineHeight: 15 },
});
