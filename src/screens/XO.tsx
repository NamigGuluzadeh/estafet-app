import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Option, SearchPicker } from '../components/SearchPicker';
import { DB_CLUBS, DB_PLAYERS, DbPlayer, NATIONS } from '../data/db';
import { Board, Cat, Owner, botMove, cellCats, matches, newBoard, outcome } from '../game/xo';
import { Strings, fill } from '../i18n';
import { C } from '../theme';

interface Props {
  t: Strings;
  vsBot: boolean;
  onQuit: () => void;
}

const P_COLOR = [C.lime, '#57C7F2'];
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

export function XO({ t, vsBot, onQuit }: Props) {
  const [g, setG] = useState<Game>(fresh);
  const [picking, setPicking] = useState<number | null>(null);

  const labels = vsBot ? [t.you, t.bot] : [t.p1, t.p2];
  const result = useMemo(() => outcome(g.board, g.owners, g.used), [g]);
  const botTurn = vsBot && g.turn === 1 && !result.done;

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

  const pickTitle =
    picking === null ? '' : cellCats(g.board, picking).map((c) => catText(c, t)).join('  ×  ');

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onQuit} accessibilityRole="button" hitSlop={10} style={styles.side}>
          <Text style={styles.quit}>‹ {t.quit}</Text>
        </Pressable>
        <Text style={styles.title}>{t.xoTitle}</Text>
        <View style={styles.side} />
      </View>

      <View style={styles.scoreRow}>
        {[0, 1].map((o) => (
          <View
            key={o}
            style={[styles.scoreBox, !result.done && g.turn === o && { borderColor: P_COLOR[o] }]}
          >
            <Text style={[styles.scoreName, { color: P_COLOR[o] }]}>{labels[o]}</Text>
            <Text style={styles.scoreValue}>{counts[o]}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.status, result.done && { color: C.lime, fontSize: 20 }]}>{status}</Text>
      <Text style={styles.note}>{g.note || (result.done ? '' : t.tapCell)}</Text>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <View style={styles.corner} />
          {g.board.cols.map((c, i) => (
            <CatCell key={i} cat={c} t={t} />
          ))}
        </View>
        {g.board.rows.map((r, row) => (
          <View key={row} style={styles.gridRow}>
            <CatCell cat={r} t={t} />
            {[0, 1, 2].map((col) => {
              const cell = row * 3 + col;
              const owner = g.owners[cell];
              const player = g.names[cell];
              const canTap = owner === null && !result.done && !botTurn;
              return (
                <Pressable
                  key={col}
                  disabled={!canTap}
                  onPress={() => setPicking(cell)}
                  accessibilityRole="button"
                  accessibilityLabel={player ? player.name : `cell ${cell + 1}`}
                  style={[styles.cell, owner !== null && { backgroundColor: P_COLOR[owner], borderColor: P_COLOR[owner] }]}
                >
                  {player ? (
                    <Text style={styles.cellName} numberOfLines={2}>{player.name}</Text>
                  ) : (
                    <Text style={styles.plus}>+</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {result.done ? (
          <Pressable onPress={() => setG(fresh())} accessibilityRole="button" style={[styles.btn, styles.primary]}>
            <Text style={[styles.btnText, { color: C.limeDark }]}>{t.newGame}</Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={botTurn}
            onPress={() => setG({ ...g, turn: g.turn === 0 ? 1 : 0, note: '' })}
            accessibilityRole="button"
            style={[styles.btn, botTurn && { opacity: 0.4 }]}
          >
            <Text style={styles.btnText}>{t.pass}</Text>
          </Pressable>
        )}
      </View>

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
    </View>
  );
}

function catText(c: Cat, t: Strings): string {
  if (c.kind === 'club') return DB_CLUBS[c.id].name;
  if (c.kind === 'nat') return `${NATIONS[c.id]?.flag ?? ''} ${c.id}`;
  return t.posFull[c.id];
}

function CatCell({ cat, t }: { cat: Cat; t: Strings }) {
  return (
    <View style={styles.cat}>
      {cat.kind === 'nat' && <Text style={styles.catFlag}>{NATIONS[cat.id]?.flag ?? ''}</Text>}
      {cat.kind === 'pos' && <Text style={styles.catBig}>{t.pos[cat.id]}</Text>}
      <Text style={cat.kind === 'pos' ? styles.catSmall : styles.catText} numberOfLines={2}>
        {cat.kind === 'club' ? DB_CLUBS[cat.id].name : cat.kind === 'nat' ? cat.id : t.posFull[cat.id]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { minWidth: 70, paddingVertical: 6 },
  quit: { color: C.dim, fontSize: 15, fontWeight: '700' },
  title: { color: C.text, fontSize: 16, fontWeight: '900' },
  scoreRow: { flexDirection: 'row', gap: 8 },
  scoreBox: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.panel, borderRadius: 12, borderWidth: 2, borderColor: C.panel,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  scoreName: { fontSize: 15, fontWeight: '900' },
  scoreValue: { color: C.text, fontSize: 22, fontWeight: '900' },
  status: { color: C.text, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  note: { color: C.dim, fontSize: 13, textAlign: 'center', minHeight: 18 },
  grid: { gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6 },
  corner: { flex: 1 },
  cat: {
    flex: 1, aspectRatio: 1, backgroundColor: C.panelHi, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', padding: 4,
  },
  catFlag: { fontSize: 24 },
  catText: { color: C.text, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  catBig: { color: C.text, fontSize: 20, fontWeight: '900' },
  catSmall: { color: C.dim, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  cell: {
    flex: 1, aspectRatio: 1, backgroundColor: C.panel, borderRadius: 12, borderWidth: 2, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center', padding: 4,
  },
  cellName: { color: '#10161F', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  plus: { color: C.dim, fontSize: 26, fontWeight: '300' },
  actions: { flexDirection: 'row', marginTop: 4 },
  btn: {
    flex: 1, minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.panel, borderWidth: 1, borderColor: C.line,
  },
  primary: { backgroundColor: C.lime, borderColor: C.lime },
  btnText: { color: C.text, fontWeight: '900', fontSize: 15 },
});
