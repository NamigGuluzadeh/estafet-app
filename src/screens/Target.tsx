import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Option, SearchPicker } from '../components/SearchPicker';
import { Btn, Confetti, FlipIn, Kicker, ModeHeader, PopIn, Stamp, TopBar } from '../components/ui';
import { DB_PLAYERS, DbPlayer } from '../data/db';
import { TARGET_PICKS, Target as TargetT, botTargetPicks, newTarget, statsOf, targetPool, total } from '../game/stats';
import { Strings, fill } from '../i18n';
import { C, F } from '../theme';

interface Props {
  t: Strings;
  onQuit: () => void;
}

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
  const youWin = myGap < botGap;
  const draw = myGap === botGap;
  const verdict = draw ? t.draw : youWin ? t.youWin : t.botWins;
  const statLabel = target.key === 'goals' ? t.statGoals : t.statApps;

  function restart() {
    setTarget(newTarget());
    setMine([]);
  }

  const results = [
    { name: t.you, total: myTotal, gap: myGap, win: youWin || draw },
    { name: t.bot, total: botTotal, gap: botGap, win: !youWin && !draw },
  ];

  return (
    <View style={{ flex: 1 }}>
      <TopBar backLabel={t.quit} onBack={onQuit} />
      <ModeHeader icon="target" title={t.targetTitle} n="03" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.targetBox}>
          <Kicker>
            {t.targetLabel} · {statLabel}
          </Kicker>
          <Text style={styles.targetValue}>{target.value}</Text>
        </View>

        <View>
          {Array.from({ length: TARGET_PICKS }, (_, i) => {
            const p = mine[i] ?? null;
            return (
              <View key={i} style={styles.slot}>
                <Text style={styles.slotN}>{i + 1}</Text>
                {p ? (
                  <PopIn trigger={p.id} style={{ flex: 1, transformOrigin: 'left center' }}>
                    <Text style={styles.slotName} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </PopIn>
                ) : (
                  <Text style={[styles.slotName, { flex: 1, color: C.n400 }]}>—</Text>
                )}
                <Text style={[styles.slotVal, { color: done ? C.text : C.n600 }]}>
                  {p ? (done ? statsOf(p)[target.key] : t.hidden) : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {done && (
          <>
            <FlipIn style={styles.results}>
              {results.map((r, i) => {
                const bg = r.win ? (i === 0 ? C.accent : C.text) : C.bg;
                const fg = r.win ? C.bg : C.text;
                return (
                  <View key={i} style={[styles.result, { backgroundColor: bg }, i === 1 && { borderLeftWidth: 2, borderLeftColor: C.text }]}>
                    <Text style={[styles.resName, { color: fg }]}>{r.name}</Text>
                    <Text style={[styles.resTotal, { color: fg }]}>{r.total}</Text>
                    <Text style={[styles.resOff, { color: fg }]}>{fill(t.offBy, { n: r.gap })}</Text>
                  </View>
                );
              })}
            </FlipIn>
            <Stamp text={verdict} color={youWin ? C.accent : C.text} />
          </>
        )}

        <View style={{ flex: 1 }} />
        <Btn
          label={done ? t.newGame : fill(t.pickPlayer, { n: mine.length + 1 })}
          onPress={done ? restart : () => setPicking(true)}
          minHeight={52}
          fontSize={15}
        />
      </ScrollView>

      {picking && (
        <SearchPicker
          title={fill(t.pickPlayer, { n: mine.length + 1 })}
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
      <Confetti active={done && youWin} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  targetBox: { borderBottomWidth: 2, borderBottomColor: C.text, paddingBottom: 12 },
  targetValue: { fontFamily: F.heavy, fontSize: 88, lineHeight: 86, letterSpacing: -3.52, color: C.accent },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, borderBottomWidth: 1, borderBottomColor: C.divider },
  slotN: { width: 16, fontFamily: F.semi, fontSize: 12, color: C.n700 },
  slotName: { fontFamily: F.heavy, fontSize: 16, color: C.text },
  slotVal: { fontFamily: F.semi, fontSize: 14 },
  results: { flexDirection: 'row', borderWidth: 2, borderColor: C.text },
  result: { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  resName: { fontFamily: F.heavy, fontSize: 13 },
  resTotal: { fontFamily: F.heavy, fontSize: 28, lineHeight: 31 },
  resOff: { fontFamily: F.body, fontSize: 12 },
});
