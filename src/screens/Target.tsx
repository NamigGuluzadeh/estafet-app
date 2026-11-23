import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Option, SearchPicker } from '../components/SearchPicker';
import { DB_PLAYERS, DbPlayer, NATIONS } from '../data/db';
import { TARGET_PICKS, Target as TargetT, botTargetPicks, newTarget, statsOf, targetPool, total } from '../game/stats';
import { Strings, fill } from '../i18n';
import { C } from '../theme';

interface Props {
  t: Strings;
  onQuit: () => void;
}

const BOT_COLOR = '#57C7F2';

export function Target({ t, onQuit }: Props) {
  const [target, setTarget] = useState<TargetT>(newTarget);
  const [mine, setMine] = useState<DbPlayer[]>([]);
  const [picking, setPicking] = useState(false);

  // The bot decides up front; its picks stay hidden until you have made yours.
  const bots = useMemo(() => botTargetPicks(target, new Set()), [target]);
  const done = mine.length === TARGET_PICKS;

  const options: Option[] = useMemo(() => {
    const taken = new Set(mine.map((p) => p.id));
    return targetPool(target.key)
      .filter((p) => !taken.has(p.id))
      .map((p) => ({ key: String(p.id), label: p.label }));
  }, [target, mine]);

  const myTotal = total(mine, target.key);
  const botTotal = total(bots, target.key);
  const myGap = Math.abs(target.value - myTotal);
  const botGap = Math.abs(target.value - botTotal);
  const verdict = myGap === botGap ? t.draw : myGap < botGap ? t.youWin : t.botWins;
  const statLabel = target.key === 'goals' ? t.statGoals : t.statApps;

  function restart() {
    setTarget(newTarget());
    setMine([]);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={onQuit} accessibilityRole="button" hitSlop={10} style={styles.side}>
          <Text style={styles.quit}>‹ {t.quit}</Text>
        </Pressable>
        <Text style={styles.title}>{t.targetTitle}</Text>
        <View style={styles.side} />
      </View>

      <View style={styles.targetBox}>
        <Text style={styles.targetLabel}>{t.targetLabel}</Text>
        <Text style={styles.targetValue}>{target.value}</Text>
        <Text style={styles.targetStat}>{statLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.columns}>
        <Column
          name={t.you}
          color={C.lime}
          players={mine}
          reveal={done}
          statKey={target.key}
          hiddenLabel=""
          t={t}
          totalText={done ? `${myTotal} · ${fill(t.offBy, { n: myGap })}` : '?'}
        />
        <Column
          name={t.bot}
          color={BOT_COLOR}
          players={bots}
          reveal={done}
          statKey={target.key}
          hiddenLabel={t.hidden}
          t={t}
          totalText={done ? `${botTotal} · ${fill(t.offBy, { n: botGap })}` : '?'}
        />
      </ScrollView>

      {done && <Text style={styles.verdict}>{verdict}</Text>}

      <Pressable
        onPress={done ? restart : () => setPicking(true)}
        accessibilityRole="button"
        style={styles.primary}
      >
        <Text style={styles.primaryText}>
          {done ? t.newGame : fill(t.pickPlayer, { n: mine.length + 1 })}
        </Text>
      </Pressable>

      {picking && (
        <SearchPicker
          title={`${t.targetLabel}: ${target.value} · ${statLabel}`}
          placeholder={t.searchPlayer}
          closeLabel={t.close}
          emptyLabel={t.noMatch}
          options={options}
          onPick={(key) => {
            setMine([...mine, DB_PLAYERS[Number(key)]]);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </View>
  );
}

interface ColumnProps {
  name: string;
  color: string;
  players: DbPlayer[];
  reveal: boolean;
  statKey: 'goals' | 'apps';
  /** shown instead of the name while hidden; empty string means names are always visible */
  hiddenLabel: string;
  totalText: string;
  t: Strings;
}

function Column({ name, color, players, reveal, statKey, hiddenLabel, totalText, t }: ColumnProps) {
  const rows = Array.from({ length: TARGET_PICKS }, (_, i) => players[i] ?? null);
  return (
    <View style={[styles.column, { borderColor: color }]}>
      <Text style={[styles.colName, { color }]}>{name}</Text>
      {rows.map((p, i) => {
        const showName = p && (reveal || hiddenLabel === '');
        return (
          <View key={i} style={styles.slot}>
            <Text style={styles.slotName} numberOfLines={1}>
              {showName ? `${NATIONS[p.nat]?.flag ?? ''} ${p.name}` : p && hiddenLabel ? `● ${hiddenLabel}` : '—'}
            </Text>
            <Text style={styles.slotValue}>{p && reveal ? statsOf(p)[statKey] : p ? '?' : ''}</Text>
          </View>
        );
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t.sumLabel}</Text>
        <Text style={[styles.totalValue, { color }]}>{totalText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { minWidth: 70, paddingVertical: 6 },
  quit: { color: C.dim, fontSize: 15, fontWeight: '700' },
  title: { color: C.text, fontSize: 16, fontWeight: '900' },
  targetBox: {
    backgroundColor: C.panel, borderRadius: 14, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', paddingVertical: 12,
  },
  targetLabel: { color: C.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  targetValue: { color: C.lime, fontSize: 44, fontWeight: '900' },
  targetStat: { color: C.text, fontSize: 14, fontWeight: '700' },
  columns: { gap: 10 },
  column: { backgroundColor: C.panel, borderRadius: 14, borderWidth: 2, padding: 10, gap: 6 },
  colName: { fontSize: 15, fontWeight: '900' },
  slot: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, minHeight: 36, gap: 8,
  },
  slotName: { color: C.text, fontSize: 14, fontWeight: '700', flex: 1 },
  slotValue: { color: C.text, fontSize: 14, fontWeight: '900' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 2 },
  totalLabel: { color: C.dim, fontSize: 13, fontWeight: '800' },
  totalValue: { fontSize: 15, fontWeight: '900' },
  verdict: { color: C.lime, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  primary: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.lime },
  primaryText: { color: C.limeDark, fontWeight: '900', fontSize: 16 },
});
